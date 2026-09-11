import { NextResponse } from "next/server";
import { z } from "zod";
import { createPublicClient, logQueryError } from "@/lib/supabase/public";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { metaCaptureSchema } from "@/lib/metaCapture";
import { sendMetaEvent } from "@/lib/metaCapi";
import { buildPaymentPageUrl } from "@/lib/razorpay";
import { BOOKING_COOKIE, bookingCookieOptions } from "@/lib/consulting/cookie";

// Holds the slot, then hands back the hosted Razorpay Payment Page URL for the
// browser to navigate to. No Razorpay API call happens here -- there are no
// credentials -- so this route needs no secrets at all.

const holdSchema = z.object({
  start: z.string().datetime({ offset: true }),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(1).max(50),
  notes: z.string().trim().max(2000).optional(),
  timezone: z.string().trim().max(100).optional(),
  meta: metaCaptureSchema.optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`consult-hold:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  const { slug } = await params;
  const body = await request.json().catch(() => null);
  const parsed = holdSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }
  const { start, name, email, phone, notes, timezone, meta } = parsed.data;

  const supabase = createPublicClient();

  // The page URL is needed to send the guest anywhere, and the RPC refuses to
  // take a slot for a paid session that has no page -- but read it first so a
  // missing page is reported as configuration, not as a booking failure.
  const { data: type } = await supabase
    .from("consultation_types")
    .select("slug, title, price_inr, payment_page_url")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!type) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (type.price_inr > 0 && !type.payment_page_url) {
    console.error(`[consulting/hold] ${slug} has no payment_page_url set`);
    return NextResponse.json(
      { error: "Booking is temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .rpc("hold_consultation_slot", {
      p_slug: slug,
      p_start: start,
      p_name: name,
      p_email: email,
      p_phone: phone,
      p_notes: notes,
      p_timezone: timezone,
      p_fbp: meta?.fbp ?? undefined,
      p_fbc: meta?.fbc ?? undefined,
      p_fb_event_id: meta?.eventId,
      p_event_source_url: meta?.eventSourceUrl,
    })
    .maybeSingle();

  if (error) {
    if (error.message.includes("slot_unavailable")) {
      return NextResponse.json(
        { error: "slot_unavailable", message: "That time was just taken." },
        { status: 409 }
      );
    }
    if (error.message.includes("too_many_holds")) {
      return NextResponse.json(
        {
          error: "too_many_holds",
          message: "You already have a booking waiting for payment. Finish that one first.",
        },
        { status: 429 }
      );
    }
    if (
      error.message.includes("consultation_type_not_found") ||
      error.message.includes("payment_page_missing")
    ) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    logQueryError("api/consulting/hold", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  // A free session has nothing to pay for, so it is confirmed immediately. It
  // still goes through the same RPC as a paid one so the exclusion constraint
  // and the idempotency guarantees apply to exactly one code path.
  const free = data.amount_inr === 0;

  const response = NextResponse.json({
    free,
    bookingId: data.booking_id,
    manageToken: data.manage_token,
    amountInr: data.amount_inr,
    title: data.title,
    holdExpiresAt: data.hold_expires_at,
    paymentUrl: free
      ? null
      : buildPaymentPageUrl({
          paymentPageUrl: type.payment_page_url!,
          bookingId: data.booking_id,
          email,
          phone,
        }),
  });

  // Razorpay's post-payment redirect is a single fixed URL configured in their
  // dashboard -- it cannot carry this booking's token. This cookie is how
  // /consulting/paid knows whose booking just came back. SameSite=Lax survives
  // the top-level GET navigation back from pages.razorpay.com; Strict would not.
  response.cookies.set(BOOKING_COOKIE, data.manage_token, bookingCookieOptions());

  // Best-effort, after the booking is safely stored. Never fails the request.
  try {
    await sendMetaEvent({
      eventName: "InitiateCheckout",
      eventId: meta?.eventId,
      eventSourceUrl: meta?.eventSourceUrl,
      actionSource: "website",
      customData: { content_name: data.title, value: data.amount_inr, currency: "INR" },
      userData: {
        email,
        phone,
        fbp: meta?.fbp,
        fbc: meta?.fbc,
        clientIp: ip,
        userAgent: request.headers.get("user-agent"),
      },
    });
  } catch {
    // Attribution is not worth failing a booking over.
  }

  return response;
}
