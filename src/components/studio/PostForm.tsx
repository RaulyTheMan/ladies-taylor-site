"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { ArrowLeft, UserRound, Plus, X } from "lucide-react";
import RichTextEditor, {
  type EditorChrome,
} from "@/components/studio/RichTextEditor";
import FileInputPreview from "@/components/studio/fields/FileInputPreview";
import StudioDatePicker from "@/components/studio/fields/StudioDatePicker";
import Button, { buttonClasses } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Heading } from "@/components/ui/Text";
import {
  Field,
  TextInput,
  Checkbox,
  controlClasses,
} from "@/components/ui/Field";
import { FOCUS_RING } from "@/components/ui/focus";
import { cn } from "@/lib/ui/cn";
import type { TiptapDoc } from "@/lib/richtext/types";
import { uploadInlineImage } from "@/app/admin/(studio)/press-media/upload-image-action";

const requiredField = z.string().trim().min(1, "Required");

// The editor is shared with the not-yet-migrated desktop form, so it takes its
// surfaces as a prop rather than importing one shell's tokens.
const STUDIO_EDITOR_CHROME: EditorChrome = {
  focusRing: FOCUS_RING,
  label: "text-xs font-medium text-admin-fg",
  input: controlClasses(false, "mt-1 h-8 px-2.5"),
  primaryButton: buttonClasses("primary"),
  secondaryButton: buttonClasses("secondary"),
  dialog:
    "admin-root m-auto w-[calc(100%-2rem)] max-w-sm rounded-admin-lg border border-admin-border bg-admin-bg p-5 shadow-xl backdrop:bg-black/50",
};

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
  submitLabel = "Save post",
}: {
  action: (formData: FormData) => void;
  backHref: string;
  defaults?: PostFormDefaults;
  submitLabel?: string;
}) {
  const [isPublished, setIsPublished] = useState(defaults?.isPublished ?? true);
  const [bylineOpen, setBylineOpen] = useState(Boolean(defaults?.authorName));
  const [authorName, setAuthorName] = useState(defaults?.authorName ?? "Rauly");

  // Native `action` submission is unchanged; this only drives inline
  // validation. `required` stays the real gate — see BrandForm.
  const form = useForm({
    defaultValues: {
      title: defaults?.title ?? "",
      slug: defaults?.slug ?? "",
    },
  });

  return (
    <form action={action}>
      {/* Writing surface, deliberately unlike the other forms: this one is a
          composer, so the chrome gets out of the way and the title behaves
          like a document title rather than a labelled field. */}
      <div className="sticky top-12 z-10 -mx-6 flex items-center justify-between border-b border-admin-border bg-admin-bg/95 px-6 py-2.5 backdrop-blur">
        <Link
          href={backHref}
          aria-label="Back to posts"
          className={buttonClasses("ghost", "md", "w-8 px-0")}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant={isPublished ? "neutral" : "outline"}>
            {isPublished ? "Published" : "Draft"}
          </Badge>
          <Button type="submit">{submitLabel}</Button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl pb-20 pt-8">
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
              <>
                <label htmlFor={field.name} className="sr-only">
                  Title
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  required
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${field.name}-error` : undefined}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Title"
                  className="w-full border-none bg-transparent font-gothic text-4xl leading-tight text-admin-fg placeholder:text-admin-fg/25 focus:outline-none md:text-5xl"
                />
                {error && (
                  <p
                    id={`${field.name}-error`}
                    className="mt-1 text-xs text-admin-danger"
                  >
                    {error}
                  </p>
                )}
              </>
            );
          }}
        </form.Field>

        <label htmlFor="excerpt" className="sr-only">
          Subtitle
        </label>
        <input
          id="excerpt"
          name="excerpt"
          defaultValue={defaults?.excerpt}
          placeholder="Add a subtitle..."
          className="mt-2 w-full border-none bg-transparent text-lg text-admin-muted placeholder:text-admin-muted/70 focus:outline-none"
        />

        {bylineOpen ? (
          <div className="mt-4 flex items-center gap-2">
            <UserRound
              className="h-4 w-4 shrink-0 text-admin-muted"
              aria-hidden="true"
            />
            <input
              name="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Author name"
              aria-label="Author name"
              className={controlClasses(false, "h-8 max-w-56 px-2.5")}
            />
            <button
              type="button"
              onClick={() => setBylineOpen(false)}
              aria-label="Remove byline"
              className={buttonClasses("ghost", "sm", "w-[26px] px-0")}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <>
            {/* Keeps a byline in the submission while the field is hidden, so
                collapsing it doesn't blank the author on save. */}
            <input type="hidden" name="authorName" value={authorName} />
            <button
              type="button"
              onClick={() => setBylineOpen(true)}
              className={cn(
                buttonClasses("secondary", "sm"),
                "mt-4 rounded-full"
              )}
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
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
            chrome={STUDIO_EDITOR_CHROME}
          />
        </div>

        {/* Everything that isn't the writing itself, kept on the same page
            rather than behind a dialog so it's all editable in one place. */}
        <div className="mt-14 border-t border-admin-border pt-8">
          <Heading level={3}>Post details</Heading>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field
              name="slug"
              validators={{
                onChange: ({ value }) =>
                  requiredField.safeParse(value).error?.issues[0]?.message,
              }}
            >
              {(field) => {
                const error =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0
                    ? field.state.meta.errors.join(", ")
                    : undefined;
                return (
                  <Field
                    label="Slug"
                    required
                    error={error}
                    hint="Used in the public URL."
                  >
                    {(props) => (
                      <TextInput
                        {...props}
                        name={field.name}
                        required
                        invalid={Boolean(error)}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="best-reels-of-june"
                      />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <Field label="Category">
              {(props) => (
                <TextInput
                  {...props}
                  name="category"
                  defaultValue={defaults?.category ?? "Press & Media"}
                />
              )}
            </Field>

            <Field label="Read time">
              {(props) => (
                <TextInput
                  {...props}
                  name="readTimeLabel"
                  defaultValue={defaults?.readTimeLabel}
                  placeholder="7 Minute Read"
                />
              )}
            </Field>

            <Field label="Author initial">
              {(props) => (
                <TextInput
                  {...props}
                  name="authorInitial"
                  defaultValue={defaults?.authorInitial ?? "R"}
                  maxLength={2}
                />
              )}
            </Field>

            <Field label="Published date" hint="Leave blank for TBD.">
              {({ id, "aria-describedby": describedBy }) => (
                <StudioDatePicker
                  id={id}
                  name="publishedAt"
                  describedBy={describedBy}
                  defaultValue={defaults?.publishedAt}
                  placeholder="Leave blank for TBD"
                />
              )}
            </Field>

            <Field label="Updated date" hint="Leave blank for TBD.">
              {({ id, "aria-describedby": describedBy }) => (
                <StudioDatePicker
                  id={id}
                  name="contentUpdatedAt"
                  describedBy={describedBy}
                  defaultValue={defaults?.contentUpdatedAt}
                  placeholder="Leave blank for TBD"
                />
              )}
            </Field>

            <div className="sm:col-span-2">
              <FileInputPreview
                id="coverImage"
                name="coverImage"
                label="Cover image"
                accept="image/*"
                helperText={
                  defaults?.coverImageUrl
                    ? "Current image kept unless you upload a new one."
                    : undefined
                }
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-5">
            <Checkbox
              name="isPlaceholder"
              label="Coming soon (placeholder)"
              defaultChecked={defaults?.isPlaceholder}
            />
            <Checkbox
              name="isPublished"
              label="Published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
