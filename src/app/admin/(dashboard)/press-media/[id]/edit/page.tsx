import { notFound } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import PostForm from "@/components/admin/PostForm";
import type { TiptapDoc } from "@/lib/richtext/types";
import { EMPTY_DOC } from "@/lib/richtext/types";
import { updatePost } from "../../actions";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSessionClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!post) {
    notFound();
  }

  return (
    <PostForm
      action={updatePost.bind(null, id)}
      backHref="/admin/press-media"
      defaults={{
        slug: post.slug,
        category: post.category,
        title: post.title,
        excerpt: post.excerpt,
        authorName: post.author_name,
        authorInitial: post.author_initial,
        publishedAt: post.published_at ?? "",
        contentUpdatedAt: post.content_updated_at ?? "",
        readTimeLabel: post.read_time_label ?? "",
        body: (post.body as unknown as TiptapDoc) ?? EMPTY_DOC,
        isPlaceholder: post.is_placeholder,
        isPublished: post.is_published,
        coverImageUrl: post.cover_image_url ?? undefined,
      }}
    />
  );
}
