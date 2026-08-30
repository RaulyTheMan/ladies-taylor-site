"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/ui/cn";
import { FOCUS_RING } from "./focus";

/**
 * Radix supplies the behaviour only — roving focus, typeahead, Escape, click
 * outside, and the ARIA wiring. Every pixel of the styling is ours.
 */
export const Menu = DropdownMenu.Root;
export const MenuTrigger = DropdownMenu.Trigger;

export function MenuContent({
  className,
  align = "end",
  sideOffset = 6,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenu.Content>) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-44 rounded-admin-md border border-admin-border bg-admin-bg p-1 shadow-lg",
          className
        )}
        {...props}
      />
    </DropdownMenu.Portal>
  );
}

export function MenuItem({
  className,
  destructive,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenu.Item> & {
  destructive?: boolean;
}) {
  return (
    <DropdownMenu.Item
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 rounded-admin-sm px-2 py-1.5 text-[13px] outline-none",
        destructive
          ? "text-admin-danger data-highlighted:bg-admin-danger-surface"
          : "text-admin-fg data-highlighted:bg-admin-surface-hover",
        "data-disabled:pointer-events-none data-disabled:opacity-40",
        FOCUS_RING,
        className
      )}
      {...props}
    />
  );
}

export function MenuSeparator({ className }: { className?: string }) {
  return (
    <DropdownMenu.Separator
      className={cn("my-1 h-px bg-admin-border", className)}
    />
  );
}

export function MenuLabel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenu.Label>) {
  return (
    <DropdownMenu.Label
      className={cn("px-2 py-1.5 text-xs text-admin-muted", className)}
      {...props}
    />
  );
}
