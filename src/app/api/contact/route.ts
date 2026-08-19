import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";
import { createServiceClient } from "@/lib/supabase/service";
import { sendContactNotification } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { normalizePhoneForWhatsApp, sendLeadServiceCheckTemplate } from "@/lib/whatsapp";
import { sendMetaEvent } from "@/lib/metaCapi";
import { metaCaptureSchema } from "@/lib/metaCapture";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(50),
  email: z.string().trim().email().max(200),
  note: z.string().trim().max(2000).optional(),
  // Optional so a submission still succeeds if the browser blocked the pixel.
  meta: metaCaptureSchema.optional(),
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

  const { name, phone, email, note, meta } = parsed.data;

  // Generated up front rather than read back after insert: contact_submissions
  // only grants anon INSERT (no SELECT), and asking Postgrest to return the
  // row would require a SELECT check under RLS, failing the whole insert.
  const submissionId = randomUUID();

  const supabase = createPublicClient();
  const { error } = await supabase
    .from("contact_submissions")
    .insert({
      id: submissionId,
      name,
      phone,
      email,
      notes: note || null,
      fbp: meta?.fbp ?? null,
      fbc: meta?.fbc ?? null,
      fb_event_id: meta?.eventId ?? null,
      event_source_url: meta?.eventSourceUrl ?? null,
    });

  if (error) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  // Server-side copy of the browser's Lead event, deduped by the shared event
  // id. This copy still lands when an ad blocker suppresses the browser pixel.
  await sendMetaEvent({
    eventName: "Lead",
    eventId: meta?.eventId,
    eventSourceUrl: meta?.eventSourceUrl,
    actionSource: "website",
    customData: { content_name: "Contact Form", lead_source: "contact" },
    userData: {
      email,
      phone,
      fbp: meta?.fbp,
      fbc: meta?.fbc,
      clientIp: ip,
      userAgent: request.headers.get("user-agent"),
    },
  });

  try {
    await sendContactNotification({ name, phone, email, note });
  } catch {
    // Notification email is best-effort — the submission itself already saved.
  }

  // Kick off the WhatsApp "are you looking for services?" flow — best-effort,
  // same as the email notification above. Uses the service client since this
  // whole route already runs server-side with validated input; no need to
  // widen the anon RLS surface just for this one insert.
  const waPhone = normalizePhoneForWhatsApp(phone);
  try {
    await createServiceClient()
      .from("whatsapp_leads")
      .insert({ contact_submission_id: submissionId, phone: waPhone });
    await sendLeadServiceCheckTemplate(waPhone);
  } catch (err) {
    console.error("[contact] failed to start WhatsApp lead flow", err);
  }

  return NextResponse.json({ ok: true });
}
