import { createServiceClient } from "@/lib/supabase/service";
import { logQueryError } from "@/lib/supabase/public";
import { verifyWebhookSignature } from "@/lib/razorpay";

// The ONLY trustworthy account of whether a booking was paid for.
//
// Payment happens on a hosted Razorpay Payment Page, away from this site, and
// this application has no Razorpay API credentials to ask after the fact. The
// customer returning to /consulting/paid proves nothing -- anyone can type that
// URL. So a booking is confirmed here or not at all.
//
// Matching works because the booker prefills a `booking_id` custom field on the
// page, and Razorpay returns custom field values in the payment's `notes`. If
// that field is missing from the page, every payment arrives unmatched.

export const runtime = "nodejs"; // node:crypto
export const dynamic = "force-dynamic";

type PaymentEntity = {
  id?: string;
  order_id?: string;
  amount?: number;
  error_description?: string | null;
  notes?: Record<string, string> | null;
};

type RazorpayWebhook = {
  event: string;
  payload?: { payment?: { entity?: PaymentEntity } };
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Finds the booking reference in the payment's notes.
 *
 * Razorpay derives the notes key from however the custom field on the Payment
 * Page was labelled, and that is set by hand in their dashboard -- so matching on
 * one exact key would turn a label typo into payments that silently never
 * confirm. The expected key is tried first; after that, any note value that is a
 * uuid is taken, because the booking id is the only uuid the page ever carries.
 */
function bookingIdFrom(notes: Record<string, string> | null | undefined): string | null {
  if (!notes) return null;
  const preferred = notes.booking_id;
  if (typeof preferred === "string" && UUID.test(preferred.trim())) return preferred.trim();
  for (const value of Object.values(notes)) {
    if (typeof value === "string" && UUID.test(value.trim())) return value.trim();
  }
  return null;
}

export async function POST(request: Request) {
  // MUST be first: request.text() consumes the stream, and the signature is over
  // the exact bytes Razorpay sent. JSON.stringify(JSON.parse(raw)) reorders keys
  // and drops whitespace, and the HMAC will not match.
  //
  // There is no `config.api.bodyParser` in the App Router -- that is a Pages
  // Router construct and adding it does nothing.
  const raw = await request.text();

  if (!verifyWebhookSignature(raw, request.headers.get("x-razorpay-signature"))) {
    return new Response("Invalid signature", { status: 400 });
  }

  // Deliberately NO rate limiter, diverging from the house rule for public
  // routes. Razorpay retries failed deliveries with backoff for 24 hours, so a
  // 429 would turn a spike into a retry storm and could lose a confirmation --
  // and a lost confirmation here means a paying customer with no booking.
  // The HMAC above is the gate.

  let payload: RazorpayWebhook;
  try {
    payload = JSON.parse(raw) as RazorpayWebhook;
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  const entity = payload.payload?.payment?.entity;
  const bookingId = bookingIdFrom(entity?.notes);
  const paymentId = entity?.id;

  // Anything unrecognised gets a 200. A 5xx here makes Razorpay retry for a day.
  if (!bookingId || !paymentId) {
    // Worth shouting about: a real payment arrived that cannot be matched to a
    // booking. Almost always means the booking_id custom field is missing from
    // the Payment Page, and it means somebody has paid for nothing.
    if (payload.event === "payment.captured" || payload.event === "order.paid") {
      console.error(
        "[razorpay/webhook] UNMATCHED PAYMENT",
        paymentId ?? "(no id)",
        "-- no booking_id in notes. Check the Payment Page has a booking_id custom field.",
        JSON.stringify(entity?.notes ?? {})
      );
    }
    return Response.json({ ok: true, ignored: payload.event });
  }

  // Without the service key nothing can be written, and this is the only route
  // that can ever confirm a payment. Return 500 ON PURPOSE: Razorpay retries for
  // 24 hours, so a key added within the day still lands the confirmation rather
  // than losing a paying customer's booking.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "[razorpay/webhook] SUPABASE_SERVICE_ROLE_KEY is not set -- cannot confirm booking",
      bookingId,
      "-- Razorpay will retry; set the key."
    );
    return new Response("Not configured", { status: 500 });
  }

  // Razorpay's servers call this; there is no admin cookie for a session client,
  // and anon has been revoked on consultation_bookings entirely. The HMAC is
  // what makes the service client safe here.
  const supabase = createServiceClient();

  if (payload.event === "payment.failed") {
    // Only from pending. A failed first attempt followed by a successful retry
    // is normal, and the two webhooks can arrive out of order -- never downgrade
    // a booking that is already confirmed.
    const { error } = await supabase
      .from("consultation_bookings")
      .update({
        status: "payment_failed",
        last_payment_error: entity?.error_description ?? null,
      })
      .eq("id", bookingId)
      .eq("status", "pending_payment");

    if (error) logQueryError("razorpay/webhook payment.failed", error);
    return Response.json({ ok: true });
  }

  if (payload.event === "payment.captured" || payload.event === "order.paid") {
    const { data, error } = await supabase
      .rpc("confirm_consultation_booking", {
        p_booking_id: bookingId,
        p_payment_id: paymentId,
        p_amount_paise: entity?.amount ?? undefined,
        p_order_id: entity?.order_id ?? undefined,
      })
      .maybeSingle();

    if (error) {
      // An amount mismatch means the Payment Page's price and the session's
      // price have drifted apart. The money is already taken, so this needs a
      // human -- but returning 5xx would make Razorpay retry a request that
      // will fail identically every time.
      if (error.message.includes("amount_mismatch")) {
        console.error(
          "[razorpay/webhook] AMOUNT MISMATCH on booking",
          bookingId,
          "payment",
          paymentId,
          `paid ${entity?.amount} paise. The Payment Page price and the session price disagree.`
        );
        await supabase
          .from("consultation_bookings")
          .update({
            razorpay_payment_id: paymentId,
            last_payment_error: `Amount mismatch: paid ${entity?.amount} paise`,
          })
          .eq("id", bookingId);
        return Response.json({ ok: true, mismatch: true });
      }

      logQueryError("razorpay/webhook confirm", error);
      // A genuine database failure IS worth a retry -- the one case where a 5xx
      // helps rather than storms.
      return new Response("Confirm failed", { status: 500 });
    }

    if (data?.needs_refund) {
      // The slot was resold while this payment was in flight, so the money is
      // not owed. THIS CANNOT BE REFUNDED AUTOMATICALLY -- refunds need API
      // credentials this application does not have. It is flagged instead, and
      // shows up in the admin's Needs attention tab for a human to refund in the
      // Razorpay dashboard.
      console.error(
        "[razorpay/webhook] REFUND REQUIRED -- booking",
        data.booking_id,
        "payment",
        paymentId,
        "was paid for a slot that had already gone. Refund this in the Razorpay dashboard."
      );
    }

    return Response.json({
      ok: true,
      alreadyConfirmed: data?.was_already_confirmed ?? false,
    });
  }

  return Response.json({ ok: true, ignored: payload.event });
}
