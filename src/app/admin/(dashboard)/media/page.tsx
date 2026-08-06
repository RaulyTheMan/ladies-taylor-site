import { createSessionClient } from "@/lib/supabase/server";
import { listAllMedia } from "@/lib/admin/media";
import { ADMIN_BUTTON_CLASS, ADMIN_H1_CLASS } from "@/lib/admin/ui";
import MediaLibraryView from "@/components/admin/MediaLibraryView";
import { uploadLibraryFile, deleteMediaFile } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const supabase = await createSessionClient();
  const files = await listAllMedia(supabase);
  const totalBytes = files.reduce((sum, f) => sum + (f.size ?? 0), 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className={ADMIN_H1_CLASS}>Media</h1>
          <p className="mt-2 text-xs text-black/60">
            {files.length} files · {totalMb} MB used
          </p>
        </div>

        <form action={uploadLibraryFile} className="flex items-center gap-3">
          <input
            type="file"
            name="file"
            required
            className="text-sm"
          />
          <button type="submit" className={ADMIN_BUTTON_CLASS}>
            Upload
          </button>
        </form>
      </div>

      <div className="mt-8">
        <MediaLibraryView files={files} onDelete={deleteMediaFile} />
      </div>
    </div>
  );
}
