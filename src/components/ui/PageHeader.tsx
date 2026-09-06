import { cn } from "@/lib/ui/cn";
import { Heading, Text } from "./Text";

/**
 * The single page-title treatment, replacing the per-page ADMIN_H1_CLASS
 * heading.
 *
 * Deliberately has no breadcrumb slot: the studio's top bar derives the trail
 * from the URL for every page, so a second copy here would just repeat itself
 * two lines lower. The title carries the record-specific detail instead
 * ("Edit @coming-soon" under a "Brands › Edit" trail).
 */
export default function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3",
        className
      )}
    >
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
  );
}
