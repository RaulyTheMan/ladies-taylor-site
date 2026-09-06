import { cn } from "@/lib/ui/cn";

export type BadgeVariant = "neutral" | "accent" | "outline" | "danger";

const VARIANTS: Record<BadgeVariant, string> = {
  neutral: "border border-admin-border bg-admin-surface text-admin-fg",
  // Yellow is only ever a fill with black text on top — see globals.css.
  accent: "bg-admin-accent text-admin-fg",
  outline: "border border-admin-border-strong text-admin-muted",
  danger: "bg-admin-danger-surface text-admin-danger",
};

export default function Badge({
  variant = "neutral",
  className,
  ...props
}: React.ComponentPropsWithoutRef<"span"> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-admin-sm px-1.5 py-0.5 text-xs font-medium",
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}
