"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import RepeatableTextList from "@/components/studio/fields/RepeatableTextList";
import FileInputPreview from "@/components/studio/fields/FileInputPreview";
import StudioDatePicker from "@/components/studio/fields/StudioDatePicker";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Heading, Separator } from "@/components/ui/Text";
import { Field, TextInput, TextArea, Checkbox } from "@/components/ui/Field";

const requiredField = z.string().trim().min(1, "Required");

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
  submitLabel = "Save event",
}: {
  action: (formData: FormData) => void;
  defaults?: EventFormDefaults;
  submitLabel?: string;
}) {
  // Native `action` submission is unchanged; this instance only drives inline
  // validation. `required` stays the real submission gate — see BrandForm.
  const form = useForm({
    defaultValues: {
      slug: defaults?.slug ?? "",
      title: defaults?.title ?? "",
    },
  });

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <Card className="flex flex-col gap-4 p-5">
        <Heading level={3}>Details</Heading>

        <div className="grid gap-4 sm:grid-cols-2">
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
                <Field label="Title" required error={error}>
                  {(props) => (
                    <TextInput
                      {...props}
                      name={field.name}
                      required
                      invalid={Boolean(error)}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
                  )}
                </Field>
              );
            }}
          </form.Field>

          <form.Field
            name="slug"
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
                      placeholder="drink-and-think"
                    />
                  )}
                </Field>
              );
            }}
          </form.Field>
        </div>

        <Field label="Description">
          {(props) => (
            <TextArea
              {...props}
              name="description"
              rows={4}
              defaultValue={defaults?.description}
            />
          )}
        </Field>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-xs font-medium text-admin-fg">
            What you&apos;ll learn
          </legend>
          <RepeatableTextList
            name="learnItems"
            label="Learn item"
            defaultValues={defaults?.learnItems}
            placeholder="Learn item"
          />
        </fieldset>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <Heading level={3}>When &amp; where</Heading>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date" hint="Leave blank for TBD.">
            {({ id, "aria-describedby": describedBy }) => (
              <StudioDatePicker
                id={id}
                name="eventDate"
                describedBy={describedBy}
                defaultValue={defaults?.eventDate}
                placeholder="Leave blank for TBD"
              />
            )}
          </Field>

          <Field label="Time">
            {(props) => (
              <TextInput
                {...props}
                name="timeLabel"
                defaultValue={defaults?.timeLabel}
                placeholder="01:00 PM Onwards"
              />
            )}
          </Field>

          <Field label="Duration">
            {(props) => (
              <TextInput
                {...props}
                name="durationLabel"
                defaultValue={defaults?.durationLabel}
                placeholder="2 hour session"
              />
            )}
          </Field>

          <Field label="Location">
            {(props) => (
              <TextInput
                {...props}
                name="location"
                defaultValue={defaults?.location}
              />
            )}
          </Field>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <Heading level={3}>Hosting &amp; tickets</Heading>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Host name">
            {(props) => (
              <TextInput
                {...props}
                name="hostName"
                defaultValue={defaults?.hostName ?? "Rauly"}
              />
            )}
          </Field>

          <Field label="Host role">
            {(props) => (
              <TextInput
                {...props}
                name="hostRole"
                defaultValue={defaults?.hostRole ?? "CEO, Ladies Taylor"}
              />
            )}
          </Field>

          <Field label="Price (INR)">
            {(props) => (
              <TextInput
                {...props}
                type="number"
                name="priceInr"
                min={0}
                defaultValue={defaults?.priceInr ?? 0}
              />
            )}
          </Field>

          <Field
            label="Capacity"
            hint="Blank = unlimited. Registered and waiting counts are computed live from actual sign-ups — manage them on the Participants page."
          >
            {(props) => (
              <TextInput
                {...props}
                type="number"
                name="capacity"
                min={0}
                defaultValue={defaults?.capacity ?? ""}
              />
            )}
          </Field>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <Heading level={3}>Publishing</Heading>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date published" hint="Leave blank for TBD.">
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

        <Separator />

        <div className="flex flex-wrap gap-5">
          <Checkbox
            name="isPlaceholder"
            label="Coming soon (placeholder)"
            defaultChecked={defaults?.isPlaceholder}
          />
          <Checkbox
            name="isPublished"
            label="Published"
            defaultChecked={defaults?.isPublished ?? true}
          />
        </div>
      </Card>

      <Button type="submit" className="self-start">
        {submitLabel}
      </Button>
    </form>
  );
}
