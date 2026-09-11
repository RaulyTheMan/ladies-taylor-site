/**
 * Carries the manage token across the trip to Razorpay and back.
 *
 * Razorpay's Payment Page redirect is a single fixed URL set in their dashboard,
 * so it cannot carry anything booking-specific. Without this cookie, someone
 * returning from payment lands on a page that has no idea who they are.
 *
 * It is a convenience, not the record: if the cookie is missing (they paid on a
 * different device, or cleared it) the webhook still confirms the booking
 * correctly. They just don't get bounced straight to their confirmation page.
 */
export const BOOKING_COOKIE = "lt_consult_booking";

export function bookingCookieOptions() {
  return {
    httpOnly: true,
    // Lax, not Strict: the return trip from pages.razorpay.com is a cross-site
    // top-level navigation, which Strict would refuse to send the cookie on.
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Comfortably longer than the 20-minute hold, short enough that a shared
    // computer doesn't hand the next person a stranger's booking.
    maxAge: 60 * 60,
  };
}
