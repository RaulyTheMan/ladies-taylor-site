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
  | "leads";

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
  { label: "Leads", href: "/admin/leads", iconKey: "leads" },
];
