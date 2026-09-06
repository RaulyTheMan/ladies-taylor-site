"use client";

import { useId, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import NewsfeedItemsEditor from "@/components/studio/fields/NewsfeedItemsEditor";
import FileInputPreview from "@/components/studio/fields/FileInputPreview";
import VideoFileInput from "@/components/studio/fields/VideoFileInput";
import RichTextEditor, {
  type EditorChrome,
} from "@/components/studio/RichTextEditor";
import Button, { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Heading, Label } from "@/components/ui/Text";
import {
  Field,
  TextInput,
  TextArea,
  Select,
  Checkbox,
  controlClasses,
} from "@/components/ui/Field";
import { FOCUS_RING } from "@/components/ui/focus";
import type { WindowKind } from "@/components/desktop/types";
import type { NewsfeedItem } from "@/components/desktop/window-content/NewsfeedContent";
import type { TiptapDoc } from "@/lib/richtext/types";
import { uploadInlineImage } from "@/app/admin/(studio)/desktop/upload-image-action";

const requiredField = z.string().trim().min(1, "Required");

const STUDIO_EDITOR_CHROME: EditorChrome = {
  focusRing: FOCUS_RING,
  label: "text-xs font-medium text-admin-fg",
  input: controlClasses(false, "mt-1 h-8 px-2.5"),
  primaryButton: buttonClasses("primary"),
  secondaryButton: buttonClasses("secondary"),
  dialog:
    "admin-root m-auto w-[calc(100%-2rem)] max-w-sm rounded-admin-lg border border-admin-border bg-admin-bg p-5 shadow-xl backdrop:bg-black/50",
};

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
  newsfeedItems?: NewsfeedItem[];
};

