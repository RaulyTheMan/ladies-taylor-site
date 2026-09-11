import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Payment runs through a hosted Razorpay Payment Page, and this application has
// NO Razorpay API credentials. That is a deliberate constraint, and it decides
// most of what follows:
//
//   * We cannot create orders, so a booking's own id is the payment reference.
//     It rides to Razorpay in a `booking_id` custom field on the page (prefilled
//     through the URL) and comes back in the webhook's `notes`.
//   * We cannot read a payment back, so the webhook payload is the only account
//     of what happened.
//   * We CANNOT REFUND. Every refund in this system is a human action in the
//     Razorpay dashboard. Nothing here can undo a payment.
//
// The webhook secret is the single credential, and it is not an API key: it is a
// shared string that proves an incoming notification came from Razorpay. It
// grants no access to the Razorpay account.

/**
 * Constant-time hex digest comparison.
 *
 * The regex and length guard are NOT optional: Buffer.from(x, "hex") silently
 * TRUNCATES at the first non-hex character, so an attacker-supplied "zz" becomes
 * a zero-length buffer that compares equal to another zero-length buffer.
 */
function timingSafeEqualHex(expected: string, received: string): boolean {
  if (!/^[0-9a-f]+$/i.test(received)) return false;
  if (expected.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
}

/**
 * Verifies a webhook against the RAW request body.
 *
 * Must be the exact bytes Razorpay signed -- JSON.stringify(JSON.parse(raw))
 * reorders keys and drops whitespace, and the HMAC will not match.
 *
 * Unlike whatsapp/webhook's isValidSignature, which returns true when its secret
 * is unset, this FAILS CLOSED. With no other way to verify a payment, a missing
 * secret here would let anyone confirm any booking for free.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeEqualHex(expected, signature);
}

/**
 * Builds the URL that sends a guest to the hosted page with their details and
 * their booking reference already filled in.
 *
 * Razorpay's documented prefill rules: lower-case field keys, values URL-encoded.
 * `booking_id` must exist as a custom field ON THE PAGE -- without it the value
 * is dropped, the webhook arrives with no reference, and the payment cannot be
 * matched to a booking.
 */
export function buildPaymentPageUrl(input: {
  paymentPageUrl: string;
  bookingId: string;
  email: string;
  phone: string;
}): string {
  const url = new URL(input.paymentPageUrl);
  url.searchParams.set("email", input.email);
  url.searchParams.set("phone", input.phone);
  url.searchParams.set("booking_id", input.bookingId);
  return url.toString();
}
