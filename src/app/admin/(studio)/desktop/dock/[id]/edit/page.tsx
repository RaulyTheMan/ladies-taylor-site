import { notFound } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import DockAppForm from "@/components/studio/DockAppForm";
import { updateDockApp } from "../../actions";

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
    <div className="mx-auto max-w-3xl">
      <PageHeader title={`Edit ${app.label}`} />
      <DockAppForm
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
