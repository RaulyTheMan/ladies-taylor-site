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
];

// "Best of Br*nds" directory nav — matches that mockup exactly.
export const bandsNav: NavItem[] = [
  { label: "Services", href: "/services", dropdown: servicesDropdown },
  { label: "Our Fr**nds", href: "/our-friends" },
  { label: "Cool Sh*t", href: "/best-of-bands" },
  { label: "Pr*ss & M*dia", href: "/press-media" },
  { label: "Ev*nts", href: "/events" },
];

// Events hub nav — matches that mockup exactly.
export const eventsNav: NavItem[] = [
  { label: "Services", href: "/services", dropdown: servicesDropdown },
  { label: "Our Fr**nds", href: "/our-friends" },
  { label: "Cool Sh*t", href: "/best-of-bands" },
  { label: "Pr*ss & M*dia", href: "/press-media" },
  { label: "Ev*nts", href: "/events" },
];
