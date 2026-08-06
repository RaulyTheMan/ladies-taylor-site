import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { bandsNav } from "@/lib/nav";
import { getPostBySlug, getPosts } from "@/lib/posts";
import NewsletterSignup from "@/components/press/NewsletterSignup";
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
      <SiteHeader items={bandsNav} />
      <main className="flex-1 px-4 pb-20 md:px-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_1.2fr] md:gap-12">
          <div className="comic-border relative aspect-[3/4] rounded-squircle-lg bg-lt-red">
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

          <div>
            <p className="text-xs font-semibold text-black/60">
              {post.category} / {post.date}
            </p>
            <h1 className="mt-2 font-sans text-4xl font-extrabold leading-tight text-black md:text-5xl">
              {post.title}
            </h1>

            <div className="mt-4 flex items-center gap-3 text-xs text-black/70">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lt-red text-micro text-white">
                {post.author.initial}
              </span>
              <span>
                By <span className="font-bold">{post.author.name}</span>
              </span>
              <span>{post.updatedOn}</span>
              <span>{post.readTime}</span>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-black/80">
              {post.excerpt}
            </p>

            <p className="mt-8 text-xs text-black/60">{post.publishedOn}</p>
          </div>
        </div>

        <hr className="mt-12 w-40 border-black/30" />

        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr_260px] md:gap-12">
          <aside className="hidden md:block">
            {headings.length > 0 && (
              <div className="sticky top-24">
                <p className="text-sm font-bold text-black">Content</p>
                <ul className="mt-3 flex flex-col gap-2 border-l border-black/10 pl-4 text-xs text-black/70">
                  {headings.map((heading) => (
                    <li key={heading.id}>
                      <a href={`#${heading.id}`} className="hover:text-black">
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          <article className="flex max-w-2xl flex-col gap-5 text-sm leading-relaxed text-black/80">
            {renderTiptapDoc(post.body)}
          </article>

          <aside>
            <div className="comic-border-sm sticky top-24 rounded-squircle-lg bg-white p-6">
              <h3 className="font-gothic text-xl text-black">
                Never miss a post
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-black/70">
                Get social news, trends and tips right to your inbox.
              </p>

              <NewsletterSignup source="press-media" />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
