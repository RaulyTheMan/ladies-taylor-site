import Link from "next/link";
import { cn } from "@/lib/ui/cn";
import { FOCUS_RING } from "@/components/ui/focus";

export type StudioTab = { value: string; label: string };

/**
 * Server-rendered, URL-driven tabs. Uses Link rather than a bare anchor so
 * switching tabs is a client navigation and doesn't discard the shell.
 */
export default function StudioTabs({
  tabs,
  current,
  paramName = "tab",
  basePath,
}: {
  tabs: StudioTab[];
  current: string;
  paramName?: string;
  /** Path to link against; the first tab links here with no query. */
  basePath: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter"
      className="flex flex-wrap gap-4 border-b border-admin-border"
    >
      {tabs.map((tab) => {
        const active = current === tab.value;
        const isFirst = tab.value === tabs[0].value;
        return (
          <Link
            key={tab.value}
            href={isFirst ? basePath : `${basePath}?${paramName}=${tab.value}`}
            role="tab"
            aria-selected={active}
            className={cn(
              "-mb-px border-b-2 pb-2 text-[13px] transition-colors",
              FOCUS_RING,
              active
                ? "border-admin-fg font-medium text-admin-fg"
                : "border-transparent text-admin-muted hover:text-admin-fg"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
