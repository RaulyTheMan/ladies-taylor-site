import "server-only";

const GRAPH_VERSION = "v21.0";

// Buttons/rows carry these as their developer-defined id/payload so the
// webhook can branch on the reply without needing any stored conversation
// state — the id alone says which step a lead answered.
export const SERVICE_YES_ID = "SERVICE_YES";
export const SERVICE_NO_ID = "SERVICE_NO";
export const TIME_SLOT_IDS = {
  morning: "TIME_MORNING",
  afternoon: "TIME_AFTERNOON",
  evening: "TIME_EVENING",
  night: "TIME_NIGHT",
} as const;

export type TimeSlot = keyof typeof TIME_SLOT_IDS;

const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  morning: "Morning, 9-12",
  afternoon: "Afternoon, 1-4 PM",
  evening: "Evening, 5-7 PM",
  night: "Night, 7-10 PM",
};

function graphUrl(path: string) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  return `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}${path}`;
}

async function callGraphApi(body: Record<string, unknown>) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    console.error("[whatsapp] missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID");
    return;
  }

  const res = await fetch(graphUrl("/messages"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...body }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[whatsapp] send failed", res.status, text);
  }
}

// India-focused default: a bare 10-digit number is assumed to be a local
// Indian mobile and gets the country code prefixed. Anything already
// carrying a country code (11+ digits) is left as-is.
export function normalizePhoneForWhatsApp(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

// The very first message to a lead who hasn't messaged us — WhatsApp
// requires this to be a pre-approved template, not free-form text.
export async function sendLeadServiceCheckTemplate(to: string) {
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  const templateLang = process.env.WHATSAPP_TEMPLATE_LANG ?? "en";
  if (!templateName) {
    console.error("[whatsapp] missing WHATSAPP_TEMPLATE_NAME");
    return;
  }

  // No body variables — the approved template is static text, no {{1}}.
  await callGraphApi({
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: templateLang },
    },
  });
}

export async function sendText(to: string, text: string) {
  await callGraphApi({
    to,
    type: "text",
    text: { body: text },
  });
}

// Sent as a free-form interactive message — only valid within the 24h
// session a lead opens by tapping a template button, no approval needed.
export async function sendTimeSlotList(to: string) {
  await callGraphApi({
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: "What would be a good time for us to reach out?" },
      action: {
        button: "Pick a time",
        sections: [
          {
            title: "Preferred time",
            rows: (Object.keys(TIME_SLOT_IDS) as TimeSlot[]).map((slot) => ({
              id: TIME_SLOT_IDS[slot],
              title: TIME_SLOT_LABELS[slot],
            })),
          },
        ],
      },
    },
  });
}

export function timeSlotFromRowId(rowId: string): TimeSlot | null {
  const entry = (Object.entries(TIME_SLOT_IDS) as [TimeSlot, string][]).find(
    ([, id]) => id === rowId
  );
  return entry ? entry[0] : null;
}
