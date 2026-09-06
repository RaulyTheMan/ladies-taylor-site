import PageHeader from "@/components/ui/PageHeader";
import DesktopWindowForm from "@/components/studio/DesktopWindowForm";
import type { WindowKind } from "@/components/desktop/types";
import { createWindow } from "../actions";

const VALID_KINDS: WindowKind[] = [
  "video",
  "article",
  "photo",
  "email",
  "document",
  "newsfeed",
  "chat",
];

export default async function NewDesktopWindowPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const lockKind = VALID_KINDS.find((k) => k === kind);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="New window" />
      <DesktopWindowForm
        action={createWindow}
        lockKind={lockKind}
        submitLabel="Create window"
      />
    </div>
  );
}
