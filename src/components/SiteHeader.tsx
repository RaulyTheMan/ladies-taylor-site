import NavBar from "@/components/NavBar";
import MobileNavBar from "@/components/home/MobileNavBar";
import type { NavItem } from "@/lib/nav";

// The homepage builds its own mobile header inline (inside MobileHero), but
// every other page only ever rendered the desktop NavBar — whose nav links
// are `hidden md:flex` — leaving mobile visitors with no way to reach the
// rest of the site. This pairs NavBar with the same MobileNavBar used on
// the homepage so every page gets a working mobile menu.
export default function SiteHeader({ items }: { items: NavItem[] }) {
  return (
    <>
      <div className="hidden md:block">
        <NavBar items={items} />
      </div>
      <div className="md:hidden">
        <MobileNavBar items={items} />
      </div>
    </>
  );
}
