export type StudioNavItem = {
  label: string;
  href: string;
  iconKey: StudioIconKey;
};

export type StudioNavGroup = {
  /** Omitted for the ungrouped top item. */
  label?: string;
  items: StudioNavItem[];
};

export type StudioIconKey =
  | "dashboard"
  | "windows"
  | "dock"
  | "press"
  | "brands"
  | "events"
  | "subscribers"
  | "media";

/**
 * Grouped rather than flat. The old sidebar listed eight peers in one column,
 * which gave no clue that "Desktop" and "Dock Apps" are the same job while
 * "Brands" is a different one. Labels do that work for free.
 */
export const STUDIO_NAV: StudioNavGroup[] = [
  {
    items: [{ label: "Dashboard", href: "/admin", iconKey: "dashboard" }],
  },
  {
    label: "Site",
    items: [
      { label: "Desktop Windows", href: "/admin/desktop", iconKey: "windows" },
      { label: "Dock Apps", href: "/admin/desktop/dock", iconKey: "dock" },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Press & Media", href: "/admin/press-media", iconKey: "press" },
      { label: "Brands", href: "/admin/brands", iconKey: "brands" },
      { label: "Events", href: "/admin/events", iconKey: "events" },
    ],
  },
  {
    label: "Audience",
    items: [
      { label: "Subscribers", href: "/admin/subscribers", iconKey: "subscribers" },
    ],
  },
  {
    label: "Library",
    items: [{ label: "Media", href: "/admin/media", iconKey: "media" }],
  },
];

export const STUDIO_NAV_ITEMS = STUDIO_NAV.flatMap((group) => group.items);

/**
 * The sales pipeline lives in the standalone CRM, not here. This studio is
 * website content only — contact and August-query submissions are collected by
 * src/app/api/{contact,august-query} and worked over there, so the two systems
 * can't drift apart the way they did when both had a UI.
 */
export const STUDIO_CRM_URL = "https://leads.ladiestaylor.com";

/**
 * Longest-prefix match, so nesting resolves without per-item `exact` flags:
 * /admin/desktop/new highlights "Desktop Windows", /admin/desktop/dock/x/edit
 * highlights "Dock Apps", and /admin only highlights "Dashboard" even though
 * its href is a prefix of every other one.
 */
export function activeNavHref(pathname: string): string | undefined {
  return STUDIO_NAV_ITEMS.map((item) => item.href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
}
