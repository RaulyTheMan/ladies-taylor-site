import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getBrands } from "@/lib/brands";
import { getEvents } from "@/lib/events";
import { getPosts } from "@/lib/posts";

const STATIC_ROUTES = [
  "",
  "/best-of-bands",
  "/events",
  "/press-media",
  "/our-friends",
  "/services",
  "/services/branding",
  "/services/packaging",
  "/services/social-media",
  "/services/web-development",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [brands, events, posts] = await Promise.all([
    getBrands(),
    getEvents(),
    getPosts(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const brandEntries: MetadataRoute.Sitemap = brands
    .filter((brand) => !brand.isPlaceholder)
    .map((brand) => ({
      url: `${SITE_URL}/best-of-bands/${brand.slug}`,
      lastModified: brand.publishedAt ? new Date(brand.publishedAt) : new Date(),
    }));

  const eventEntries: MetadataRoute.Sitemap = events
    .filter((event) => !event.isPlaceholder)
    .map((event) => ({
      url: `${SITE_URL}/events/${event.slug}`,
      lastModified: event.publishedAt ? new Date(event.publishedAt) : new Date(),
    }));

  const postEntries: MetadataRoute.Sitemap = posts
    .filter((post) => !post.isPlaceholder)
    .map((post) => ({
      url: `${SITE_URL}/press-media/${post.slug}`,
      lastModified: new Date(),
    }));

  return [...staticEntries, ...brandEntries, ...eventEntries, ...postEntries];
}
