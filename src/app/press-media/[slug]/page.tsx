import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { bandsNav } from "@/lib/nav";
import { getPostBySlug, getPosts } from "@/lib/posts";
import PostViewTracker from "@/components/press/PostViewTracker";
import { renderTiptapDoc, extractHeadings } from "@/lib/richtext/render";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const headings = extractHeadings(post.body);

  return (
    <>
      <PostViewTracker slug={post.slug} />
      <div className="flex flex-1 flex-col bg-white">
        <SiteHeader items={bandsNav} />
        <main className="flex-1 px-4 pb-20 md:px-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,0.85fr)_1.15fr] md:gap-14">
            <div className="comic-border relative aspect-square rounded-squircle-lg bg-lt-red">
              {post.coverImageUrl && (
                <Image
                  src={post.coverImageUrl}
                  alt=""
                  fill
                  className="rounded-squircle-lg object-cover"
                  sizes="(min-width: 768px) 40vw, 100vw"
                />
              )}
            </div>

            <div className="flex flex-col">
              <p className="text-sm text-black/70">
                {post.category} / {post.date} / {post.title}
              </p>
              <h1 className="mt-3 max-w-xl text-5xl font-extrabold leading-[1.05] text-black md:text-6xl">
                {post.title}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-black/70">
                <span className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lt-red text-micro text-white">
                    {post.author.initial}
                  </span>
                  By <span className="font-bold text-black">{post.author.name}</span>
                </span>
                <span>{post.updatedOn}</span>
                <span>{post.readTime}</span>
              </div>

              <p className="mt-6 max-w-md text-sm leading-relaxed text-black/80">
                {post.excerpt}
              </p>

              <p className="mt-auto pt-10 text-xs text-black/50">
                {post.publishedOn}
              </p>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-[200px_minmax(0,1fr)] md:gap-14">
            <aside className="hidden md:block">
              {headings.length > 0 && (
                <div className="sticky top-24">
                  <hr className="mb-3 border-black/30" />
                  <p className="text-sm text-black/70">Table of Contents</p>
                  <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-5 text-sm text-black/80 marker:text-black/50">
                    {headings.map((heading) => (
                      <li key={heading.id}>
                        <a href={`#${heading.id}`} className="hover:underline">
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </aside>

            <article className="flex max-w-2xl flex-col gap-5 text-[15px] leading-relaxed text-black/80">
              {renderTiptapDoc(post.body)}
            </article>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
