"use client";

import { useId, useState } from "react";

// A file input that shows the picked filename (and an image thumbnail, when
// applicable) instead of leaving the user to guess whether their click
// registered. Native file inputs give no feedback beyond tiny, inconsistent
// browser chrome text.
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
    setPreviewUrl(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
  }

  return (
    <div>
      <label htmlFor={inputId} className="text-xs font-medium text-black/55">
        {label}
      </label>
      <div className="mt-1 flex items-center gap-3">
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- transient blob: preview, not a real asset URL
          <img
            src={previewUrl}
            alt=""
            className="h-10 w-10 shrink-0 rounded-md border border-black/10 object-cover"
          />
        )}
        <input
          id={inputId}
          type="file"
          name={name}
          accept={accept}
          onChange={handleChange}
          className="w-full text-sm text-black/70 file:mr-3 file:rounded-md file:border file:border-black/15 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black hover:file:bg-black/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        />
      </div>
      {fileName && (
        <p className="mt-1 text-xs text-black/60">Selected: {fileName}</p>
      )}
      {!fileName && helperText && (
        <p className="mt-1 text-xs text-black/60">{helperText}</p>
      )}
    </div>
  );
}
