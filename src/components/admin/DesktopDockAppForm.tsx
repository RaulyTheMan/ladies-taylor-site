import FileInputPreview from "@/components/admin/FileInputPreview";
import type { WindowKind } from "@/components/desktop/types";
import {
  ADMIN_BUTTON_CLASS,
  ADMIN_INPUT_CLASS as inputClass,
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

export type DesktopDockAppFormDefaults = {
  label: string;
  kind?: WindowKind;
  href?: string;
  notificationCount?: number | null;
  isLive: boolean;
  iconUrl?: string;
};

export default function DesktopDockAppForm({
  action,
  defaults,
}: {
  action: (formData: FormData) => void;
  defaults?: DesktopDockAppFormDefaults;
}) {
  return (
    <form action={action} className="mt-6 flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="label" className={labelClass}>
            Label <span aria-hidden="true">*</span>
          </label>
          <input
            id="label"
            name="label"
            required
            defaultValue={defaults?.label}
            placeholder="Email"
            className={inputClass}
          />
        </div>
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
        <div>
          <label htmlFor="kind" className={labelClass}>
            Opens Windows Of Kind
          </label>
          <select
            id="kind"
            name="kind"
            defaultValue={defaults?.kind ?? ""}
            className={inputClass}
          >
            <option value="">— None (use link instead) —</option>
            {(Object.keys(KIND_LABELS) as WindowKind[]).map((k) => (
              <option key={k} value={k}>
                {KIND_LABELS[k]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-black/50">
            This icon will open every live window of this kind, and its
            badge will show how many of them haven&apos;t been opened yet.
          </p>
        </div>
        <div>
          <label htmlFor="href" className={labelClass}>
            Or Link (used only if no kind selected)
          </label>
          <input
            id="href"
            name="href"
            defaultValue={defaults?.href}
            placeholder="/best-of-bands"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="notificationCount" className={labelClass}>
            Notification Count (link icons only)
          </label>
          <input
            id="notificationCount"
            type="number"
            name="notificationCount"
            min={0}
            defaultValue={defaults?.notificationCount ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-black">
        <input
          type="checkbox"
          name="isLive"
          defaultChecked={defaults?.isLive ?? true}
        />
        Live
      </label>

      <button type="submit" className={`${ADMIN_BUTTON_CLASS} self-start`}>
        Save Dock App
      </button>
    </form>
  );
}
