import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/lib/supabase/database.types";

export type IndustryKey = "services" | "food-beverage" | "fashion" | "beauty";

export const INDUSTRIES: Record<
  IndustryKey,
  { label: string; colorClass: string }
> = {
  services: { label: "Services", colorClass: "text-lt-purple" },
  "food-beverage": { label: "Food & Beverage", colorClass: "text-lt-amber" },
  fashion: { label: "Fashion", colorClass: "text-lt-pink" },
  beauty: { label: "Beauty", colorClass: "text-lt-red" },
};

export type BrandPost = {
  permalink: string;
};

export type BrandLink = {
  label: string;
  url: string;
};

export type Brand = {
  slug: string;
  name: string;
  handle: string;
  avatar?: string;
  industryKey: IndustryKey;
  bio: string;
  links: BrandLink[];
  posts: BrandPost[];
  publishedAt?: string;
  // Scaffold entry — handle/bio are deliberately generic placeholders, not
  // an invented real client. Swap in real content when it's ready.
  isPlaceholder?: boolean;
};

export function instagramProfileUrl(handle: string) {
  return `https://www.instagram.com/${handle}/`;
}

export function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd();
}

function mapBrand(row: Tables<"brands">): Brand {
  return {
    slug: row.slug,
    name: row.name,
    handle: row.handle,
    avatar: row.avatar_url ?? undefined,
    industryKey: row.industry_key as IndustryKey,
    bio: row.bio,
    links: (row.links as unknown as BrandLink[]) ?? [],
    posts: row.post_permalinks.map((permalink) => ({ permalink })),
    publishedAt: row.published_at ?? undefined,
    isPlaceholder: row.is_placeholder,
  };
}

export async function getBrands(): Promise<Brand[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data.map(mapBrand);
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return mapBrand(data);
}
