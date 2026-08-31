import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  checkChallengeToken,
  matchesAnswer,
  pickChallenge,
  verifyChallenge,
} from "@/lib/formChallenge";

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

/**
 * Checks an answer without consuming the token, so the form can gate the very
 * first screen instead of letting someone fill everything in and only then
 * discover they got the question wrong. The submit route still does its own
 * check: this is for feedback, not security.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  // Tighter than the GET limit: this is the endpoint worth brute-forcing.
  if (!checkRateLimit(`form-challenge-verify:${ip}`, { limit: 30, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const answer = typeof body?.answer === "string" ? body.answer : "";

  const verdict = checkChallengeToken(token);
  if (!verdict.ok) {
    return NextResponse.json({ ok: false, error: verdict.reason });
  }

  return NextResponse.json({ ok: matchesAnswer(answer, verdict.id) });
}
