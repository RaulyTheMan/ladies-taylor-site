import Link from "next/link";
import type { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { PRIMARY_BUTTON_CLASS } from "@/lib/ui";
import { homeNav, type NavItem } from "@/lib/nav";

export default function ComingSoonPage({
  eyebrow,
  title,
  description,
  navItems = homeNav,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  navItems?: NavItem[];
  children?: ReactNode;
}) {
  return (
    <>
      <SiteHeader items={navItems} />
      <main className="flex-1 px-4 pb-20 md:px-10">
        <section className="comic-border flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-squircle-lg bg-lt-red px-6 text-center md:min-h-[340px]">
          <p className="text-xs font-bold uppercase tracking-wide text-white/70">
            {eyebrow}
          </p>
          <h1 className="font-sans text-4xl font-medium text-white md:text-6xl">
            {title}
          </h1>
        </section>

        <div className="mx-auto mt-10 max-w-2xl text-center">
          <span className="comic-border-sm inline-block -rotate-1 rounded-squircle-sm bg-lt-dark px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
            Coming soon
          </span>
          <p className="mt-5 text-lg leading-relaxed text-black/80">
            {description}
          </p>

          {children}

          <Link
            href="/#feed-get-in-touch"
            className={`${PRIMARY_BUTTON_CLASS} mt-8 inline-block`}
          >
            Get in touch
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
