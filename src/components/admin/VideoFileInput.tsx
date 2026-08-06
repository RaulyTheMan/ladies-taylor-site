"use client";

import { useId, useRef, useState } from "react";

// A video file input that reads the file's native width/height on the
// client (via an off-DOM <video> element) and submits them as hidden
// fields alongside the file, so the server can size the window to the
// real aspect ratio without needing any video-parsing dependency. Styled
// as an upload dropzone with a live preview, not a bare file picker.
export default function VideoFileInput({
  name,
  helperText,
}: {
  name: string;
  helperText?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) {
      setFileName(null);
      setPreviewUrl(null);
      setDimensions(null);
      return;
    }

    setFileName(file.name);
    setDimensions(null);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      setDimensions({ width: probe.videoWidth, height: probe.videoHeight });
    };
    probe.onerror = () => {
      setError("Couldn't read this video's dimensions — it'll still upload with a default size.");
    };
    probe.src = objectUrl;
  }

  return (
    <div>
      <p className="text-xs text-black/50">Attach a Video</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-1 text-sm text-black/40 underline decoration-black/20 underline-offset-2 hover:text-black/60"
      >
        {fileName ?? "Upload File"}
      </button>

      <label htmlFor={inputId} className="sr-only">
        Video file
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        name={name}
        accept="video/*"
        onChange={handleChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Upload video"
        className="mt-3 flex aspect-[9/16] w-full max-w-[260px] items-center justify-center overflow-hidden rounded-md bg-black/10"
      >
        {previewUrl ? (
          <video src={previewUrl} className="h-full w-full object-cover" muted playsInline />
        ) : (
          <span className="text-sm font-bold uppercase tracking-wide text-white/80">
            Preview
          </span>
        )}
      </button>

      {dimensions && (
        <>
          <input type="hidden" name="videoWidth" value={dimensions.width} />
          <input type="hidden" name="videoHeight" value={dimensions.height} />
          <p className="mt-2 text-xs text-black/60">
            {dimensions.width}×{dimensions.height}
          </p>
        </>
      )}
      {error && <p className="mt-1 text-xs text-lt-red">{error}</p>}
      {!fileName && helperText && (
        <p className="mt-2 text-xs text-black/60">{helperText}</p>
      )}
    </div>
  );
}
