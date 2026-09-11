import { NextResponse } from "next/server";
import { createPublicClient, logQueryError } from "@/lib/supabase/public";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// A route handler rather than a Server Action because it needs a rate limiter:
// the manage token is the only credential on this endpoint, and while 24 random
// bytes are not guessable, an unlimited cancel endpoint is not something to
// leave open on principle.

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`consult-cancel:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const { token } = await params;
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("cancel_consultation_booking", {
    p_token: token,
  });

  if (error) {
    if (error.message.includes("too_late_to_cancel")) {
      return NextResponse.json(
        {
          error: "too_late",
          message: "This call is too close to cancel online. Reply to your booking to reach us.",
        },
        { status: 409 }
      );
    }
    if (error.message.includes("booking_not_found")) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    logQueryError("api/consulting/cancel", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  // No refund here, deliberately. Whether a cancellation earns money back is an
  // undecided business policy and Razorpay refunds are irreversible, so it goes
  // through the admin Refund button.
  return NextResponse.json({ status: data });
}
