// Single source of truth for the lead pipeline vocabulary, shared by the
// contact-submission and August-query admin views. These values are enforced
// by CHECK constraints on contact_submissions, august_query_submissions and
// whatsapp_leads, and are also used by the standalone leads CRM
// (leads.ladiestaylor.com) — change them here and in that project together,
// alongside a migration, or writes will start failing the constraint.
export const LEAD_STATUSES = [
  "lead",
  "contact",
  "proposal_awaiting",
  "proposal_sent",
  "closed",
  "rejected",
  "ghosted",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  lead: "Lead",
  contact: "Contact",
  proposal_awaiting: "Proposal Awaiting",
  proposal_sent: "Proposal Sent",
  closed: "Closed",
  rejected: "Rejected",
  ghosted: "Ghosted",
};

/** The status every new submission lands on. */
export const DEFAULT_LEAD_STATUS: LeadStatus = "lead";

export const LEAD_STATUS_OPTIONS = LEAD_STATUSES.map((value) => ({
  value,
  label: LEAD_STATUS_LABELS[value],
}));

/** Narrows untrusted form input to a valid status, falling back to the default. */
export function coerceLeadStatus(value: FormDataEntryValue | null): LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(String(value))
    ? (String(value) as LeadStatus)
    : DEFAULT_LEAD_STATUS;
}
