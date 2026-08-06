"use client";

import { useState } from "react";
import Image from "next/image";
import type { MediaFile } from "@/lib/admin/media";
import { ADMIN_INPUT_CLASS } from "@/lib/admin/ui";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";

function isImage(mimetype: string | null) {
  return !!mimetype && mimetype.startsWith("image/");
}

function formatBytes(bytes: number | null) {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryView({
  files,
  onDelete,
}: {
  files: MediaFile[];
  onDelete: (path: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [deletingPath, setDeletingPath] = useState<string | null>(null);

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );
  const recent = filtered.slice(0, 8);

  async function handleDelete(path: string) {
    setDeletingPath(path);
    try {
      await onDelete(path);
    } finally {
      setDeletingPath(null);
    }
  }

  return (
    <div>
      <label htmlFor="media-library-search" className="sr-only">
        Search files
      </label>
      <input
        id="media-library-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search files..."
        className={`${ADMIN_INPUT_CLASS} mt-0 max-w-sm`}
      />

      <h2 className="mt-8 text-lg font-semibold text-black">Recent Files</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {recent.map((file) => (
          <div
            key={file.path}
            className="flex flex-col overflow-hidden rounded-md border border-black/10 bg-black/[0.02]"
          >
            <div className="relative aspect-square bg-black/5">
              {isImage(file.mimetype) && (
                <Image
                  src={file.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              )}
            </div>
            <p className="truncate px-2 py-1.5 text-[11px] font-semibold text-black/70">
              {file.name}
            </p>
          </div>
        ))}
        {recent.length === 0 && (
          <p className="col-span-full text-sm text-black/60">
            No files yet.
          </p>
        )}
      </div>

      <h2 className="mt-10 text-lg font-semibold text-black">All Files</h2>
      <div className="mt-4 overflow-x-auto rounded-lg border border-black/10">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-xs font-medium uppercase tracking-wide text-black/60">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Last Modified</th>
              <th className="py-2 pr-4">Size</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((file) => (
              <tr key={file.path} className="border-b border-black/5">
                <td className="max-w-xs truncate py-2 pr-4 text-black">
                  {file.name}
                </td>
                <td className="py-2 pr-4 text-black/60">
                  {file.updatedAt
                    ? new Date(file.updatedAt).toLocaleDateString()
                    : "—"}
                </td>
                <td className="py-2 pr-4 text-black/60">
                  {formatBytes(file.size)}
                </td>
                <td className="py-2 pr-4 text-black/60">
                  {file.mimetype ?? "—"}
                </td>
                <td className="py-2 text-right">
                  <ConfirmSubmitButton
                    confirmTitle="Delete this file?"
                    confirmMessage={`"${file.name}" will be permanently removed from the media library. This can't be undone, and any page still referencing it will break.`}
                    onConfirm={() => handleDelete(file.path)}
                    disabled={deletingPath === file.path}
                    className="rounded px-1 py-1 text-xs font-medium text-red-600 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  >
                    {deletingPath === file.path ? "Deleting…" : "Delete"}
                  </ConfirmSubmitButton>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-sm text-black/60">
                  No files found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
