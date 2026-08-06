import { NextResponse } from "next/server";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";
import { sendNewsletterNotification } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const newsletterSchema = z.object({
  email: z.string().trim().email().max(200),
  source: z.string().trim().min(1).max(100).default("press-media"),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`newsletter:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const supabase = createPublicClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert(parsed.data);

  // 23505 = unique_violation — already subscribed, treat as success rather
  // than error. (Upsert with on_conflict isn't used here because it needs
  // SELECT visibility under RLS to check for conflicts, which anon
  // intentionally doesn't have on this table.)
  if (error && error.code !== "23505") {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  try {
    await sendNewsletterNotification(parsed.data);
  } catch {
    // Notification email is best-effort — the submission itself already saved.
  }

  return NextResponse.json({ ok: true });
}
