import { NextResponse } from "next/server";
import { z } from "zod";
import { createPublicClient, logQueryError } from "@/lib/supabase/public";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { FUNNEL_STEPS } from "@/lib/augustQuery";

const progressSchema = z.object({
  // Opaque per-visit id minted in the browser. Not tied to a person, and never
  // joined to a submission.
  sessionId: z.string().trim().min(8).max(64),
  step: z.enum(FUNNEL_STEPS),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  // Generous: a full run is 11 events, and several people can share an IP.
  if (!checkRateLimit(`form-progress:${ip}`, { limit: 200, windowMs: 10 * 60 * 1000 })) {
    return new NextResponse(null, { status: 204 });
  }

  const body = await request.json().catch(() => null);
  const parsed = progressSchema.safeParse(body);

  // Analytics must never be able to break the form, so every failure path here
  // is a silent 204 rather than an error the client has to handle.
  if (!parsed.success) return new NextResponse(null, { status: 204 });

  const supabase = createPublicClient();
  const { error } = await supabase.from("form_funnel_events").insert({
    session_id: parsed.data.sessionId,
    step: parsed.data.step,
  });

  if (error) logQueryError("api/form-progress insert", error);

  return new NextResponse(null, { status: 204 });
}
