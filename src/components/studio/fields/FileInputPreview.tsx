"use client";

import { useId, useState } from "react";
import { Label } from "@/components/ui/Text";
import { FOCUS_RING } from "@/components/ui/focus";
import { cn } from "@/lib/ui/cn";

/**
 * Studio-styled copy of components/admin/FileInputPreview. Shows the picked
 * filename (and an image thumbnail where applicable) instead of leaving the
 * user to guess whether their click registered — native file inputs give no
 * feedback beyond tiny, inconsistent browser chrome text.
 */
export default function FileInputPreview({
  id,
  name,
  label,
  accept,
  helperText,
}: {
  id?: string;
  name: string;
  label: string;
  accept?: string;
  helperText?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    if (!file) {
      setFileName(null);
      setPreviewUrl(null);
      return;
    }

    setFileName(file.name);
    setPreviewUrl(
      file.type.startsWith("image/") ? URL.createObjectURL(file) : null
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="flex items-center gap-2">
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- transient blob: preview, not a real asset URL
          <img
            src={previewUrl}
            alt=""
            className="h-8 w-8 shrink-0 rounded-admin-sm border border-admin-border object-cover"
          />
        )}
        <input
          id={inputId}
          type="file"
          name={name}
          accept={accept}
          onChange={handleChange}
          className={cn(
            "w-full text-[13px] text-admin-muted",
            "file:mr-2 file:rounded-admin-md file:border file:border-admin-border-strong file:bg-admin-bg file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-admin-fg hover:file:bg-admin-surface-hover",
            FOCUS_RING
          )}
        />
      </div>
      {fileName && (
        <p className="text-xs text-admin-muted">Selected: {fileName}</p>
      )}
      {!fileName && helperText && (
        <p className="text-xs text-admin-muted">{helperText}</p>
      )}
    </div>
  );
}
