import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { Heading, Text } from "./Text";
import { FOCUS_RING } from "./focus";

export type Crumb = { label: string; href?: string };

/**
 * The single page-title treatment. Replaces both the per-page ADMIN_H1_CLASS
 * heading and the Breadcrumbs component that had to be remembered and pasted
 * into each new/edit page.
 */
export default function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-admin-muted">
            {breadcrumbs.map((crumb, i) => (
              <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className={cn(
                      "rounded-admin-sm hover:text-admin-fg hover:underline",
                      FOCUS_RING
                    )}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-admin-fg">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading level={1} as="h1">
            {title}
          </Heading>
          {description && (
            <Text muted className="mt-1">
              {description}
            </Text>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
