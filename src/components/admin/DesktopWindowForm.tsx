"use client";

import { useId, useState } from "react";
import NewsfeedItemsEditor from "@/components/admin/NewsfeedItemsEditor";
import FileInputPreview from "@/components/admin/FileInputPreview";
import VideoFileInput from "@/components/admin/VideoFileInput";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { WindowKind } from "@/components/desktop/types";
import type { NewsfeedItem } from "@/components/desktop/window-content/NewsfeedContent";
import type { TiptapDoc } from "@/lib/richtext/types";
import { uploadInlineImage } from "@/app/admin/(dashboard)/desktop/upload-image-action";
import {
  ADMIN_BUTTON_CLASS,
  ADMIN_INPUT_CLASS as inputClass,
  ADMIN_TEXTAREA_CLASS as textareaClass,
  ADMIN_LABEL_CLASS as labelClass,
} from "@/lib/admin/ui";

const KIND_LABELS: Record<WindowKind, string> = {
  video: "Video",
  article: "Article",
  photo: "Photo",
  email: "Email",
  document: "Document",
  newsfeed: "News Feed",
  chat: "Live Chat",
};

export type DesktopWindowFormDefaults = {
  kind: WindowKind;
  title: string;
  isLive: boolean;
  defaultOpen: boolean;
  isStreamMaster?: boolean;
  isAmbientMuted?: boolean;
  mediaUrl?: string;
  videoUrl?: string;
  timestamp?: string;
  caption?: string;
  headline?: string;
  body?: TiptapDoc;
  withVideo?: boolean;
  from?: string;
  subject?: string;
  dateLabel?: string;
  emailBody?: string;
  ctaLabel?: string;
  ctaHref?: string;
  newsfeedItems?: NewsfeedItem[];
};

