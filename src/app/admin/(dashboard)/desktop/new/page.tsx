import DesktopWindowForm from "@/components/admin/DesktopWindowForm";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import type { WindowKind } from "@/components/desktop/types";
import { createWindow } from "../actions";
import { ADMIN_H1_CLASS } from "@/lib/admin/ui";

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
    <div>
      <Breadcrumbs
        items={[
          { label: "Desktop", href: "/admin/desktop" },
          { label: "New Window" },
        ]}
      />
      <h1 className={ADMIN_H1_CLASS}>
        New Window
      </h1>
      <DesktopWindowForm action={createWindow} lockKind={lockKind} />
    </div>
  );
}
