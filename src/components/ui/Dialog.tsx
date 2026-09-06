"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { FOCUS_RING } from "./focus";

/**
 * Radix supplies the behaviour — focus trap, Escape, scroll lock, and the
 * ARIA wiring. Styling is ours.
 *
 * `admin-root` is repeated on the content because Radix portals it to
 * <body>, outside the studio shell's own scope, so it would otherwise
 * inherit the marketing layout's yellow background and tight tracking.
 */
export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;

export function DialogContent({
  title,
  description,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDialog.Content> & {
  title: string;
  description?: string;
}) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-[60] bg-black/40" />
      <RadixDialog.Content
        className={cn(
          "admin-root fixed left-1/2 top-1/2 z-[61] w-[min(34rem,calc(100vw-2rem))] max-h-[85vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-admin-lg border border-admin-border bg-admin-bg p-5 shadow-2xl",
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <RadixDialog.Title className="text-base font-semibold text-admin-fg">
              {title}
            </RadixDialog.Title>
            {description ? (
              <RadixDialog.Description className="mt-0.5 text-[13px] text-admin-muted">
                {description}
              </RadixDialog.Description>
            ) : (
              // Radix warns when Content has no Description; this satisfies it
              // without inventing copy the screen doesn't need.
              <RadixDialog.Description className="sr-only">
                {title}
              </RadixDialog.Description>
            )}
          </div>
          <RadixDialog.Close
            aria-label="Close"
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-admin-md text-admin-muted hover:bg-admin-surface-hover hover:text-admin-fg",
              FOCUS_RING
            )}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </RadixDialog.Close>
        </div>

        <div className="mt-4">{children}</div>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
