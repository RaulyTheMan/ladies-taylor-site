import { NextResponse } from "next/server";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  STREAM_COMMENT_COOLDOWN_MS,
  STREAM_NAME_MAX,
  STREAM_MESSAGE_MAX,
} from "@/lib/stream";

const commentSchema = z.object({
  name: z.string().trim().min(1).max(STREAM_NAME_MAX),
  message: z.string().trim().min(1).max(STREAM_MESSAGE_MAX),
  visitorId: z.string().trim().min(1).max(100),
});

export async function POST(request: Request) {
  // The per-visitor cooldown below keys off a client-supplied visitorId,
  // which is easy to spoof — this IP-based check is the real rate limit.
  const ip = getClientIp(request);
  if (
    !checkRateLimit(`stream-comments:${ip}`, {
      limit: 1,
      windowMs: STREAM_COMMENT_COOLDOWN_MS,
    })
  ) {
    return NextResponse.json(
      { error: "Slow down a bit before posting again." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = commentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid comment." }, { status: 400 });
  }

  const supabase = createPublicClient();

  const { data: recent } = await supabase
    .from("stream_comments")
    .select("created_at")
    .eq("visitor_id", parsed.data.visitorId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (
    recent &&
    Date.now() - new Date(recent.created_at).getTime() <
      STREAM_COMMENT_COOLDOWN_MS
  ) {
    return NextResponse.json(
      { error: "Slow down a bit before posting again." },
      { status: 429 }
    );
  }

  const { data: comment, error } = await supabase
    .from("stream_comments")
    .insert({
      name: parsed.data.name,
      message: parsed.data.message,
      visitor_id: parsed.data.visitorId,
    })
    .select("id, name, message, created_at")
    .single();

  if (error || !comment) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ comment });
}
