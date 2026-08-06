"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Monitor,
  Newspaper,
  Tags,
  CalendarDays,
  Image as ImageIcon,
  Inbox,
} from "lucide-react";
import { logout } from "@/app/admin/login/actions";
import { ADMIN_NAV_ITEMS, type AdminNavIconKey } from "@/lib/admin/nav";
import { ADMIN_FOCUS_RING_CLASS, ADMIN_SIDEBAR_BG_CLASS } from "@/lib/admin/ui";
import Toast from "@/components/admin/Toast";

const NAV_ICONS: Record<AdminNavIconKey, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  desktop: Monitor,
  press: Newspaper,
  brands: Tags,
  events: CalendarDays,
  media: ImageIcon,
  leads: Inbox,
};

function NavRow({
  label,
  href,
  iconKey,
  active,
  onNavigate,
}: {
  label: string;
  href: string;
  iconKey: AdminNavIconKey;
  active: boolean;
  onNavigate: () => void;
}) {
  const Icon = NAV_ICONS[iconKey];
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-bold transition-colors ${ADMIN_FOCUS_RING_CLASS} ${
        active
          ? "bg-amber-500 text-white"
          : "text-black hover:bg-black/5"
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          active ? "bg-white/25" : "bg-black text-white"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      {label}
    </Link>
  );
}

export default function AdminShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [namePart] = userEmail.split("@");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close the drawer on navigation. Derived at render time (compared against
  // the previous pathname) rather than via a setState-in-effect, per React's
  // guidance for resetting state when a prop changes.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileNavOpen(false);
  }

  const closeMobileNav = () => setMobileNavOpen(false);

  const navContent = (
    <>
      <div className="px-2">
        <p className="text-sm font-semibold text-black">{namePart}</p>
        <p className="mt-0.5 truncate text-xs text-black/60">{userEmail}</p>
      </div>

      <nav className="mt-8 flex flex-col gap-1.5" aria-label="Admin sections">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <div key={item.href}>
              <NavRow
                label={item.label}
                href={item.href}
                iconKey={item.iconKey}
                active={active}
                onNavigate={closeMobileNav}
              />
              {item.children && (
                <div className="ml-6 mt-1 flex flex-col gap-0.5 border-l border-black/10 pl-4">
                  {item.children.map((child) => {
                    const childActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={closeMobileNav}
                        aria-current={childActive ? "page" : undefined}
                        className={`rounded-md px-2 py-1.5 text-xs ${ADMIN_FOCUS_RING_CLASS} ${
                          childActive
                            ? "font-bold text-black"
                            : "text-black/60 hover:text-black"
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <form action={logout} className="mt-auto px-2 pt-8">
        <button
          type="submit"
          className={`rounded px-1 py-2 text-xs font-medium text-black/60 hover:text-black ${ADMIN_FOCUS_RING_CLASS}`}
        >
          Log out
        </button>
      </form>
    </>
  );

  return (
    <div className={`flex min-h-screen ${ADMIN_SIDEBAR_BG_CLASS}`}>
      <a
        href="#admin-main"
        className="fixed left-2 top-2 z-[70] -translate-y-16 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      {/* Mobile top bar */}
      <div
        className={`fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-black/10 px-4 py-3 md:hidden ${ADMIN_SIDEBAR_BG_CLASS}`}
      >
        <span className="text-sm font-bold text-black">Ladies Taylor CMS</span>
        <button
          type="button"
          onClick={() => setMobileNavOpen((v) => !v)}
          aria-expanded={mobileNavOpen}
          aria-controls="admin-mobile-nav"
          aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
          className={`flex h-11 w-11 items-center justify-center rounded-full border border-black/10 ${ADMIN_FOCUS_RING_CLASS}`}
        >
          <span aria-hidden="true" className="text-lg">
            {mobileNavOpen ? "✕" : "☰"}
          </span>
        </button>
      </div>

      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeMobileNav}
          aria-hidden="true"
        />
      )}

      {/* Desktop sidebar / mobile drawer */}
      <aside
        id="admin-mobile-nav"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col px-4 py-6 transition-transform duration-200 md:static md:translate-x-0 ${ADMIN_SIDEBAR_BG_CLASS} ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navContent}
      </aside>

      <main
        id="admin-main"
        className="flex-1 overflow-y-auto bg-white p-8 pt-20 md:pt-8"
      >
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>

      <Suspense fallback={null}>
        <Toast />
      </Suspense>
    </div>
  );
}
