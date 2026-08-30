import { cn } from "@/lib/ui/cn";

const HEADING_SIZES = {
  1: "text-xl font-semibold",
  2: "text-base font-semibold",
  3: "text-[13px] font-semibold",
} as const;

export function Heading({
  level = 2,
  as,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h2"> & {
  level?: 1 | 2 | 3;
  as?: "h1" | "h2" | "h3" | "h4";
}) {
  const Tag = as ?? (`h${level}` as const);
  return (
    <Tag
      className={cn("text-admin-fg", HEADING_SIZES[level], className)}
      {...props}
    />
  );
}

export function Text({
  muted = false,
  size = "md",
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p"> & {
  muted?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <p
      className={cn(
        size === "sm" ? "text-xs" : "text-[13px]",
        muted ? "text-admin-muted" : "text-admin-fg",
        className
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"label">) {
  return (
    <label
      className={cn("block text-xs font-medium text-admin-fg", className)}
      {...props}
    />
  );
}

/** Vertical rhythm. `gap` is a Tailwind step, not pixels. */
export function Stack({
  gap = 4,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { gap?: 1 | 2 | 3 | 4 | 6 | 8 }) {
  return <div className={cn("flex flex-col", GAP[gap], className)} {...props} />;
}

export function Inline({
  gap = 2,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { gap?: 1 | 2 | 3 | 4 | 6 | 8 }) {
  return (
    <div
      className={cn("flex flex-wrap items-center", GAP[gap], className)}
      {...props}
    />
  );
}

// Spelled out rather than interpolated so Tailwind's scanner sees them.
const GAP = {
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
} as const;

export function Separator({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-admin-border", className)} />;
}
