export type NavItem = {
  label: string;
  href: string;
  dropdown?: { label: string; href: string }[];
};

export const servicesDropdown = [
  { label: "Social Media Management", href: "/services/social-media" },
  { label: "Branding", href: "/services/branding" },
  { label: "Packaging", href: "/services/packaging" },
  { label: "Website Development", href: "/services/web-development" },
];

// Homepage (desktop concept) nav — matches the latest explored direction.
export const homeNav: NavItem[] = [
  { label: "Services", href: "/services", dropdown: servicesDropdown },
  { label: "Our Fr**nds", href: "/our-friends" },
  { label: "Cool Sh*t", href: "/best-of-bands" },
  { label: "Pr*ss & M*dia", href: "/press-media" },
  { label: "Ev*nts", href: "/events" },
  { label: "Consult*ng", href: "/consulting" },
];

// "Best of Br*nds" directory nav — matches that mockup exactly.
export const bandsNav: NavItem[] = [
  { label: "Services", href: "/services", dropdown: servicesDropdown },
  { label: "Our Fr**nds", href: "/our-friends" },
  { label: "Cool Sh*t", href: "/best-of-bands" },
  { label: "Pr*ss & M*dia", href: "/press-media" },
  { label: "Ev*nts", href: "/events" },
  { label: "Consult*ng", href: "/consulting" },
];

// Events hub nav — matches that mockup exactly.
export const eventsNav: NavItem[] = [
  { label: "Services", href: "/services", dropdown: servicesDropdown },
  { label: "Our Fr**nds", href: "/our-friends" },
  { label: "Cool Sh*t", href: "/best-of-bands" },
  { label: "Pr*ss & M*dia", href: "/press-media" },
  { label: "Ev*nts", href: "/events" },
  { label: "Consult*ng", href: "/consulting" },
];

// Consulting nav — identical to the others today, like bandsNav and eventsNav.
// The four arrays are byte-identical on purpose: they exist so one section can
// diverge later without touching every other page. Resist collapsing them.
export const consultingNav: NavItem[] = [
  { label: "Services", href: "/services", dropdown: servicesDropdown },
  { label: "Our Fr**nds", href: "/our-friends" },
  { label: "Cool Sh*t", href: "/best-of-bands" },
  { label: "Pr*ss & M*dia", href: "/press-media" },
  { label: "Ev*nts", href: "/events" },
  { label: "Consult*ng", href: "/consulting" },
];
