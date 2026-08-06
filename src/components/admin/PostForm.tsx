"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, UserRound, X } from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import FileInputPreview from "@/components/admin/FileInputPreview";
import type { TiptapDoc } from "@/lib/richtext/types";
import { uploadInlineImage } from "@/app/admin/(dashboard)/press-media/upload-image-action";
import {
  ADMIN_BUTTON_CLASS,
  ADMIN_FOCUS_RING_CLASS,
  ADMIN_INPUT_CLASS as inputClass,
  ADMIN_LABEL_CLASS as labelClass,
} from "@/lib/admin/ui";

export type PostFormDefaults = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  authorName: string;
  authorInitial: string;
  publishedAt: string; // yyyy-mm-dd, empty if TBD
  contentUpdatedAt: string;
  readTimeLabel: string;
  body: TiptapDoc;
  isPlaceholder: boolean;
  isPublished: boolean;
  coverImageUrl?: string;
};

export default function PostForm({
  action,
  backHref,
  defaults,
}: {
  action: (formData: FormData) => void;
  backHref: string;
  defaults?: PostFormDefaults;
}) {
  const [isPublished, setIsPublished] = useState(defaults?.isPublished ?? true);
  const [bylineOpen, setBylineOpen] = useState(Boolean(defaults?.authorName));
  const [authorName, setAuthorName] = useState(defaults?.authorName ?? "Rauly");

  return (
    <form action={action} className="bg-white">
      {/* Top bar — back, live draft/published status, save. */}
      <div className="sticky top-0 z-10 -mx-8 flex items-center justify-between border-b border-black/10 bg-white/95 px-8 py-4 backdrop-blur">
        <Link
          href={backHref}
          aria-label="Back"
          className={`flex h-9 w-9 items-center justify-center rounded-md text-black/60 hover:bg-black/5 hover:text-black ${ADMIN_FOCUS_RING_CLASS}`}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-black/55">
            {isPublished ? "Published" : "Draft"}
          </span>
          <button type="submit" className={ADMIN_BUTTON_CLASS}>
            Save Post
          </button>
        </div>
      </div>

      {/* Compose surface */}
      <div className="mx-auto max-w-2xl bg-white pb-24 pt-10">
        <label htmlFor="title" className="sr-only">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={defaults?.title}
          placeholder="Title"
          className="w-full border-none bg-transparent font-gothic text-4xl leading-tight text-black placeholder:text-black/25 focus:outline-none md:text-5xl"
        />

        <label htmlFor="excerpt" className="sr-only">
          Subtitle
        </label>
        <input
          id="excerpt"
          name="excerpt"
          defaultValue={defaults?.excerpt}
          placeholder="Add a subtitle..."
          className="mt-2 w-full border-none bg-transparent text-lg text-black/50 placeholder:text-black/35 focus:outline-none"
        />

        {bylineOpen ? (
          <div className="mt-4 flex items-center gap-2">
            <UserRound className="h-4 w-4 shrink-0 text-black/40" />
            <input
              name="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Author name"
              className="rounded-md border border-black/15 bg-white px-2.5 py-1 text-sm text-black focus:outline-none focus:border-black focus:ring-2 focus:ring-black/15"
            />
            <button
              type="button"
              onClick={() => setBylineOpen(false)}
              aria-label="Remove byline"
              className={`flex h-6 w-6 items-center justify-center rounded text-black/40 hover:bg-black/5 hover:text-black ${ADMIN_FOCUS_RING_CLASS}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <>
            {/* Keeps a byline in the submission even while the field is
                hidden, so removing it visually doesn't blank out the author
                on save. */}
            <input type="hidden" name="authorName" value={authorName} />
            <button
              type="button"
              onClick={() => setBylineOpen(true)}
              className={`mt-4 flex items-center gap-1.5 rounded-full border border-black/15 py-1.5 pl-1.5 pr-3 text-xs font-medium text-black/60 hover:border-black/30 hover:text-black ${ADMIN_FOCUS_RING_CLASS}`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/5">
                +
              </span>
              Add byline
            </button>
          </>
        )}

        <div className="mt-8">
          <span id="body-label" className="sr-only">
            Body
          </span>
          <RichTextEditor
            name="body"
            slug={defaults?.slug ?? ""}
            defaultValue={defaults?.body}
            uploadImageAction={uploadInlineImage}
            ariaLabelledBy="body-label"
          />
        </div>

        {/* Post details — everything that isn't the writing itself, kept on
            this same page (not tucked behind a dialog) so it's all editable
            in one place. */}
        <div className="mt-14 border-t border-black/10 pt-8">
          <h2 className="text-sm font-semibold text-black">Post details</h2>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="slug" className={labelClass}>
                Slug <span aria-hidden="true">*</span>
              </label>
              <input
                id="slug"
                name="slug"
                required
                defaultValue={defaults?.slug}
                placeholder="best-reels-of-june"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="category" className={labelClass}>
                Category
              </label>
              <input
                id="category"
                name="category"
                defaultValue={defaults?.category ?? "Press & Media"}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="readTimeLabel" className={labelClass}>
                Read Time
              </label>
              <input
                id="readTimeLabel"
                name="readTimeLabel"
                defaultValue={defaults?.readTimeLabel}
                placeholder="7 Minute Read"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="authorInitial" className={labelClass}>
                Author Initial
              </label>
              <input
                id="authorInitial"
                name="authorInitial"
                defaultValue={defaults?.authorInitial ?? "R"}
                maxLength={2}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="publishedAt" className={labelClass}>
                Published Date (blank = TBD)
              </label>
              <input
                id="publishedAt"
                type="date"
                name="publishedAt"
                defaultValue={defaults?.publishedAt}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="contentUpdatedAt" className={labelClass}>
                Updated Date (blank = TBD)
              </label>
              <input
                id="contentUpdatedAt"
                type="date"
                name="contentUpdatedAt"
                defaultValue={defaults?.contentUpdatedAt}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <FileInputPreview
                id="coverImage"
                name="coverImage"
                label="Cover Image"
                accept="image/*"
                helperText={
                  defaults?.coverImageUrl
                    ? "Current image kept unless you upload a new one."
                    : undefined
                }
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-medium text-black">
              <input
                type="checkbox"
                name="isPlaceholder"
                defaultChecked={defaults?.isPlaceholder}
              />
              Coming soon (placeholder)
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-black">
              <input
                type="checkbox"
                name="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              Published
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
