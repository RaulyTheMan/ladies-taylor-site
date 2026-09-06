"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Trash2, ImageOff, FileVideo, Copy, Check, X } from "lucide-react";
import type { MediaFile } from "@/lib/admin/media";
import { EmptyState } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import ConfirmButton from "@/components/ui/ConfirmButton";
import { controlClasses } from "@/components/ui/Field";
import { Heading } from "@/components/ui/Text";
import { formatDate } from "@/lib/ui/formatDate";
import { cn } from "@/lib/ui/cn";
import { FOCUS_RING } from "@/components/ui/focus";

function isImage(mimetype: string | null) {
  return !!mimetype && mimetype.startsWith("image/");
}

/** Clipboard API first, legacy execCommand second, false if neither works. */
async function writeToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      el.remove();
      return ok;
    } catch {
      return false;
    }
  }
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
  const [copyState, setCopyState] = useState<{
    path: string;
    ok: boolean;
  } | null>(null);

  const filtered = useMemo(
    () =>
      files.filter((f) => f.name.toLowerCase().includes(query.toLowerCase())),
    [files, query]
  );
  const recent = filtered.slice(0, 12);

  async function handleDelete(path: string) {
    setDeletingPath(path);
    try {
      await onDelete(path);
    } finally {
      setDeletingPath(null);
    }
  }

  async function copyUrl(file: MediaFile) {
    // The Clipboard API rejects in plenty of ordinary situations — an
    // insecure origin, an unfocused document, a restrictive permissions
    // policy — and an uncaught rejection here would leave the button looking
    // like it simply did nothing. Fall back to the legacy path, and if that
    // fails too, say so rather than pretending it worked.
    const ok = await writeToClipboard(file.url);
    setCopyState({ path: file.path, ok });
    window.setTimeout(() => setCopyState(null), ok ? 1500 : 3000);
  }

  if (files.length === 0) {
    return (
      <EmptyState
        icon={ImageOff}
        title="No files yet"
        description="Upload an image or video and it becomes available to every section."
      />
    );
  }

  return (
    <div>
      <p aria-live="polite" className="sr-only">
        {copyState
          ? copyState.ok
            ? "Public URL copied to the clipboard."
            : "Couldn't copy the URL. Copy it from the file's page instead."
          : ""}
      </p>

      <label htmlFor="media-library-search" className="sr-only">
        Search files
      </label>
      <input
        id="media-library-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search files..."
        className={controlClasses(false, "h-8 max-w-xs px-2.5")}
      />

      {filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={ImageOff}
            title="No files match your search"
            description={`Nothing named like “${query}”.`}
          />
        </div>
      ) : (
        <>
          <Heading level={3} className="mt-6">
            Recent
          </Heading>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {recent.map((file) => (
              <figure
                key={file.path}
                className="flex flex-col overflow-hidden rounded-admin-md border border-admin-border"
              >
                <div className="relative aspect-square bg-admin-surface">
                  {isImage(file.mimetype) ? (
                    <Image
                      src={file.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FileVideo
                        className="h-5 w-5 text-admin-muted"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </div>
                <figcaption
                  className="truncate px-2 py-1.5 text-xs text-admin-muted"
                  title={file.name}
                >
                  {file.name}
                </figcaption>
              </figure>
            ))}
          </div>

          <Heading level={3} className="mt-8">
            All files
          </Heading>
          <div className="mt-3 overflow-x-auto rounded-admin-lg border border-admin-border">
            <table className="w-full border-collapse text-left text-[13px]">
              <caption className="sr-only">
                Every file in the media library
              </caption>
              <thead>
                <tr className="bg-admin-surface">
                  {["Name", "Modified", "Size", "Type"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="whitespace-nowrap border-b border-admin-border px-3 py-2 text-xs font-semibold text-admin-fg"
                    >
                      {h}
                    </th>
                  ))}
                  <th className="border-b border-admin-border px-3 py-2">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((file) => (
                  <tr
                    key={file.path}
                    className="border-b border-admin-border last:border-0 hover:bg-admin-surface"
                  >
                    <td
                      className="max-w-xs truncate px-3 py-2 text-admin-fg"
                      title={file.path}
                    >
                      {file.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-admin-muted">
                      {formatDate(file.updatedAt)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-admin-muted">
                      {formatBytes(file.size)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-admin-muted">
                      {file.mimetype ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => copyUrl(file)}
                          aria-label={`Copy public URL for ${file.name}`}
                          className={cn(
                            buttonClasses("ghost", "sm", "w-[26px] px-0"),
                            FOCUS_RING
                          )}
                        >
                          {copyState?.path === file.path ? (
                            copyState.ok ? (
                              <Check
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                            ) : (
                              <X
                                className="h-3.5 w-3.5 text-admin-danger"
                                aria-hidden="true"
                              />
                            )
                          ) : (
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                        </button>
                        <ConfirmButton
                          confirmTitle="Delete this file?"
                          confirmMessage={`"${file.name}" will be permanently removed from the media library. This can't be undone, and any page still referencing it will break.`}
                          onConfirm={() => handleDelete(file.path)}
                          disabled={deletingPath === file.path}
                          ariaLabel={`Delete ${file.name}`}
                          className={buttonClasses(
                            "ghost",
                            "sm",
                            "w-[26px] px-0 text-admin-muted hover:bg-admin-danger-surface hover:text-admin-danger"
                          )}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </ConfirmButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
