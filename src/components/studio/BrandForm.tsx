"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import RepeatableTextList from "@/components/studio/fields/RepeatableTextList";
import RepeatableLinkList from "@/components/studio/fields/RepeatableLinkList";
import FileInputPreview from "@/components/studio/fields/FileInputPreview";
import StudioDatePicker from "@/components/studio/fields/StudioDatePicker";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Heading, Separator } from "@/components/ui/Text";
import { Field, TextInput, TextArea, Select, Checkbox } from "@/components/ui/Field";
import { INDUSTRIES, type BrandLink, type IndustryKey } from "@/lib/brands";

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
  submitLabel = "Save brand",
}: {
  action: (formData: FormData) => void;
  defaults?: BrandFormDefaults;
  submitLabel?: string;
}) {
  // The form still submits through the native `action` (React 19 Server
  // Action, unchanged) — this instance only drives inline validation on the
  // required fields. The `required` HTML attribute stays on each as the actual
  // submission gate, so nothing regresses if this layer is removed or JS is
  // unavailable.
  const form = useForm({
    defaultValues: {
      handle: defaults?.handle ?? "",
      slug: defaults?.slug ?? "",
    },
  });

  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <Card className="flex flex-col gap-4 p-5">
        <Heading level={3}>Details</Heading>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            {(props) => (
              <TextInput
                {...props}
                name="name"
                defaultValue={defaults?.name}
                placeholder="Brand name"
              />
            )}
          </Field>

          <form.Field
            name="handle"
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
                <Field label="Instagram handle" required error={error}>
                  {(props) => (
                    <TextInput
                      {...props}
                      name={field.name}
                      required
                      invalid={Boolean(error)}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="pinkswindows"
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
              name="bio"
              rows={5}
              defaultValue={defaults?.bio}
              placeholder="Write a short description"
            />
          )}
        </Field>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-xs font-medium text-admin-fg">
            Links
          </legend>
          <RepeatableLinkList
            labelName="linkLabels"
            urlName="linkUrls"
            label="Link"
            defaultValues={defaults?.links}
          />
        </fieldset>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <Heading level={3}>Listing</Heading>

        <div className="grid gap-4 sm:grid-cols-2">
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
                      placeholder="pinkswindows"
                    />
                  )}
                </Field>
              );
            }}
          </form.Field>

          <Field label="Industry">
            {(props) => (
              <Select
                {...props}
                name="industryKey"
                defaultValue={defaults?.industryKey ?? "services"}
              >
                {(Object.keys(INDUSTRIES) as IndustryKey[]).map((key) => (
                  <option key={key} value={key}>
                    {INDUSTRIES[key].label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field
            label="Collection"
            hint="Groups brands under the Collection filter. Leave blank to omit."
          >
            {(props) => (
              <TextInput
                {...props}
                name="collection"
                defaultValue={defaults?.collection}
                placeholder="e.g. Brands of the Month"
              />
            )}
          </Field>

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

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-xs font-medium text-admin-fg">
            Instagram post permalinks
          </legend>
          <RepeatableTextList
            name="postPermalinks"
            label="Post permalink"
            defaultValues={defaults?.postPermalinks}
            placeholder="https://www.instagram.com/..."
          />
        </fieldset>

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
