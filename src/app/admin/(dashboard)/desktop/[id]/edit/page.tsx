import { notFound } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import DesktopWindowForm from "@/components/admin/DesktopWindowForm";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import type { NewsfeedItem } from "@/components/desktop/window-content/NewsfeedContent";
import type { TiptapDoc } from "@/lib/richtext/types";
import { EMPTY_DOC } from "@/lib/richtext/types";
import { paragraphsToTiptapDoc } from "@/lib/richtext/fromPlainParagraphs";
import { updateWindow } from "../../actions";
import { ADMIN_H1_CLASS } from "@/lib/admin/ui";

export default async function EditDesktopWindowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSessionClient();
  const { data: win } = await supabase
    .from("desktop_windows")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!win) {
    notFound();
  }

  const content = (win.content ?? {}) as Record<string, unknown>;

  // Article/Document rows created before the rich-text editor only have
  // plain `paragraphs` — convert those into an equivalent doc so editing
  // one loads its content instead of starting blank. Email's `content.body`
  // is a plain string, not a doc, so this only applies to rich kinds.
  const isRichKind = win.kind === "article" || win.kind === "document";
  const body = isRichKind
    ? content.body
      ? (content.body as TiptapDoc)
      : content.paragraphs
        ? paragraphsToTiptapDoc(content.paragraphs as string[])
        : EMPTY_DOC
    : undefined;

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Desktop", href: "/admin/desktop" },
          { label: win.title },
        ]}
      />
      <h1 className={ADMIN_H1_CLASS}>
        Edit Window
      </h1>
      <DesktopWindowForm
        action={updateWindow.bind(null, id)}
        lockKind={win.kind}
        defaults={{
          kind: win.kind,
          title: win.title,
          isLive: win.is_live,
          defaultOpen: win.default_open,
          isStreamMaster: win.is_stream_master,
          isAmbientMuted: win.is_ambient_muted,
          mediaUrl: win.media_url ?? undefined,
          videoUrl: win.video_url ?? undefined,
          timestamp: content.timestamp as string | undefined,
          caption: content.caption as string | undefined,
          headline: content.headline as string | undefined,
          body,
          withVideo: content.withVideo as boolean | undefined,
          from: content.from as string | undefined,
          subject: content.subject as string | undefined,
          dateLabel: content.dateLabel as string | undefined,
          emailBody: content.body as string | undefined,
          ctaLabel: content.ctaLabel as string | undefined,
          newsfeedItems: content.items as NewsfeedItem[] | undefined,
        }}
      />
    </div>
  );
}