export default function DesktopWindowForm({
  action,
  defaults,
  lockKind,
  submitLabel = "Save window",
}: {
  action: (formData: FormData) => void;
  defaults?: DesktopWindowFormDefaults;
  lockKind?: WindowKind;
  submitLabel?: string;
}) {
  const [kind, setKind] = useState<WindowKind>(
    defaults?.kind ?? lockKind ?? "article"
  );
  const kindId = useId();

  // Native `action` submission is unchanged; this only drives inline
  // validation. `required` stays the real gate — see BrandForm.
  const form = useForm({
    defaultValues: { title: defaults?.title ?? "" },
  });

  const hasMediaImage =
    kind === "video" || kind === "article" || kind === "photo";
  const isProse = kind === "article" || kind === "document";

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <Card className="flex flex-col gap-4 p-5">
        <Heading level={3}>Window</Heading>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={lockKind ? undefined : kindId}>Kind</Label>
            {lockKind ? (
              <>
                <input type="hidden" name="kind" value={kind} />
                <p className="flex h-8 items-center rounded-admin-md bg-admin-surface px-2.5 text-[13px] text-admin-muted">
                  {KIND_LABELS[kind]}
                </p>
              </>
            ) : (
              <Select
                id={kindId}
                name="kind"
                value={kind}
                onChange={(e) => setKind(e.target.value as WindowKind)}
              >
                {(Object.keys(KIND_LABELS) as WindowKind[]).map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABELS[k]}
                  </option>
                ))}
              </Select>
            )}
          </div>

          <form.Field
            name="title"
            validators={{
              onChange: ({ value }) =>
                requiredField.safeParse(value).error?.issues[0]?.message,
            }}
          >
            {(field) => {
              const error =
                field.state.meta.isTouched && field.state.meta.errors.length > 0
                  ? field.state.meta.errors.join(", ")
                  : undefined;
              return (
                <Field label="Window title" required error={error}>
                  {(props) => (
                    <TextInput
                      {...props}
                      name={field.name}
                      required
                      invalid={Boolean(error)}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="New Launch.mp4"
                    />
                  )}
                </Field>
              );
            }}
          </form.Field>
        </div>

        <div className="flex flex-wrap gap-5">
          <Checkbox
            name="isLive"
            label="Live"
            defaultChecked={defaults?.isLive ?? true}
          />
          <Checkbox
            name="defaultOpen"
            label="Open by default"
            defaultChecked={defaults?.defaultOpen}
          />
        </div>
      </Card>

      {/* Only the fields this kind actually uses are rendered — the window
          kinds share almost no content between them. */}
      <Card className="flex flex-col gap-4 p-5">
        <Heading level={3}>{KIND_LABELS[kind]} content</Heading>

        {hasMediaImage && (
          <FileInputPreview
            id="mediaImage"
            name="mediaImage"
            label={
              kind === "video"
                ? "Poster image (optional)"
                : kind === "article"
                  ? "Header image"
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
          <>
            <VideoFileInput
              name="mediaVideo"
              helperText={
                defaults?.videoUrl
                  ? "Current video kept unless you upload a new one. The window resizes to whatever you upload here."
                  : "The window sizes itself to this video's real aspect ratio."
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Timestamp">
                {(props) => (
                  <TextInput
                    {...props}
                    name="timestamp"
                    defaultValue={defaults?.timestamp}
                    placeholder="01:56"
                  />
                )}
              </Field>
              <Field label="Caption">
                {(props) => (
                  <TextInput
                    {...props}
                    name="caption"
                    defaultValue={defaults?.caption}
                  />
                )}
              </Field>
            </div>

            <div className="flex flex-col gap-2">
              <Checkbox
                name="isStreamMaster"
                label="Live stream master (gets the big side-by-side layout with chat)"
                defaultChecked={defaults?.isStreamMaster}
              />
              <Checkbox
                name="isAmbientMuted"
                label="Ambient (muted, no unmute button)"
                defaultChecked={defaults?.isAmbientMuted}
              />
            </div>
          </>
        )}

        {kind === "photo" && (
          <Field label="Caption">
            {(props) => (
              <TextInput
                {...props}
                name="caption"
                defaultValue={defaults?.caption}
                placeholder="@cafe.babylon"
              />
            )}
          </Field>
        )}

        {isProse && (
          <>
            <Field label="Headline" required>
              {(props) => (
                <TextInput
                  {...props}
                  name="headline"
                  required
                  defaultValue={defaults?.headline}
                />
              )}
            </Field>

            <div>
              <span
                id="body-label"
                className="text-xs font-medium text-admin-fg"
              >
                Body
              </span>
              <div className="mt-1.5">
                <RichTextEditor
                  name="body"
                  slug={kind}
                  defaultValue={defaults?.body}
                  uploadImageAction={uploadInlineImage}
                  ariaLabelledBy="body-label"
                  chrome={STUDIO_EDITOR_CHROME}
                />
              </div>
            </div>

            {kind === "article" && (
              <Checkbox
                name="withVideo"
                label="Show video placeholder"
                defaultChecked={defaults?.withVideo}
              />
            )}
          </>
        )}

        {kind === "email" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="From">
              {(props) => (
                <TextInput
                  {...props}
                  name="from"
                  defaultValue={defaults?.from}
                  placeholder="Ladies Taylor"
                />
              )}
            </Field>
            <Field label="Subject">
              {(props) => (
                <TextInput
                  {...props}
                  name="subject"
                  defaultValue={defaults?.subject}
                  placeholder="Let's talk"
                />
              )}
            </Field>
            <Field label="Date label">
              {(props) => (
                <TextInput
                  {...props}
                  name="dateLabel"
                  defaultValue={defaults?.dateLabel}
                  placeholder="Just now"
                />
              )}
            </Field>
            <Field label="Submit button label">
              {(props) => (
                <TextInput
                  {...props}
                  name="ctaLabel"
                  defaultValue={defaults?.ctaLabel}
                  placeholder="Send"
                />
              )}
            </Field>
            <div className="sm:col-span-2">
              <Field
                label="Intro message"
                hint="Shown above the form."
              >
                {(props) => (
                  <TextArea
                    {...props}
                    name="emailBody"
                    rows={3}
                    defaultValue={defaults?.emailBody}
                  />
                )}
              </Field>
            </div>
          </div>
        )}

        {kind === "newsfeed" && (
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-xs font-medium text-admin-fg">
              Feed items
            </legend>
            <NewsfeedItemsEditor
              name="newsfeedItems"
              defaultItems={defaults?.newsfeedItems}
            />
          </fieldset>
        )}

        {kind === "chat" && (
          <p className="text-[13px] text-admin-muted">
            The live chat window has no content of its own — messages come from
            viewers. Moderate them on the{" "}
            <span className="font-medium text-admin-fg">Chat</span> tab of the
            windows list.
          </p>
        )}
      </Card>

      <Button type="submit" className="self-start">
        {submitLabel}
      </Button>
    </form>
  );
}
