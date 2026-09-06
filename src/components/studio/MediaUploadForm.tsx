"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import { FOCUS_RING } from "@/components/ui/focus";
import { cn } from "@/lib/ui/cn";

/**
 * The upload control lives in the page header, so it stays a single row: pick
 * a file, then submit. The submit button is disabled until a file is chosen —
 * the old form let you submit nothing and get a thrown "No file provided."
 */
function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending}>
      <Upload className="h-3.5 w-3.5" aria-hidden="true" />
      {pending ? "Uploading…" : "Upload"}
    </Button>
  );
}

export default function MediaUploadForm({
  action,
}: {
  action: (formData: FormData) => void;
}) {
  const [hasFile, setHasFile] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={() => setHasFile(false)}
      className="flex items-center gap-2"
    >
      <label htmlFor="media-upload" className="sr-only">
        Choose a file to upload
      </label>
      <input
        id="media-upload"
        type="file"
        name="file"
        required
        onChange={(e) => setHasFile(Boolean(e.target.files?.length))}
        className={cn(
          "max-w-56 text-[13px] text-admin-muted",
          "file:mr-2 file:rounded-admin-md file:border file:border-admin-border-strong file:bg-admin-bg file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-admin-fg hover:file:bg-admin-surface-hover",
          FOCUS_RING
        )}
      />
      <SubmitButton disabled={!hasFile} />
    </form>
  );
}
