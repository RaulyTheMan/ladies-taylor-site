import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { PRIMARY_BUTTON_CLASS } from "@/lib/ui";
import { homeNav } from "@/lib/nav";

export default function NotFound() {
  return (
    <>
      <SiteHeader items={homeNav} />
      <main className="flex-1 px-4 pb-20 md:px-10">
        <section className="comic-border flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-squircle-lg bg-lt-red px-6 text-center md:min-h-[340px]">
          <p className="text-xs font-bold uppercase tracking-wide text-white/70">
            404
          </p>
          <h1 className="font-sans text-4xl font-medium text-white md:text-6xl">
            Page not found
          </h1>
        </section>

        <div className="mx-auto mt-10 max-w-2xl text-center">
          <p className="text-lg leading-relaxed text-black/80">
            That page doesn&apos;t exist, or it moved. Double-check the link,
            or head back to the homepage.
          </p>

          <Link href="/" className={`${PRIMARY_BUTTON_CLASS} mt-8 inline-block`}>
            Back to homepage
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
