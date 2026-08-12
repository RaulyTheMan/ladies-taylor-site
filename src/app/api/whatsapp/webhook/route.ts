import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { sendWhatsappLeadNotification } from "@/lib/email";
import {
  SERVICE_NO_ID,
  SERVICE_YES_ID,
  sendText,
  sendTimeSlotList,
  timeSlotFromRowId,
} from "@/lib/whatsapp";

// Meta's one-time handshake when you save the webhook config in the
// dashboard: echo back hub.challenge if hub.verify_token matches ours.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

function isValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    console.warn("[whatsapp webhook] WHATSAPP_APP_SECRET not set, skipping signature check");
    return true;
  }
  if (!signatureHeader?.startsWith("sha256=")) return false;

  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");
  const provided = signatureHeader.slice("sha256=".length);

  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(provided, "hex");
  return (
    expectedBuf.length === providedBuf.length &&
    crypto.timingSafeEqual(expectedBuf, providedBuf)
  );
}

type IncomingMessage = {
  from: string;
  type: string;
  button?: { payload?: string };
  interactive?: {
    type?: string;
    button_reply?: { id?: string };
    list_reply?: { id?: string };
  };
};

function replyIdFromMessage(message: IncomingMessage): string | null {
  if (message.type === "button") return message.button?.payload ?? null;
  if (message.type === "interactive") {
    if (message.interactive?.type === "button_reply") {
      return message.interactive.button_reply?.id ?? null;
    }
    if (message.interactive?.type === "list_reply") {
      return message.interactive.list_reply?.id ?? null;
    }
  }
  return null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!isValidSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return new Response("Invalid signature", { status: 403 });
  }

  const payload = JSON.parse(rawBody);
  const supabase = createServiceClient();

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value ?? {};
      const message: IncomingMessage | undefined = value.messages?.[0];
      if (!message) continue; // status updates etc. — nothing to do

      const from = message.from;
      const waName: string | undefined = value.contacts?.[0]?.profile?.name;
      const replyId = replyIdFromMessage(message);
      if (!replyId) continue;

      if (replyId === SERVICE_NO_ID) {
        await supabase
          .from("whatsapp_leads")
          .update({
            interested: false,
            wa_id: from,
            wa_name: waName ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("phone", from)
          .is("interested", null);
        await sendText(from, "Alright thanks");
        continue;
      }

      if (replyId === SERVICE_YES_ID) {
        await supabase
          .from("whatsapp_leads")
          .update({
            interested: true,
            wa_id: from,
            wa_name: waName ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("phone", from)
          .is("interested", null);
        await sendTimeSlotList(from);
        continue;
      }

      const slot = timeSlotFromRowId(replyId);
      if (slot) {
        const { data: lead } = await supabase
          .from("whatsapp_leads")
          .update({ preferred_time: slot, updated_at: new Date().toISOString() })
          .eq("phone", from)
          .eq("interested", true)
          .is("preferred_time", null)
          .select("wa_name, phone")
          .single();

        await sendText(
          from,
          "Thanks for reaching out, we'll get in touch soon. Just chill for sometime now."
        );

        if (lead) {
          await sendWhatsappLeadNotification({
            name: lead.wa_name ?? "Unknown",
            phone: lead.phone,
            preferredTime: slot,
          });
        }
      }
    }
  }

  return NextResponse.json({ success: true });
}
