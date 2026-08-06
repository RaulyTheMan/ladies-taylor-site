"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { verifySession } from "@/lib/admin/dal";
import { createSessionClient } from "@/lib/supabase/server";
import { uploadMedia, extFromFile } from "@/lib/admin/storage";
import { withFlash } from "@/lib/admin/flash";

const brandSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only."),
  name: z.string().trim().default(""),
  handle: z.string().trim().min(1, "Handle is required."),
  industryKey: z.enum(["services", "food-beverage", "fashion", "beauty"]),
  bio: z.string().trim().default(""),
  publishedAt: z.string().trim().optional(),
});

function parseBrandFormData(formData: FormData) {
  const parsed = brandSchema.parse({
    slug: formData.get("slug"),
    name: formData.get("name") || "",
    handle: formData.get("handle"),
    industryKey: formData.get("industryKey"),
    bio: formData.get("bio") || "",
    publishedAt: formData.get("publishedAt") || undefined,
  });

  const postPermalinks = formData
    .getAll("postPermalinks")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const linkLabels = formData.getAll("linkLabels").map((v) => String(v).trim());
  const linkUrls = formData.getAll("linkUrls").map((v) => String(v).trim());
  const links = linkLabels
    .map((label, i) => ({ label, url: linkUrls[i] ?? "" }))
    .filter((link) => link.label || link.url);

  return {
    ...parsed,
    postPermalinks,
    links,
    isPlaceholder: formData.get("isPlaceholder") === "on",
    isPublished: formData.get("isPublished") === "on",
  };
}

function revalidateBrandPaths(slug: string) {
  revalidatePath("/best-of-bands");
  revalidatePath(`/best-of-bands/${slug}`);
  revalidatePath("/admin/brands");
}

export async function createBrand(formData: FormData) {
  await verifySession();
  const supabase = await createSessionClient();
  const data = parseBrandFormData(formData);

  let avatarUrl: string | undefined;
  const file = formData.get("avatar");
  if (file instanceof File && file.size > 0) {
    avatarUrl = await uploadMedia(
      supabase,
      file,
      `brands/${data.slug}-${Date.now()}.${extFromFile(file)}`
    );
  }

  const { error } = await supabase.from("brands").insert({
    slug: data.slug,
    name: data.name,
    handle: data.handle,
    industry_key: data.industryKey,
    bio: data.bio,
    links: data.links,
    post_permalinks: data.postPermalinks,
    avatar_url: avatarUrl,
    published_at: data.publishedAt || null,
    is_placeholder: data.isPlaceholder,
    is_published: data.isPublished,
  });

  if (error) throw new Error(error.message);

  revalidateBrandPaths(data.slug);
  redirect(withFlash("/admin/brands", `Brand @${data.handle} created.`));
}

export async function updateBrand(id: string, formData: FormData) {
  await verifySession();
  const supabase = await createSessionClient();
  const data = parseBrandFormData(formData);

  let avatarUrl: string | undefined;
  const file = formData.get("avatar");
  if (file instanceof File && file.size > 0) {
    avatarUrl = await uploadMedia(
      supabase,
      file,
      `brands/${data.slug}-${Date.now()}.${extFromFile(file)}`
    );
  }

  const { error } = await supabase
    .from("brands")
    .update({
      slug: data.slug,
      name: data.name,
      handle: data.handle,
      industry_key: data.industryKey,
      bio: data.bio,
      links: data.links,
      post_permalinks: data.postPermalinks,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      published_at: data.publishedAt || null,
      is_placeholder: data.isPlaceholder,
      is_published: data.isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidateBrandPaths(data.slug);
  redirect(withFlash("/admin/brands", `Brand @${data.handle} saved.`));
}

export async function deleteBrand(id: string, slug: string, handle: string) {
  await verifySession();
  const supabase = await createSessionClient();
  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateBrandPaths(slug);
  redirect(withFlash("/admin/brands", `Brand @${handle} deleted.`));
}
