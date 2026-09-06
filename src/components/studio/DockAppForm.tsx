"use client";

import FileInputPreview from "@/components/studio/fields/FileInputPreview";
import type { WindowKind } from "@/components/desktop/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Field, TextInput, Select, Checkbox } from "@/components/ui/Field";

const KIND_LABELS: Record<WindowKind, string> = {
  video: "Video",
  article: "Article",
  photo: "Photo",
  email: "Email",
  document: "Document",
  newsfeed: "News Feed",
  chat: "Live Chat",
};

export type DockAppFormDefaults = {
  label: string;
  kind?: WindowKind;
  href?: string;
  notificationCount?: number | null;
  isLive: boolean;
  iconUrl?: string;
};

export default function DockAppForm({
  action,
  defaults,
  submitLabel = "Save dock app",
}: {
  action: (formData: FormData) => void;
  defaults?: DockAppFormDefaults;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="mt-6 flex flex-col gap-4">
      <Card className="flex flex-col gap-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Label" required>
            {(props) => (
              <TextInput
                {...props}
                name="label"
                required
                defaultValue={defaults?.label}
                placeholder="Email"
              />
            )}
          </Field>

          <FileInputPreview
            id="icon"
            name="icon"
            label="Icon"
            accept="image/*"
            helperText={
              defaults?.iconUrl
                ? "Current icon kept unless you upload a new one."
                : undefined
            }
          />

          <Field
            label="Opens windows of kind"
            hint="This icon opens every live window of the chosen kind, and its badge counts the ones not yet opened."
          >
            {(props) => (
              <Select {...props} name="kind" defaultValue={defaults?.kind ?? ""}>
                <option value="">— None (use a link instead) —</option>
                {(Object.keys(KIND_LABELS) as WindowKind[]).map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABELS[k]}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Or link" hint="Used only when no kind is selected.">
            {(props) => (
              <TextInput
                {...props}
                name="href"
                defaultValue={defaults?.href}
                placeholder="/best-of-bands"
              />
            )}
          </Field>

          <Field label="Notification count" hint="Link icons only.">
            {(props) => (
              <TextInput
                {...props}
                type="number"
                name="notificationCount"
                min={0}
                defaultValue={defaults?.notificationCount ?? ""}
              />
            )}
          </Field>
        </div>

        <Checkbox
          name="isLive"
          label="Live"
          defaultChecked={defaults?.isLive ?? true}
        />
      </Card>

      <Button type="submit" className="self-start">
        {submitLabel}
      </Button>
    </form>
  );
}
