"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { MediaFile } from "@/lib/admin/media";
import { ADMIN_FOCUS_RING_CLASS } from "@/lib/admin/ui";

function isImage(mimetype: string | null) {
  return !!mimetype && mimetype.startsWith("image/");
}

export default function MediaPicker({
  files,
  onSelect,
  triggerLabel = "Choose from Library",
}: {
  files: MediaFile[];
  onSelect: (url: string) => void;
  triggerLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  function openPicker() {
    setQuery("");
    dialogRef.current?.showModal();
  }

  function closePicker() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className={`rounded px-0.5 py-1 text-xs font-medium text-black/60 underline underline-offset-2 hover:text-black ${ADMIN_FOCUS_RING_CLASS}`}
      >
        {triggerLabel}
      </button>

      {/*
        Native <dialog> via showModal() gives us a focus trap, Escape-to-close,
        and an inert background for free — the old hand-rolled `fixed inset-0`
        div let keyboard focus escape into the page behind it.
      */}
      <dialog
        ref={dialogRef}
        aria-labelledby="media-picker-title"
        className="m-auto max-h-[80vh] w-[calc(100%-2rem)] max-w-2xl rounded-lg border border-black/10 bg-white p-6 shadow-xl backdrop:bg-black/50"
        onClick={(e) => {
          if (e.target === dialogRef.current) closePicker();
        }}
        onCancel={(e) => {
          e.preventDefault();
          closePicker();
        }}
      >
        <div className="flex max-h-[calc(80vh-3rem)] flex-col">
          <div className="flex items-center justify-between">
            <h3
              id="media-picker-title"
              className="text-base font-semibold text-black"
            >
              Media Library
            </h3>
            <button
              type="button"
              onClick={closePicker}
              className={`rounded px-2 py-1 text-sm font-medium text-black/60 hover:text-black ${ADMIN_FOCUS_RING_CLASS}`}
            >
              Close
            </button>
          </div>

          <label htmlFor="media-picker-search" className="sr-only">
            Search files
          </label>
          <input
            id="media-picker-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files..."
            className="mt-4 rounded-md border border-black/15 px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15"
          />

          <div className="mt-4 grid flex-1 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
            {filtered.map((file) => (
              <button
                key={file.path}
                type="button"
                onClick={() => {
                  onSelect(file.url);
                  closePicker();
                }}
                className={`flex flex-col overflow-hidden rounded-md border border-black/10 bg-black/[0.02] text-left hover:border-black/25 ${ADMIN_FOCUS_RING_CLASS}`}
              >
                <div className="relative aspect-square bg-black/5">
                  {isImage(file.mimetype) && (
                    <Image
                      src={file.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  )}
                </div>
                <p className="truncate px-1.5 py-1 text-[11px] text-black/70">
                  {file.name}
                </p>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full text-sm text-black/60">
                No files found.
              </p>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
