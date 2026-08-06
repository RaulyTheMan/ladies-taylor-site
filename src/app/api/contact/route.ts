import { NextResponse } from "next/server";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";
import { sendContactNotification } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(50),
  email: z.string().trim().email().max(200),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`contact:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const supabase = createPublicClient();
  const { error } = await supabase
    .from("contact_submissions")
    .insert(parsed.data);

  if (error) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  try {
    await sendContactNotification(parsed.data);
  } catch {
    // Notification email is best-effort — the submission itself already saved.
  }

  return NextResponse.json({ ok: true });
}
