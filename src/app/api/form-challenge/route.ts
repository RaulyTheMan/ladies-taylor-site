import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { pickChallenge, verifyChallenge } from "@/lib/formChallenge";

// Every request should mint a fresh signed token.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  // Generous enough for a person hammering Refresh until they get a question
  // they know, tight enough that the bank can't be enumerated cheaply.
  if (!checkRateLimit(`form-challenge:${ip}`, { limit: 40, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  // The caller hands back the token it's refreshing away from so we don't
  // serve the same question twice in a row.
  const exclude = new URL(request.url).searchParams.get("exclude");
  const excludeId = exclude ? verifyChallenge(exclude) : null;

  return NextResponse.json(pickChallenge(excludeId), {
    headers: { "Cache-Control": "no-store" },
  });
}
