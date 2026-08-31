import { NextResponse } from "next/server";
import { z } from "zod";
import { createPublicClient, logQueryError } from "@/lib/supabase/public";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendMetaEvent } from "@/lib/metaCapi";
import { metaCaptureSchema } from "@/lib/metaCapture";
import {
  checkChallengeToken,
  isChallengeTokenUsed,
  markChallengeTokenUsed,
  matchesAnswer,
} from "@/lib/formChallenge";
import { BUDGETS, SERVICES } from "@/lib/augustQuery";

const querySchema = z.object({
  services: z.array(z.enum(SERVICES)).min(1).max(SERVICES.length),
  budget: z.enum(BUDGETS),
  companyName: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(50),
  city: z.string().trim().min(1).max(120),
  aboutCompany: z.string().trim().max(2000).optional(),
  challengeToken: z.string().min(1).max(500),
  challengeAnswer: z.string().trim().min(1).max(200),
  // Optional so a submission still succeeds if the browser blocked the pixel.
  meta: metaCaptureSchema.optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);

  // Two limiters on purpose. This one covers every attempt including failed
  // challenges, so a wrong trivia answer can't burn the submit budget below
  // and lock a real person out of their own form.
  if (
    !checkRateLimit(`august-query-attempt:${ip}`, {
      limit: 20,
      windowMs: 10 * 60 * 1000,
    })
  ) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = querySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const {
    services,
    budget,
    companyName,
    name,
    phone,
    city,
    aboutCompany,
    challengeToken,
    challengeAnswer,
    meta,
  } = parsed.data;

  const verdict = checkChallengeToken(challengeToken);
  if (!verdict.ok) {
    // An aged-out token isn't the user's fault — tell the form to swap in a
    // fresh question rather than accusing them of a wrong answer.
    return NextResponse.json(
      { error: verdict.reason === "expired" ? "challenge_expired" : "challenge_failed" },
      { status: 422 }
    );
  }
  // A spent token is treated like an expired one: the form quietly swaps in a
  // new question rather than telling a real person they answered wrong.
  if (isChallengeTokenUsed(challengeToken)) {
    return NextResponse.json({ error: "challenge_expired" }, { status: 422 });
  }
  if (!matchesAnswer(challengeAnswer, verdict.id)) {
    return NextResponse.json({ error: "challenge_failed" }, { status: 422 });
  }

  // Only requests that cleared the human check count against the real limit.
  if (!checkRateLimit(`august-query:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  const supabase = createPublicClient();
  const { error } = await supabase.from("august_query_submissions").insert({
    name,
    phone,
    city,
    // The company they're enquiring for, same column the old form filled.
    brand_name: companyName,
    // Reuses the old free-text column rather than adding a near-duplicate.
    about_brand: aboutCompany || null,
    services,
    budget,
    challenge_id: verdict.id,
    fbp: meta?.fbp ?? null,
    fbc: meta?.fbc ?? null,
    fb_event_id: meta?.eventId ?? null,
    event_source_url: meta?.eventSourceUrl ?? null,
  });

  if (error) {
    logQueryError("api/august-query insert", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  // Burn the token only now that the row is safely stored, so a failed insert
  // the user retries doesn't cost them their question.
  markChallengeTokenUsed(challengeToken);

  // Server-side copy of the browser's Lead event, deduped by the shared event
  // id. Deliberately awaited but never fatal: this is the only copy that
  // survives an ad blocker, so a failure is worth logging, not worth failing
  // the submission over.
  await sendMetaEvent({
    eventName: "Lead",
    eventId: meta?.eventId,
    eventSourceUrl: meta?.eventSourceUrl,
    actionSource: "website",
    customData: { content_name: "August Query Form", lead_source: "august_query" },
    userData: {
      // The form no longer collects email, so phone is the match key. Meta
      // accepts a partial user_data; match quality is just lower without it.
      phone,
      fbp: meta?.fbp,
      fbc: meta?.fbc,
      clientIp: ip,
      userAgent: request.headers.get("user-agent"),
    },
  });

  return NextResponse.json({ ok: true });
}
