import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { bandsNav } from "@/lib/nav";
import { getBrandBySlug, getBrands, INDUSTRIES, instagramProfileUrl } from "@/lib/brands";
import InstagramEmbeds, {
  type EmbeddablePost,
} from "@/components/brands/InstagramEmbeds";
import { IndustryIcon } from "@/components/brands/IndustryIcon";

export async function generateStaticParams() {
  const brands = await getBrands();
  return brands.map((brand) => ({ slug: brand.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand) return {};

  const title = `@${brand.handle}`;
  const description = brand.bio || `${INDUSTRIES[brand.industryKey].label} brand featured in Ladies Taylor's Best of Br*nds.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: brand.avatar ? [{ url: brand.avatar }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: brand.avatar ? [brand.avatar] : undefined,
    },
  };
}

async function fetchEmbedHtml(permalink: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v25.0/instagram_oembed?url=${encodeURIComponent(
        permalink
      )}&omitscript=true`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.html === "string" ? data.html : null;
  } catch {
    return null;
  }
}

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand) {
    notFound();
  }

  const industry = INDUSTRIES[brand.industryKey];

  const posts: EmbeddablePost[] =
    brand.isPlaceholder || brand.posts.length === 0
      ? []
      : await Promise.all(
          brand.posts.map(async (post) => ({
            permalink: post.permalink,
            html: await fetchEmbedHtml(post.permalink),
          }))
        );

  return (
    <>
      <div className="flex flex-1 flex-col bg-white">
        <SiteHeader items={bandsNav} />
        <main className="flex-1 px-4 pb-20 md:px-10">
          <p className="mt-4 text-sm font-bold text-black">
            <Link href="/best-of-bands" className="hover:underline">
              Best of Brands
            </Link>{" "}
            / @{brand.handle}
          </p>

          <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black bg-white sm:h-24 sm:w-24">
              {brand.avatar && (
                <Image
                  src={brand.avatar}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <a
                href={instagramProfileUrl(brand.handle)}
                target="_blank"
                rel="noreferrer noopener"
                className="text-4xl font-extrabold text-black hover:underline md:text-5xl"
              >
                @{brand.handle}
              </a>
              <span
                className={`inline-flex items-center gap-1.5 text-base font-medium ${industry.colorClass}`}
              >
                <IndustryIcon industryKey={brand.industryKey} className="h-5 w-5" />
                {industry.label}
              </span>
            </div>
          </div>

          <p className="mt-6 max-w-4xl text-base leading-relaxed text-black/80">
            {brand.bio}
          </p>

          <div className="mt-12">
            <h2 className="text-3xl font-extrabold text-black">Best Content</h2>
            <hr className="mt-3 w-full max-w-md border-black/30" />

            {posts.length === 0 ? (
              <div className="mt-8 rounded-squircle-lg border-2 border-dashed border-black/20 p-10 text-center text-sm text-black/60">
                Coming soon.
              </div>
            ) : (
              <div className="mt-8">
                <InstagramEmbeds posts={posts} />
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
