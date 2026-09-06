import { notFound } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import BrandForm from "@/components/studio/BrandForm";
import type { BrandLink, IndustryKey } from "@/lib/brands";
import { updateBrand } from "../../actions";

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
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={`Edit @${brand.handle}`}
      />
      <BrandForm
        action={updateBrand.bind(null, id)}
        defaults={{
          slug: brand.slug,
          name: brand.name,
          handle: brand.handle,
          industryKey: brand.industry_key as IndustryKey,
          bio: brand.bio,
          collection: brand.collection ?? "",
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