export default function DesktopWindowForm({
  action,
  defaults,
  lockKind,
}: {
  action: (formData: FormData) => void;
  defaults?: DesktopWindowFormDefaults;
  lockKind?: WindowKind;
}) {
  const [kind, setKind] = useState<WindowKind>(
    defaults?.kind ?? lockKind ?? "article"
  );
  const kindId = useId();

  return (
    <form action={action} className="mt-6 flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={lockKind ? undefined : kindId} className={labelClass}>
            Kind
          </label>
          {lockKind ? (
            <>
              <input type="hidden" name="kind" value={kind} />
              <p className="mt-1 w-full rounded-md bg-black/[0.03] px-3 py-2 text-sm text-black/70">
                {KIND_LABELS[kind]}
              </p>
            </>
          ) : (
            <select
              id={kindId}
              name="kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as WindowKind)}
              className={inputClass}
            >
              {(Object.keys(KIND_LABELS) as WindowKind[]).map((k) => (
                <option key={k} value={k}>
                  {KIND_LABELS[k]}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label htmlFor="title" className={labelClass}>
            Window Title <span aria-hidden="true">*</span>
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={defaults?.title}
            placeholder="New Launch.mp4"
            className={inputClass}
          />
        </div>
      </div>

      {(kind === "video" || kind === "article" || kind === "photo") && (
        <FileInputPreview
          id="mediaImage"
          name="mediaImage"
          label={
            kind === "video"
              ? "Poster Image (optional)"
              : kind === "article"
                ? "Header Image"
                : "Photo"
          }
          accept="image/*"
          helperText={
            defaults?.mediaUrl
              ? "Current image kept unless you upload a new one."
              : undefined
          }
        />
      )}

      {kind === "video" && (
        <VideoFileInput
          name="mediaVideo"
          helperText={
            defaults?.videoUrl
              ? "Current video kept unless you upload a new one. The window resizes to whatever you upload here."
              : "The window sizes itself to this video's real aspect ratio."
          }
        />
      )}

      {kind === "video" && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="timestamp" className={labelClass}>
              Timestamp
            </label>
            <input
              id="timestamp"
              name="timestamp"
              defaultValue={defaults?.timestamp}
              placeholder="01:56"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="caption" className={labelClass}>
              Caption
            </label>
            <input
              id="caption"
              name="caption"
              defaultValue={defaults?.caption}
              className={inputClass}
            />
          </div>
        </div>
      )}

      {kind === "video" && (
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm font-medium text-black">
            <input
              type="checkbox"
              name="isStreamMaster"
              defaultChecked={defaults?.isStreamMaster}
            />
            Live stream master (gets the big side-by-side layout with chat)
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-black">
            <input
              type="checkbox"
              name="isAmbientMuted"
              defaultChecked={defaults?.isAmbientMuted}
            />
            Ambient (muted, no unmute button)
          </label>
        </div>
      )}

      {kind === "photo" && (
        <div>
          <label htmlFor="caption" className={labelClass}>
            Caption
          </label>
          <input
            id="caption"
            name="caption"
            defaultValue={defaults?.caption}
            placeholder="@cafe.babylon"
            className={inputClass}
          />
        </div>
      )}

      {(kind === "article" || kind === "document") && (
        <>
          <div>
            <label htmlFor="headline" className={labelClass}>
              Headline <span aria-hidden="true">*</span>
            </label>
            <input
              id="headline"
              name="headline"
              required
              defaultValue={defaults?.headline}
              className={inputClass}
            />
          </div>
          <div>
            <span id="body-label" className={labelClass}>
              Body
            </span>
            <div className="mt-1">
              <RichTextEditor
                name="body"
                slug={kind}
                defaultValue={defaults?.body}
                uploadImageAction={uploadInlineImage}
                ariaLabelledBy="body-label"
              />
            </div>
          </div>
          {kind === "article" && (
            <label className="flex items-center gap-2 text-sm font-medium text-black">
              <input
                type="checkbox"
                name="withVideo"
                defaultChecked={defaults?.withVideo}
              />
              Show video placeholder
            </label>
          )}
        </>
      )}

      {kind === "email" && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="from" className={labelClass}>
              From
            </label>
            <input
              id="from"
              name="from"
              defaultValue={defaults?.from}
              placeholder="Ladies Taylor"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="subject" className={labelClass}>
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              defaultValue={defaults?.subject}
              placeholder="Let's talk"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="dateLabel" className={labelClass}>
              Date Label
            </label>
            <input
              id="dateLabel"
              name="dateLabel"
              defaultValue={defaults?.dateLabel}
              placeholder="Just now"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="ctaLabel" className={labelClass}>
              CTA Label
            </label>
            <input
              id="ctaLabel"
              name="ctaLabel"
              defaultValue={defaults?.ctaLabel}
              placeholder="Get in touch"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="ctaHref" className={labelClass}>
              CTA Link
            </label>
            <input
              id="ctaHref"
              name="ctaHref"
              defaultValue={defaults?.ctaHref}
              placeholder="/contact"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="emailBody" className={labelClass}>
              Body
            </label>
            <textarea
              id="emailBody"
              name="emailBody"
              rows={3}
              defaultValue={defaults?.emailBody}
              className={textareaClass}
            />
          </div>
        </div>
      )}

      {kind === "newsfeed" && (
        <fieldset>
          <legend className={labelClass}>Feed Items</legend>
          <div className="mt-1">
            <NewsfeedItemsEditor
              name="newsfeedItems"
              defaultItems={defaults?.newsfeedItems}
            />
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm font-medium text-black">
          <input
            type="checkbox"
            name="isLive"
            defaultChecked={defaults?.isLive ?? true}
          />
          Live
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-black">
          <input
            type="checkbox"
            name="defaultOpen"
            defaultChecked={defaults?.defaultOpen}
          />
          Open by default
        </label>
      </div>

      <button type="submit" className={`${ADMIN_BUTTON_CLASS} self-start`}>
        Save Window
      </button>
    </form>
  );
}
