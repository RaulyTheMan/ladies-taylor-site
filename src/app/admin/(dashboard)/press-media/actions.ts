"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { verifySession } from "@/lib/admin/dal";
import { createSessionClient } from "@/lib/supabase/server";
import { uploadMedia, extFromFile } from "@/lib/admin/storage";
import type { Json } from "@/lib/supabase/database.types";
import { withFlash } from "@/lib/admin/flash";

const postSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only."),
  category: z.string().trim().min(1).default("Press & Media"),
  title: z.string().trim().min(1, "Title is required."),
  excerpt: z.string().trim().default(""),
  authorName: z.string().trim().min(1).default("Rauly"),
  authorInitial: z.string().trim().min(1).max(2).default("R"),
  publishedAt: z.string().trim().optional(),
  contentUpdatedAt: z.string().trim().optional(),
  readTimeLabel: z.string().trim().optional(),
});

// Loose validation — the editor is the only writer of this shape (Tiptap's
// own getJSON() output), so we just guard against malformed/missing JSON
// rather than fully re-validating every node type server-side.
const tiptapDocSchema = z.object({
  type: z.literal("doc"),
  content: z.array(z.record(z.string(), z.unknown())).default([]),
});

function parsePostFormData(formData: FormData) {
  return {
    ...postSchema.parse({
      slug: formData.get("slug"),
      category: formData.get("category") || "Press & Media",
      title: formData.get("title"),
      excerpt: formData.get("excerpt") || "",
      authorName: formData.get("authorName") || "Rauly",
      authorInitial: formData.get("authorInitial") || "R",
      publishedAt: formData.get("publishedAt") || undefined,
      contentUpdatedAt: formData.get("contentUpdatedAt") || undefined,
      readTimeLabel: formData.get("readTimeLabel") || undefined,
    }),
    body: tiptapDocSchema.parse(
      JSON.parse(String(formData.get("body") ?? '{"type":"doc","content":[]}'))
    ) as Json,
    isPlaceholder: formData.get("isPlaceholder") === "on",
    isPublished: formData.get("isPublished") === "on",
  };
}

function revalidatePostPaths(slug: string) {
  revalidatePath("/press-media");
  revalidatePath(`/press-media/${slug}`);
  revalidatePath("/admin/press-media");
}

export async function createPost(formData: FormData) {
  await verifySession();
  const supabase = await createSessionClient();
  const data = parsePostFormData(formData);

  let coverImageUrl: string | undefined;
  const file = formData.get("coverImage");
  if (file instanceof File && file.size > 0) {
    coverImageUrl = await uploadMedia(
      supabase,
      file,
      `blog/${data.slug}/cover-${Date.now()}.${extFromFile(file)}`
    );
  }

  const { error } = await supabase.from("blog_posts").insert({
    slug: data.slug,
    category: data.category,
    title: data.title,
    excerpt: data.excerpt,
    author_name: data.authorName,
    author_initial: data.authorInitial,
    published_at: data.publishedAt || null,
    content_updated_at: data.contentUpdatedAt || null,
    read_time_label: data.readTimeLabel || null,
    body: data.body,
    cover_image_url: coverImageUrl,
    is_placeholder: data.isPlaceholder,
    is_published: data.isPublished,
  });

  if (error) throw new Error(error.message);

  revalidatePostPaths(data.slug);
  redirect(withFlash("/admin/press-media", `Post "${data.title}" created.`));
}

export async function updatePost(id: string, formData: FormData) {
  await verifySession();
  const supabase = await createSessionClient();
  const data = parsePostFormData(formData);

  let coverImageUrl: string | undefined;
  const file = formData.get("coverImage");
  if (file instanceof File && file.size > 0) {
    coverImageUrl = await uploadMedia(
      supabase,
      file,
      `blog/${data.slug}/cover-${Date.now()}.${extFromFile(file)}`
    );
  }

  const { error } = await supabase
    .from("blog_posts")
    .update({
      slug: data.slug,
      category: data.category,
      title: data.title,
      excerpt: data.excerpt,
      author_name: data.authorName,
      author_initial: data.authorInitial,
      published_at: data.publishedAt || null,
      content_updated_at: data.contentUpdatedAt || null,
      read_time_label: data.readTimeLabel || null,
      body: data.body,
      ...(coverImageUrl ? { cover_image_url: coverImageUrl } : {}),
      is_placeholder: data.isPlaceholder,
      is_published: data.isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePostPaths(data.slug);
  redirect(withFlash("/admin/press-media", `Post "${data.title}" saved.`));
}

export async function deletePost(id: string, slug: string, title: string) {
  await verifySession();
  const supabase = await createSessionClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePostPaths(slug);
  redirect(withFlash("/admin/press-media", `Post "${title}" deleted.`));
}
