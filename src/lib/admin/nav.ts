export type AdminNavChild = {
  label: string;
  href: string;
};

export type AdminNavIconKey =
  | "dashboard"
  | "desktop"
  | "press"
  | "brands"
  | "events"
  | "media"
  | "subscribers";

export type AdminNavItem = {
  label: string;
  href: string;
  iconKey: AdminNavIconKey;
  children?: AdminNavChild[];
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", iconKey: "dashboard" },
  {
    label: "Desktop",
    href: "/admin/desktop",
    iconKey: "desktop",
    children: [
      { label: "Windows", href: "/admin/desktop" },
      { label: "Dock Apps", href: "/admin/desktop/dock" },
    ],
  },
  { label: "Press & Media", href: "/admin/press-media", iconKey: "press" },
  { label: "Brands", href: "/admin/brands", iconKey: "brands" },
  { label: "Events", href: "/admin/events", iconKey: "events" },
  { label: "Media", href: "/admin/media", iconKey: "media" },
  { label: "Subscribers", href: "/admin/subscribers", iconKey: "subscribers" },
];

/**
 * The sales pipeline lives in the standalone CRM, not here. This admin is
 * website content only — contact and August-query submissions are still
 * collected by src/app/api/{contact,august-query} and worked over there, so
 * the two systems can't drift apart the way they did when both had a UI.
 */
export const ADMIN_CRM_URL = "https://leads.ladiestaylor.com";
