"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import RepeatableTextList from "@/components/admin/RepeatableTextList";
import RepeatableLinkList from "@/components/admin/RepeatableLinkList";
import FileInputPreview from "@/components/admin/FileInputPreview";
import AdminDatePicker from "@/components/admin/AdminDatePicker";
import { INDUSTRIES, type BrandLink, type IndustryKey } from "@/lib/brands";
import {
  ADMIN_BUTTON_CLASS,
  ADMIN_INPUT_CLASS as inputClass,
  ADMIN_TEXTAREA_CLASS as textareaClass,
  ADMIN_LABEL_CLASS as labelClass,
} from "@/lib/admin/ui";

const requiredField = z.string().trim().min(1, "Required");

export type BrandFormDefaults = {
  slug: string;
  name: string;
  handle: string;
  industryKey: IndustryKey;
  bio: string;
  collection: string;
  links: BrandLink[];
  postPermalinks: string[];
  publishedAt: string; // yyyy-mm-dd, empty if TBD
  isPlaceholder: boolean;
  isPublished: boolean;
  avatarUrl?: string;
};

export default function BrandForm({
  action,
  defaults,
}: {
  action: (formData: FormData) => void;
  defaults?: BrandFormDefaults;
}) {
  // The form still submits through the native `action` (React 19 Server
  // Action, unchanged) — this instance only drives inline validation
  // messages on the required fields. The `required` HTML attribute stays on
  // each field as the actual submission gate, so nothing regresses if this
  // validation layer is ever removed or JS is unavailable.
  const form = useForm({
    defaultValues: {
      handle: defaults?.handle ?? "",
      slug: defaults?.slug ?? "",
    },
  });

  return (
    <form action={action} className="mt-6 flex flex-col gap-5">
      <div>
        <label htmlFor="name" className={labelClass}>
          Add Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={defaults?.name}
          placeholder="Brand Name"
          className={inputClass}
        />
      </div>

      <form.Field
        name="handle"
        validators={{ onChange: ({ value }) => requiredField.safeParse(value).error?.issues[0]?.message }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name} className={labelClass}>
              Instagram Handle <span aria-hidden="true">*</span>
            </label>
            <input
              id={field.name}
              name={field.name}
              required
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="pinkswindows"
              className={inputClass}
            />
            {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
              <p className="mt-1 text-xs font-semibold text-red-600">
                {field.state.meta.errors.join(", ")}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <div>
        <label htmlFor="bio" className={labelClass}>
          Description
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={5}
          defaultValue={defaults?.bio}
          placeholder="Write a small description here"
          className={textareaClass}
        />
      </div>

      <fieldset>
        <legend className={labelClass}>Links</legend>
        <div className="mt-1">
          <RepeatableLinkList
            labelName="linkLabels"
            urlName="linkUrls"
            label="Link"
            defaultValues={defaults?.links}
          />
        </div>
      </fieldset>

      <div className="mt-2 grid grid-cols-1 gap-5 border-t border-black/10 pt-5 sm:grid-cols-2">
        <form.Field
          name="slug"
          validators={{ onChange: ({ value }) => requiredField.safeParse(value).error?.issues[0]?.message }}
        >
          {(field) => (
            <div>
              <label htmlFor={field.name} className={labelClass}>
                Slug <span aria-hidden="true">*</span>
              </label>
              <input
                id={field.name}
                name={field.name}
                required
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="pinkswindows"
                className={inputClass}
              />
              {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        </form.Field>
        <div>
          <label htmlFor="industryKey" className={labelClass}>
            Industry
          </label>
          <select
            id="industryKey"
            name="industryKey"
            defaultValue={defaults?.industryKey ?? "services"}
            className={inputClass}
          >
            {(Object.keys(INDUSTRIES) as IndustryKey[]).map((key) => (
              <option key={key} value={key}>
                {INDUSTRIES[key].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="collection" className={labelClass}>
            Collection
          </label>
          <input
            id="collection"
            name="collection"
            defaultValue={defaults?.collection}
            placeholder="e.g. Brands of the Month"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-black/50">
            Groups brands under the Collection filter. Leave blank to omit.
          </p>
        </div>
        <div>
          <label htmlFor="publishedAt" className={labelClass}>
            Date Published (blank = TBD)
          </label>
          <AdminDatePicker
            id="publishedAt"
            name="publishedAt"
            defaultValue={defaults?.publishedAt}
            placeholder="Leave blank for TBD"
          />
        </div>
        <FileInputPreview
          id="avatar"
          name="avatar"
          label="Avatar"
          accept="image/*"
          helperText={
            defaults?.avatarUrl
              ? "Current image kept unless you upload a new one."
              : undefined
          }
        />
      </div>

      <fieldset>
        <legend className={labelClass}>Instagram Post Permalinks</legend>
        <div className="mt-1">
          <RepeatableTextList
            name="postPermalinks"
            label="Post permalink"
            defaultValues={defaults?.postPermalinks}
            placeholder="https://www.instagram.com/..."
          />
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-6">
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
            defaultChecked={defaults?.isPublished ?? true}
          />
          Published
        </label>
      </div>

      <button type="submit" className={`${ADMIN_BUTTON_CLASS} self-start`}>
        Save Brand
      </button>
    </form>
  );
}
