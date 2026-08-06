import { notFound } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import DesktopDockAppForm from "@/components/admin/DesktopDockAppForm";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { updateDockApp } from "../../actions";
import { ADMIN_H1_CLASS } from "@/lib/admin/ui";

export default async function EditDockAppPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSessionClient();

  const { data: app } = await supabase
    .from("desktop_dock_apps")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!app) {
    notFound();
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Desktop", href: "/admin/desktop" },
          { label: "Dock Apps", href: "/admin/desktop/dock" },
          { label: app.label },
        ]}
      />
      <h1 className={ADMIN_H1_CLASS}>
        Edit Dock App
      </h1>
      <DesktopDockAppForm
        action={updateDockApp.bind(null, id)}
        defaults={{
          label: app.label,
          kind: app.kind ?? undefined,
          href: app.href ?? undefined,
          notificationCount: app.notification_count,
          isLive: app.is_live,
          iconUrl: app.icon_url,
        }}
      />
    </div>
  );
}
