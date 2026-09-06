import { createSessionClient } from "@/lib/supabase/server";
import { listAllMedia } from "@/lib/admin/media";
import PageHeader from "@/components/ui/PageHeader";
import MediaLibraryView from "@/components/studio/MediaLibraryView";
import MediaUploadForm from "@/components/studio/MediaUploadForm";
import { uploadLibraryFile, deleteMediaFile } from "./actions";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const supabase = await createSessionClient();
  const files = await listAllMedia(supabase);
  const totalBytes = files.reduce((sum, f) => sum + (f.size ?? 0), 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Media"
        description={`${files.length} ${files.length === 1 ? "file" : "files"} · ${totalMb} MB used`}
        actions={<MediaUploadForm action={uploadLibraryFile} />}
      />

      <div className="mt-6">
        <MediaLibraryView files={files} onDelete={deleteMediaFile} />
      </div>
    </div>
  );
}
