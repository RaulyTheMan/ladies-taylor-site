"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AppWindow,
  LayoutGrid,
  Newspaper,
  Tags,
  CalendarDays,
  Mail,
  Image as ImageIcon,
  ExternalLink,
  Menu as MenuIcon,
  X,
  LogOut,
  Search,
} from "lucide-react";
import { logout } from "@/app/admin/login/actions";
import {
  STUDIO_NAV,
  STUDIO_CRM_URL,
  activeNavHref,
  type StudioIconKey,
} from "@/lib/studio/nav";
import { cn } from "@/lib/ui/cn";
import { FOCUS_RING } from "@/components/ui/focus";
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
} from "@/components/ui/Menu";
import Toast from "@/components/studio/Toast";
import CommandPalette from "./CommandPalette";
import StudioBreadcrumbs from "./StudioBreadcrumbs";

const ICONS: Record<StudioIconKey, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  windows: AppWindow,
  dock: LayoutGrid,
  press: Newspaper,
  brands: Tags,
  events: CalendarDays,
  subscribers: Mail,
  media: ImageIcon,
};

export default function StudioShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activeHref = activeNavHref(pathname);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Close the drawer on navigation, derived at render rather than in an
  // effect — React's guidance for resetting state when a prop changes.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileNavOpen(false);
  }

  const sidebar = (
    <>
      <div className="flex h-12 shrink-0 items-center px-3">
        <span className="text-[13px] font-semibold text-admin-fg">
          Ladies Taylor
        </span>
        <span className="ml-1.5 rounded-admin-sm bg-admin-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-admin-fg">
          Studio
        </span>
      </div>

      <nav
        className="flex-1 overflow-y-auto px-2 py-2"
        aria-label="Studio sections"
      >
        {STUDIO_NAV.map((group, i) => (
          <div key={group.label ?? `group-${i}`} className={cn(i > 0 && "mt-5")}>
            {group.label && (
              <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-admin-muted">
                {group.label}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = ICONS[item.iconKey];
                const active = activeHref === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex items-center gap-2.5 rounded-admin-md px-2 py-1.5 text-[13px] transition-colors",
                        FOCUS_RING,
                        active
                          ? "bg-admin-fg font-medium text-white"
                          : "text-admin-fg hover:bg-admin-surface-hover"
                      )}
                    >
                      {active && (
                        <span
                          aria-hidden="true"
                          className="absolute -left-2 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-admin-accent"
                        />
                      )}
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-admin-border p-2">
        <a
          href={STUDIO_CRM_URL}
          target="_blank"
          rel="noreferrer noopener"
          className={cn(
            "flex items-center gap-2.5 rounded-admin-md px-2 py-1.5 text-[13px] text-admin-muted transition-colors hover:bg-admin-surface-hover hover:text-admin-fg",
            FOCUS_RING
          )}
        >
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
          Leads &amp; CRM
        </a>
      </div>
    </>
  );

  return (
    <div className="admin-root flex min-h-screen">
      <a
        href="#studio-main"
        className="fixed left-2 top-2 z-[70] -translate-y-16 rounded-admin-md bg-admin-fg px-3 py-2 text-[13px] text-white transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="studio-nav"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 shrink-0 flex-col border-r border-admin-border bg-admin-surface transition-transform duration-200 md:static md:translate-x-0",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b border-admin-border bg-admin-bg/95 px-3 backdrop-blur">
          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-expanded={mobileNavOpen}
            aria-controls="studio-nav"
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-admin-md text-admin-fg hover:bg-admin-surface-hover md:hidden",
              FOCUS_RING
            )}
          >
            {mobileNavOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <MenuIcon className="h-4 w-4" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <StudioBreadcrumbs />
          </div>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className={cn(
              "flex h-8 items-center gap-2 rounded-admin-md border border-admin-border-strong px-2.5 text-xs text-admin-muted transition-colors hover:bg-admin-surface-hover hover:text-admin-fg",
              FOCUS_RING
            )}
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded-admin-sm border border-admin-border bg-admin-surface px-1 font-sans text-[10px] sm:inline">
              ⌘K
            </kbd>
          </button>

          <Menu>
            <MenuTrigger asChild>
              <button
                type="button"
                aria-label="Account menu"
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full bg-admin-fg text-xs font-semibold uppercase text-white",
                  FOCUS_RING
                )}
              >
                {userEmail.slice(0, 1)}
              </button>
            </MenuTrigger>
            <MenuContent>
              <MenuLabel>
                <span className="block truncate">{userEmail}</span>
              </MenuLabel>
              <MenuSeparator />
              <MenuItem asChild>
                <a
                  href={STUDIO_CRM_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  Leads &amp; CRM
                </a>
              </MenuItem>
              <MenuSeparator />
              <MenuItem
                destructive
                onSelect={(event) => {
                  event.preventDefault();
                  void logout();
                }}
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Log out
              </MenuItem>
            </MenuContent>
          </Menu>
        </header>

        <main id="studio-main" className="flex-1 px-6 py-6">
          {children}
        </main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      <Suspense fallback={null}>
        <Toast />
      </Suspense>
    </div>
  );
}
