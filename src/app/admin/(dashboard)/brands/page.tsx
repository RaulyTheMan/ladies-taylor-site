import Link from "next/link";
import { Suspense } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createSessionClient } from "@/lib/supabase/server";
import {
  ADMIN_BUTTON_CLASS,
  ADMIN_H1_CLASS,
  ADMIN_ICON_BUTTON_CLASS,
  ADMIN_ICON_BUTTON_DANGER_CLASS,
  ADMIN_TABLE_CELL_CLASS,
  ADMIN_TABLE_CLASS,
  ADMIN_TABLE_HEAD_ROW_CLASS,
  ADMIN_TABLE_ROW_CLASS,
  ADMIN_TABLE_WRAPPER_CLASS,
  ADMIN_BADGE_CLASS,
  ADMIN_PILL_BADGE_CLASS,
} from "@/lib/admin/ui";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import { deleteBrand } from "./actions";

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createSessionClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .order("created_at", { ascending: true });

  const query = (q ?? "").trim().toLowerCase();
  const filtered = query
    ? (brands ?? []).filter((b) =>
        `${b.handle} ${b.slug}`.toLowerCase().includes(query)
      )
    : (brands ?? []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className={ADMIN_H1_CLASS}>Brands</h1>
        <Link href="/admin/brands/new" className={ADMIN_BUTTON_CLASS}>
          + New Brand
        </Link>
      </div>

      <div className="mt-4">
        <Suspense fallback={null}>
          <AdminSearchInput placeholder="Search by handle or slug..." />
        </Suspense>
      </div>

      <div className={`mt-6 ${ADMIN_TABLE_WRAPPER_CLASS}`}>
        <table className={ADMIN_TABLE_CLASS}>
          <thead>
            <tr className={ADMIN_TABLE_HEAD_ROW_CLASS}>
              <th className={ADMIN_TABLE_CELL_CLASS}>Name</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>Handle</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>Industry</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>Date Published</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>Status</th>
              <th className={ADMIN_TABLE_CELL_CLASS}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((brand) => (
              <tr key={brand.id} className={ADMIN_TABLE_ROW_CLASS}>
                <td className={`${ADMIN_TABLE_CELL_CLASS} font-medium text-black`}>
                  {brand.name || <span className="text-black/40">—</span>}
                </td>
                <td className={ADMIN_TABLE_CELL_CLASS}>
                  <span className={ADMIN_PILL_BADGE_CLASS}>@{brand.handle}</span>
                  <p className="mt-1 text-xs text-black/60">/{brand.slug}</p>
                </td>
                <td className={`${ADMIN_TABLE_CELL_CLASS} text-black/70`}>
                  {brand.industry_key}
                </td>
                <td className={`${ADMIN_TABLE_CELL_CLASS} text-black/70`}>
                  {brand.published_at
                    ? new Date(brand.published_at).toLocaleDateString()
                    : "—"}
                </td>
                <td className={ADMIN_TABLE_CELL_CLASS}>
                  <div className="flex flex-wrap gap-1.5">
                    {!brand.is_published && (
                      <span className={ADMIN_BADGE_CLASS}>Draft</span>
                    )}
                    {brand.is_placeholder && (
                      <span className={ADMIN_BADGE_CLASS}>Placeholder</span>
                    )}
                    {brand.is_published && !brand.is_placeholder && (
                      <span className={ADMIN_BADGE_CLASS}>Published</span>
                    )}
                  </div>
                </td>
                <td className={ADMIN_TABLE_CELL_CLASS}>
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/brands/${brand.id}/edit`}
                      aria-label={`Edit @${brand.handle}`}
                      className={ADMIN_ICON_BUTTON_CLASS}
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteBrand(brand.id, brand.slug, brand.handle);
                      }}
                    >
                      <ConfirmSubmitButton
                        confirmTitle="Delete this brand?"
                        confirmMessage={`@${brand.handle} will be permanently removed, including its listing on the public Best of Bands page. This can't be undone.`}
                        className={ADMIN_ICON_BUTTON_DANGER_CLASS}
                        ariaLabel={`Delete @${brand.handle}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className={`${ADMIN_TABLE_CELL_CLASS} text-black/60`}
                >
                  {query ? "No brands match your search." : "No brands yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
