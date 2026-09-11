import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { consultingNav } from "@/lib/nav";
import { BOOKING_COOKIE } from "@/lib/consulting/cookie";

// Where Razorpay's Payment Page sends people after they pay. That redirect is a
// single fixed URL configured in their dashboard, so it cannot carry anything
// booking-specific -- the cookie set when the hold was taken is what identifies
// them here.
//
// This page CONFIRMS NOTHING. Landing on it proves only that a browser
// navigated here, and anyone can do that. The booking is confirmed by the
// webhook, on Razorpay's word, and this page simply forwards people to their
// booking so they can watch it land.

export const metadata: Metadata = {
  title: "Payment received",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function PaidPage() {
  const token = (await cookies()).get(BOOKING_COOKIE)?.value;

  if (token) {
    // ?paid=1 tells the booking page this person has just come back from paying,
    // so it waits for the webhook instead of saying "we haven't been paid".
    redirect(`/consulting/booking/${token}?paid=1`);
  }

  // No cookie: they paid on a different device, or cleared it. The webhook will
  // still confirm the booking correctly -- we just can't show it to them here.
  return (
    <>
      <div className="flex flex-1 flex-col bg-white">
        <SiteHeader items={consultingNav} />
        <main className="flex-1 px-4 pb-20 md:px-10">
          <div className="mx-auto mt-10 max-w-xl">
            <div className="comic-border rounded-squircle-lg bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-lt-red">
                Thanks
              </p>
              <h1 className="mt-2 text-3xl font-extrabold leading-tight text-black">
                We&apos;ve got your payment
              </h1>
              <p className="mt-3 text-sm text-black/70">
                Your booking is confirmed against the time you picked. We couldn&apos;t
                open your booking page automatically on this device — if you started
                the booking in a different browser, open the link from that one.
              </p>
              <p className="mt-3 text-sm text-black/70">
                Either way you&apos;re in the diary, and we&apos;ll message you the
                meeting link before the call.
              </p>
              <Link
                href="/consulting"
                className="comic-border-sm mt-5 inline-block rounded-squircle-md bg-lt-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white"
              >
                Back to consulting
              </Link>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
