import { cn } from "@/lib/ui/cn";
import { Heading, Text } from "./Text";

export default function Card({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "rounded-admin-lg border border-admin-border bg-admin-bg",
        className
      )}
      {...props}
    />
  );
}

/** A card on the tinted surface — for grouping, not for primary content. */
export function Panel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "rounded-admin-lg border border-admin-border bg-admin-surface",
        className
      )}
      {...props}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-admin-lg border border-dashed border-admin-border px-6 py-12 text-center">
      {Icon && <Icon className="h-6 w-6 text-admin-muted" aria-hidden="true" />}
      <div>
        <Heading level={3}>{title}</Heading>
        {description && (
          <Text muted className="mt-1 max-w-sm">
            {description}
          </Text>
        )}
      </div>
      {action}
    </div>
  );
}
