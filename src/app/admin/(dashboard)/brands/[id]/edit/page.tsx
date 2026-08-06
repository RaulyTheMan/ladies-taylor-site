import { notFound } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import BrandForm from "@/components/admin/BrandForm";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import type { BrandLink, IndustryKey } from "@/lib/brands";
import { updateBrand } from "../../actions";
import { ADMIN_H1_CLASS } from "@/lib/admin/ui";

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSessionClient();
  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!brand) {
    notFound();
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Brands", href: "/admin/brands" },
          { label: `@${brand.handle}` },
        ]}
      />
      <h1 className={ADMIN_H1_CLASS}>
        Edit Brand
      </h1>
      <BrandForm
        action={updateBrand.bind(null, id)}
        defaults={{
          slug: brand.slug,
          name: brand.name,
          handle: brand.handle,
          industryKey: brand.industry_key as IndustryKey,
          bio: brand.bio,
          links: (brand.links as unknown as BrandLink[]) ?? [],
          postPermalinks: brand.post_permalinks,
          publishedAt: brand.published_at?.slice(0, 10) ?? "",
          isPlaceholder: brand.is_placeholder,
          isPublished: brand.is_published,
          avatarUrl: brand.avatar_url ?? undefined,
        }}
      />
    </div>
  );
}
