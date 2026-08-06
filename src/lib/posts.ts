import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/lib/supabase/database.types";
import type { TiptapDoc } from "@/lib/richtext/types";
import { EMPTY_DOC } from "@/lib/richtext/types";

export type BlogPost = {
  slug: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string;
  author: { name: string; initial: string };
  updatedOn: string;
  readTime: string;
  publishedOn: string;
  viewCount: number;
  body: TiptapDoc;
  // Scaffold entry — generic title/copy, not invented editorial content.
  isPlaceholder?: boolean;
};

function formatShortDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function formatLongDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function mapPost(row: Tables<"blog_posts">): BlogPost {
  return {
    slug: row.slug,
    category: row.category,
    date: row.published_at ? formatShortDate(row.published_at) : "TBD",
    title: row.title,
    excerpt: row.excerpt,
    coverImageUrl: row.cover_image_url ?? undefined,
    author: { name: row.author_name, initial: row.author_initial },
    updatedOn: row.content_updated_at
      ? `Updated on ${formatLongDate(row.content_updated_at)}`
      : "TBD",
    readTime: row.read_time_label ?? "TBD",
    publishedOn: row.published_at
      ? `Published on ${formatLongDate(row.published_at)}`
      : "TBD",
    viewCount: row.view_count,
    body: (row.body as unknown as TiptapDoc) ?? EMPTY_DOC,
    isPlaceholder: row.is_placeholder,
  };
}

export async function getPosts(): Promise<BlogPost[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data.map(mapPost);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return mapPost(data);
}
