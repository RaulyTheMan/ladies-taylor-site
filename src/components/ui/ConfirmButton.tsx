"use client";

import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import Button from "./Button";

/**
 * A destructive action's trigger, gated behind a confirm step.
 *
 * Uses a native <dialog> with showModal(), which supplies the focus trap,
 * Escape-to-close and inert background for free — no library needed, and the
 * same approach the previous admin used.
 *
 * Two modes, matching the original:
 *  1. Inside <form action={serverAction}> — omit onConfirm and it submits that
 *     form via the button's .form reference once confirmed.
 *  2. Standalone — pass onConfirm and it awaits that instead.
 */
export default function ConfirmButton({
  children,
  confirmTitle,
  confirmMessage,
  confirmLabel = "Delete",
  className,
  onConfirm,
  disabled,
  ariaLabel,
}: {
  children: ReactNode;
  confirmTitle: string;
  confirmMessage: string;
  confirmLabel?: string;
  className?: string;
  onConfirm?: () => void | Promise<void>;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    dialogRef.current?.close();
    if (onConfirm) {
      setPending(true);
      try {
        await onConfirm();
      } finally {
        setPending(false);
      }
    } else {
      buttonRef.current?.form?.requestSubmit();
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        disabled={disabled || pending}
        aria-label={ariaLabel}
        className={cn(className, "disabled:opacity-40")}
      >
        {children}
      </button>

      <dialog
        ref={dialogRef}
        role="alertdialog"
        className="admin-root w-[calc(100%-2rem)] max-w-sm rounded-admin-lg border border-admin-border bg-admin-bg p-5 text-admin-fg backdrop:bg-black/50 open:animate-none"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        onCancel={(e) => {
          // Let Escape close natively without also submitting the form.
          e.currentTarget.close();
        }}
      >
        <h2 className="text-base font-semibold text-admin-fg">{confirmTitle}</h2>
        <p className="mt-1.5 text-[13px] text-admin-muted">{confirmMessage}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => dialogRef.current?.close()}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            {pending ? "Deleting…" : confirmLabel}
          </Button>
        </div>
      </dialog>
    </>
  );
}
