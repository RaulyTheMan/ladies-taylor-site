import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import ListingHero from "@/components/ListingHero";
import { StaggerGrid, StaggerItem } from "@/components/StaggerGrid";
import { bandsNav } from "@/lib/nav";
import { getPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Pr*ss & M*dia",
  description:
    "Writeups, features and thinking from Ladies Taylor — no fluff, just what we're actually doing and learning.",
};

export default async function PressMediaPage() {
  const posts = await getPosts();

  return (
    <>
      <div className="flex flex-1 flex-col bg-white">
        <SiteHeader items={bandsNav} />
        <main className="flex-1 px-4 pb-20 md:px-10">
          <ListingHero thin="Pr*ss &" thick="M*DIA" variant="sans" />

          <StaggerGrid className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <StaggerItem key={post.slug}>
                <Link
                  href={`/press-media/${post.slug}`}
                  className={`block rounded-squircle-md bg-white p-4 ${
                    post.isPlaceholder
                      ? "border-2 border-dashed border-black/20"
                      : "comic-border-sm"
                  }`}
                >
                  <div className="relative flex aspect-[4/3] items-center justify-center rounded-squircle-sm bg-lt-yellow">
                    {post.coverImageUrl ? (
                      <Image
                        src={post.coverImageUrl}
                        alt=""
                        fill
                        className="rounded-squircle-sm object-cover"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-lt-cream">
                        <Image
                          src="/images/logo/logo-mark.png"
                          alt=""
                          width={253}
                          height={72}
                          className="h-5 w-auto"
                        />
                      </div>
                    )}
                    {post.isPlaceholder && (
                      <span className="absolute right-2 top-2 rounded-squircle-sm bg-black/50 px-2 py-1 text-micro font-bold uppercase tracking-wide text-white">
                        Coming soon
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs font-semibold text-black/60">
                    {post.category} / {post.date}
                  </p>
                  <p className="mt-1 text-sm font-bold text-black">
                    {post.title}
                  </p>
                  {!post.isPlaceholder && (
                    <p className="mt-2 text-xs leading-relaxed text-black/70">
                      {post.excerpt}
                    </p>
                  )}
                </Link>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </main>
      </div>
      <Footer />
    </>
  );
}
