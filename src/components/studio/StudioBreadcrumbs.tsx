"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { FOCUS_RING } from "@/components/ui/focus";
import { STUDIO_NAV_ITEMS, activeNavHref } from "@/lib/studio/nav";

/** Trailing segments that aren't record ids get a readable name. */
const SEGMENT_LABELS: Record<string, string> = {
  new: "New",
  edit: "Edit",
  participants: "Participants",
  dock: "Dock Apps",
};

/**
 * Derived from the URL rather than passed down, so a page can never render
 * without its trail — the old per-page <Breadcrumbs> component had to be
 * remembered and pasted into each new/edit page, and several lacked it.
 */
export default function StudioBreadcrumbs() {
  const pathname = usePathname();
  const activeHref = activeNavHref(pathname);
  const section = STUDIO_NAV_ITEMS.find((item) => item.href === activeHref);

  if (!section) return null;

  const rest = pathname
    .slice(section.href.length)
    .split("/")
    .filter(Boolean)
    // Record ids are opaque — a uuid in the trail is noise, and the segment
    // after it ("edit", "participants") already says where you are.
    .filter((segment) => segment in SEGMENT_LABELS)
    .map((segment) => SEGMENT_LABELS[segment]);

  const isRoot = pathname === section.href;

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1 text-[13px]">
        <li className="min-w-0">
          {isRoot ? (
            <span aria-current="page" className="font-medium text-admin-fg">
              {section.label}
            </span>
          ) : (
            <Link
              href={section.href}
              className={cn(
                "rounded-admin-sm text-admin-muted hover:text-admin-fg hover:underline",
                FOCUS_RING
              )}
            >
              {section.label}
            </Link>
          )}
        </li>
        {rest.map((label, i) => (
          <li key={`${label}-${i}`} className="flex items-center gap-1">
            <ChevronRight
              className="h-3 w-3 shrink-0 text-admin-muted"
              aria-hidden="true"
            />
            {i === rest.length - 1 ? (
              <span aria-current="page" className="font-medium text-admin-fg">
                {label}
              </span>
            ) : (
              <span className="text-admin-muted">{label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
