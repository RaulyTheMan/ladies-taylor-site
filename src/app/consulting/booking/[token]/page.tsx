import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import LocalTimeEcho from "@/components/consulting/LocalTimeEcho";
import CancelBookingButton from "@/components/consulting/CancelBookingButton";
import CopyLink from "@/components/consulting/CopyLink";
import AwaitingConfirmation from "@/components/consulting/AwaitingConfirmation";
import { consultingNav } from "@/lib/nav";
import { getBookingByToken } from "@/lib/consulting";
import { SITE_URL } from "@/lib/site";
import {
  HOST_TIMEZONE,
  formatDateInZone,
  formatRupees,
  formatTimeInZone,
} from "@/lib/consulting/time";

// The token is the guest's credential. It must never be indexed, and the page
// must never be cached.
export const metadata: Metadata = {
  title: "Your booking",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const { token } = await params;
  // Set by /consulting/paid, which is where Razorpay returns people. It changes
  // only what this page SAYS -- the booking is confirmed by the webhook, never
  // by the presence of this parameter.
  const { paid } = await searchParams;
  const justPaid = paid === "1";
  const booking = await getBookingByToken(token);
  if (!booking) notFound();

  const manageUrl = `${SITE_URL}/consulting/booking/${token}`;

  // Server-rendered times are pinned to a FIXED zone with a visible IST label,
  // so they are deterministic on both sides. The viewer's own clock is echoed
  // by LocalTimeEcho, which renders nothing until mounted.
  const day = formatDateInZone(booking.startAt, HOST_TIMEZONE);
  const time = formatTimeInZone(booking.startAt, HOST_TIMEZONE);

  return (
    <>
      <div className="flex flex-1 flex-col bg-white">
        <SiteHeader items={consultingNav} />
        <main className="flex-1 px-4 pb-20 md:px-10">
          <div className="mx-auto mt-10 max-w-2xl">
            {booking.status === "confirmed" && (
              <div className="comic-border rounded-squircle-lg bg-white p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-lt-red">
                  You&apos;re booked
                </p>
                <h1 className="mt-2 text-3xl font-extrabold leading-tight text-black">
                  {booking.title}
                </h1>

                <div className="comic-border-sm mt-5 rounded-squircle-xs bg-lt-yellow p-4">
                  <p className="text-lg font-extrabold text-black">{day}</p>
                  <p className="text-lg text-black">
                    {time} IST · {booking.durationMinutes} minutes
                  </p>
                  <LocalTimeEcho
                    iso={booking.startAt}
                    className="mt-1 block text-sm text-black/70"
                  />
                </div>

                {/* The meeting link is sent personally, not shown here. Echoing the
                    contact details back is what lets a guest catch a typo in their
                    number or email before it costs them the link. */}
                <div className="mt-5">
                  <p className="text-sm font-semibold text-black">
                    We&apos;ll message you the meeting link before your call.
                  </p>
                  <p className="mt-1 text-sm text-black/70">
                    It&apos;ll go to <span className="font-semibold text-black">{booking.phone}</span>{" "}
                    or <span className="font-semibold text-black">{booking.email}</span>.
                    If either of those is wrong, get in touch so the link reaches you.
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <a
                    href={`/api/consulting/booking/${token}/ics`}
                    className="comic-border-sm rounded-squircle-md bg-white px-5 py-2 text-xs font-bold uppercase tracking-wide text-black"
                  >
                    Add to calendar
                  </a>
                  <span className="text-sm text-black/60">
                    Paid {formatRupees(booking.amountInr)}
                  </span>
                </div>

                <div className="mt-6">
                  <CopyLink url={manageUrl} />
                </div>

                {booking.canCancel && (
                  <div className="mt-5">
                    <CancelBookingButton token={token} />
                  </div>
                )}
              </div>
            )}

            {booking.status === "pending_payment" && (
              <div className="comic-border rounded-squircle-lg bg-white p-6">
                {justPaid ? (
                  <>
                    <p className="text-xs font-bold uppercase tracking-wide text-lt-red">
                      Thanks
                    </p>
                    <h1 className="mt-2 text-3xl font-extrabold leading-tight text-black">
                      {booking.title}
                    </h1>
                    <div className="comic-border-sm mt-5 rounded-squircle-xs bg-black/[0.04] p-4">
                      <p className="text-lg font-extrabold text-black">{day}</p>
                      <p className="text-lg text-black">
                        {time} IST · {booking.durationMinutes} minutes
                      </p>
                    </div>
                    <AwaitingConfirmation />
                    <div className="mt-6">
                      <CopyLink url={manageUrl} />
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl font-extrabold text-black">
                      We haven&apos;t received your payment yet
                    </h1>
                    <p className="mt-2 text-sm text-black/70">
                      If you just paid, give it a moment and refresh — payments can
                      take a minute to land. Otherwise the time is still free to book.
                    </p>
                    <Link
                      href={`/consulting/${booking.slug}`}
                      className="comic-border-sm mt-5 inline-block rounded-squircle-md bg-lt-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white"
                    >
                      Back to booking
                    </Link>
                  </>
                )}
              </div>
            )}

            {(booking.status === "expired" || booking.status === "payment_failed") && (
              <div className="comic-border rounded-squircle-lg bg-white p-6">
                <h1 className="text-2xl font-extrabold text-black">
                  This booking wasn&apos;t completed
                </h1>
                <p className="mt-2 text-sm text-black/70">
                  {booking.status === "payment_failed"
                    ? "The payment didn't go through, so the time was released."
                    : "The hold ran out before payment, so the time was released."}{" "}
                  Nothing was charged.
                </p>
                <Link
                  href={`/consulting/${booking.slug}`}
                  className="comic-border-sm mt-5 inline-block rounded-squircle-md bg-lt-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white"
                >
                  Pick another time
                </Link>
              </div>
            )}

            {booking.status === "cancelled" && (
              <div className="comic-border rounded-squircle-lg bg-white p-6">
                <h1 className="text-2xl font-extrabold text-black">Booking cancelled</h1>
                <p className="mt-2 text-sm text-black/70">
                  {day} at {time} IST is no longer booked.
                </p>
                {booking.refundId ? (
                  <p className="mt-2 text-sm text-black/70">
                    A refund of {formatRupees(booking.amountInr)} has been issued. It
                    usually reaches your account in 5–7 working days.
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-black/70">
                    If a refund is due, we&apos;ll sort it out with you directly.
                  </p>
                )}
                <Link
                  href={`/consulting/${booking.slug}`}
                  className="comic-border-sm mt-5 inline-block rounded-squircle-md bg-lt-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white"
                >
                  Book another time
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
