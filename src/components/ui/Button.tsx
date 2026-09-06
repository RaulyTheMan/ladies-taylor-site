import { cn } from "@/lib/ui/cn";
import { FOCUS_RING } from "./focus";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-admin-fg text-white hover:bg-admin-fg/85",
  secondary:
    "border border-admin-border-strong bg-admin-bg text-admin-fg hover:bg-admin-surface-hover",
  ghost: "text-admin-fg hover:bg-admin-surface-hover",
  danger: "bg-admin-danger text-white hover:bg-admin-danger/85",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-[26px] gap-1.5 px-2 text-xs",
  md: "h-8 gap-2 px-3 text-[13px]",
};

const BASE =
  "inline-flex shrink-0 items-center justify-center rounded-admin-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-40";

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string
) {
  return cn(BASE, VARIANTS[variant], SIZES[size], FOCUS_RING, className);
}

export default function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      type={props.type ?? "button"}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}

/** Square, icon-only. The aria-label is required — there's no text to read. */
export function IconButton({
  variant = "ghost",
  size = "md",
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  "aria-label": string;
}) {
  return (
    <button
      type={props.type ?? "button"}
      className={buttonClasses(
        variant,
        size,
        cn(size === "sm" ? "w-[26px] px-0" : "w-8 px-0", className)
      )}
      {...props}
    />
  );
}
