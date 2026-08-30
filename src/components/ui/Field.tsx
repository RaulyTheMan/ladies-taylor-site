import { useId } from "react";
import { cn } from "@/lib/ui/cn";
import { FOCUS_RING } from "./focus";
import { Label } from "./Text";

const CONTROL_BASE =
  "w-full rounded-admin-md border bg-admin-bg text-[13px] text-admin-fg placeholder:text-admin-muted transition-colors disabled:opacity-50";

export const controlClasses = (invalid?: boolean, className?: string) =>
  cn(
    CONTROL_BASE,
    invalid
      ? "border-admin-danger"
      : "border-admin-border-strong hover:border-admin-fg/40",
    FOCUS_RING,
    className
  );

/**
 * Wraps a control with its label, hint and error, and wires up the
 * `id` / `aria-describedby` / `aria-invalid` triangle so the hint and the
 * error are actually announced instead of just being visible.
 */
export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean | undefined;
  }) => React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="ml-0.5 text-admin-danger" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-admin-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-admin-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({
  invalid,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"input"> & { invalid?: boolean }) {
  return (
    <input
      className={controlClasses(invalid, cn("h-8 px-2.5", className))}
      {...props}
    />
  );
}

export function TextArea({
  invalid,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"textarea"> & { invalid?: boolean }) {
  return (
    <textarea
      className={controlClasses(invalid, cn("min-h-20 px-2.5 py-2", className))}
      {...props}
    />
  );
}

export function Select({
  invalid,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"select"> & { invalid?: boolean }) {
  return (
    <select
      className={controlClasses(invalid, cn("h-8 px-2 pr-7", className))}
      {...props}
    />
  );
}

export function Checkbox({
  label,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"input"> & { label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-admin-fg">
      <input
        type="checkbox"
        className={cn(
          "h-4 w-4 shrink-0 rounded-admin-sm border-admin-border-strong accent-admin-fg",
          FOCUS_RING,
          className
        )}
        {...props}
      />
      {label}
    </label>
  );
}
