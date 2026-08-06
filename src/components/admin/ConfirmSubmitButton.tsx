"use client";

import { useRef, useState, type ReactNode } from "react";
import { ADMIN_BUTTON_DANGER_CLASS, ADMIN_BUTTON_SECONDARY_CLASS } from "@/lib/admin/ui";

// A destructive action's trigger button. Renders a native <dialog> confirm
// step before doing anything — <dialog>.showModal() gives us a focus trap,
// Escape-to-close, and inert background for free, no extra library needed.
//
// Two usage modes:
// 1. Inside `<form action={serverAction}>...</form>` — omit `onConfirm` and
//    it submits that form via the button's `.form` reference once confirmed.
// 2. Standalone (e.g. a client component calling an async prop) — pass
//    `onConfirm` and it awaits that instead of touching a form.
export default function ConfirmSubmitButton({
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

  function openConfirm() {
    dialogRef.current?.showModal();
  }

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
        onClick={openConfirm}
        disabled={disabled || pending}
        aria-label={ariaLabel}
        className={`${className ?? ""} disabled:opacity-50`}
      >
        {pending ? "Deleting…" : children}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={`confirm-title-${confirmTitle}`}
        role="alertdialog"
        className="w-[calc(100%-2rem)] max-w-sm rounded-lg border border-black/10 bg-white p-6 backdrop:bg-black/50 open:animate-none"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        onCancel={(e) => {
          // Let Escape close the dialog natively without also submitting.
          e.currentTarget.close();
        }}
      >
        <h2
          id={`confirm-title-${confirmTitle}`}
          className="text-base font-semibold text-black"
        >
          {confirmTitle}
        </h2>
        <p className="mt-2 text-sm text-black/70">{confirmMessage}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className={ADMIN_BUTTON_SECONDARY_CLASS}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={ADMIN_BUTTON_DANGER_CLASS}
          >
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
