// Admin-panel style tokens — matches the "Backend Taylor" reference:
// cream sidebar, amber active states, orange primary actions, plain
// (non-shaded) table headers, bold black labels, pill badges for
// handles/tags. Deliberately distinct from the public site's bold
// "comic-border" flyer treatment (PRIMARY_BUTTON_CLASS in src/lib/ui.ts).
//
// Text-on-white gray tokens are floored at black/55 (~5.3:1 contrast) so
// every informational label/cell clears WCAG 2.1 AA's 4.5:1 minimum for
// normal text — black/40-/50 measured 2.9-4.4:1 and were failing.

export const ADMIN_FOCUS_RING_CLASS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export const ADMIN_SIDEBAR_BG_CLASS = "bg-[#F5F1EA]";

export const ADMIN_BUTTON_CLASS =
  `inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600 ${ADMIN_FOCUS_RING_CLASS}`;

export const ADMIN_BUTTON_SECONDARY_CLASS =
  `inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-5 py-2.5 text-xs font-semibold text-black transition-colors hover:bg-black/[0.03] ${ADMIN_FOCUS_RING_CLASS}`;

// Plain "fill in the blank" style — no box, just an underline, matching
// the reference (only multi-line text areas get a full bordered box; see
// ADMIN_TEXTAREA_CLASS below).
export const ADMIN_INPUT_CLASS =
  "mt-1 w-full border-0 border-b border-black/15 bg-transparent px-0 py-2 text-sm text-black placeholder:text-black/40 focus:outline-none focus:border-black";

export const ADMIN_TEXTAREA_CLASS =
  "mt-1 w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm text-black placeholder:text-black/40 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/15";

export const ADMIN_LABEL_CLASS = "text-xs font-bold text-black";

export const ADMIN_CARD_CLASS = "rounded-xl border border-black/10 bg-white";

export const ADMIN_H1_CLASS = "text-2xl font-bold tracking-tight text-black";

export const ADMIN_TABLE_WRAPPER_CLASS = "overflow-x-auto";

export const ADMIN_TABLE_CLASS = "w-full text-left text-sm";

export const ADMIN_TABLE_HEAD_ROW_CLASS =
  "border-b border-black/10 text-sm font-bold text-black";

export const ADMIN_TABLE_ROW_CLASS = "border-b border-black/5 last:border-0";

export const ADMIN_TABLE_CELL_CLASS = "px-4 py-3";

export const ADMIN_ICON_BUTTON_CLASS =
  `flex h-8 w-8 items-center justify-center rounded-full text-black/50 transition-colors hover:bg-black/5 hover:text-black disabled:opacity-20 disabled:hover:bg-transparent ${ADMIN_FOCUS_RING_CLASS}`;

export const ADMIN_ICON_BUTTON_DANGER_CLASS =
  `flex h-8 w-8 items-center justify-center rounded-full text-red-500/70 transition-colors hover:bg-red-50 hover:text-red-600 ${ADMIN_FOCUS_RING_CLASS}`;

export const ADMIN_LINK_CLASS =
  `inline-block rounded px-0.5 py-2 text-xs font-semibold text-black/70 underline decoration-black/20 underline-offset-2 hover:text-black hover:decoration-black/40 ${ADMIN_FOCUS_RING_CLASS}`;

export const ADMIN_LINK_DANGER_CLASS =
  `inline-block rounded px-0.5 py-2 text-xs font-semibold text-red-600 underline decoration-red-200 underline-offset-2 hover:decoration-red-400 ${ADMIN_FOCUS_RING_CLASS}`;

export const ADMIN_BUTTON_DANGER_CLASS =
  `inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 ${ADMIN_FOCUS_RING_CLASS}`;

export const ADMIN_BADGE_CLASS =
  "rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-black/55";

// The @handle-style pill used on Brands (matches the pale-blue "@pinkswindows"
// chip in the reference).
export const ADMIN_PILL_BADGE_CLASS =
  "inline-block rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-600";
