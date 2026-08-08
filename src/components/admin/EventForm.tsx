"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import RepeatableTextList from "@/components/admin/RepeatableTextList";
import FileInputPreview from "@/components/admin/FileInputPreview";
import AdminDatePicker from "@/components/admin/AdminDatePicker";
import {
  ADMIN_BUTTON_CLASS,
  ADMIN_INPUT_CLASS as inputClass,
  ADMIN_TEXTAREA_CLASS as textareaClass,
  ADMIN_LABEL_CLASS as labelClass,
} from "@/lib/admin/ui";

const requiredField = z.string().trim().min(1, "Required");

// Formats an EventItem.date/time/etc back into raw form field values. The
// public-facing types only carry display strings, so the DB row (available
// via the edit page's session-client fetch) is passed alongside for the
// fields that need their raw, unformatted values.
export type EventFormDefaults = {
  slug: string;
  title: string;
  eventDate: string; // yyyy-mm-dd, empty if TBD
  timeLabel: string;
  durationLabel: string;
  location: string;
  priceInr: number;
  hostName: string;
  hostRole: string;
  capacity: number | null;
  description: string;
  learnItems: string[];
  publishedAt: string; // yyyy-mm-dd, empty if TBD
  isPlaceholder: boolean;
  isPublished: boolean;
  coverImageUrl?: string;
};

export default function EventForm({
  action,
  defaults,
}: {
  action: (formData: FormData) => void;
  defaults?: EventFormDefaults;
}) {
  // Native `action` submission is unchanged; this instance only drives
  // inline validation messages. `required` stays as the real submission
  // gate — see the matching note in BrandForm.tsx.
  const form = useForm({
    defaultValues: {
      slug: defaults?.slug ?? "",
      title: defaults?.title ?? "",
    },
  });

  return (
    <form action={action} className="mt-6 flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                placeholder="drink-and-think"
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
        <form.Field
          name="title"
          validators={{ onChange: ({ value }) => requiredField.safeParse(value).error?.issues[0]?.message }}
        >
          {(field) => (
            <div>
              <label htmlFor={field.name} className={labelClass}>
                Title <span aria-hidden="true">*</span>
              </label>
              <input
                id={field.name}
                name={field.name}
                required
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
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
          <label htmlFor="eventDate" className={labelClass}>
            Date (leave blank for TBD)
          </label>
          <AdminDatePicker
            id="eventDate"
            name="eventDate"
            defaultValue={defaults?.eventDate}
            placeholder="Leave blank for TBD"
          />
        </div>
        <div>
          <label htmlFor="timeLabel" className={labelClass}>
            Time
          </label>
          <input
            id="timeLabel"
            name="timeLabel"
            defaultValue={defaults?.timeLabel}
            placeholder="01:00 PM Onwards"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="durationLabel" className={labelClass}>
            Duration
          </label>
          <input
            id="durationLabel"
            name="durationLabel"
            defaultValue={defaults?.durationLabel}
            placeholder="2 hour session"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="location" className={labelClass}>
            Location
          </label>
          <input
            id="location"
            name="location"
            defaultValue={defaults?.location}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="priceInr" className={labelClass}>
            Price (INR)
          </label>
          <input
            id="priceInr"
            type="number"
            name="priceInr"
            min={0}
            defaultValue={defaults?.priceInr ?? 0}
            className={inputClass}
          />
        </div>
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
        <div>
          <label htmlFor="hostName" className={labelClass}>
            Host Name
          </label>
          <input
            id="hostName"
            name="hostName"
            defaultValue={defaults?.hostName ?? "Rauly"}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="hostRole" className={labelClass}>
            Host Role
          </label>
          <input
            id="hostRole"
            name="hostRole"
            defaultValue={defaults?.hostRole ?? "CEO, Ladies Taylor"}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="capacity" className={labelClass}>
            Capacity (blank = unlimited)
          </label>
          <input
            id="capacity"
            type="number"
            name="capacity"
            min={0}
            defaultValue={defaults?.capacity ?? ""}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-black/60">
            Registered/waiting counts are computed live from actual sign-ups
            — manage them from the event&apos;s Participants page.
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
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={defaults?.description}
          className={textareaClass}
        />
      </div>

      <fieldset>
        <legend className={labelClass}>What you&apos;ll learn</legend>
        <div className="mt-1">
          <RepeatableTextList
            name="learnItems"
            label="Learn item"
            defaultValues={defaults?.learnItems}
            placeholder="Learn item"
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
        Save Event
      </button>
    </form>
  );
}
