import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-lt-dark px-6 py-16 text-lt-cream md:px-10 md:py-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <Image
          src="/images/logo/logo-mark.png"
          alt="Ladies Taylor"
          width={253}
          height={72}
          className="h-8 w-auto shrink-0 self-start"
        />

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="font-gothic text-3xl text-lt-yellow md:text-4xl">
            ladies.taylor
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-wide text-lt-cream/70">
            <Link href="/services" prefetch={false} className="hover:text-lt-yellow">
              Services
            </Link>
            <Link href="/best-of-bands" prefetch={false} className="hover:text-lt-yellow">
              Our Work
            </Link>
            <Link href="/press-media" prefetch={false} className="hover:text-lt-yellow">
              Press &amp; Media
            </Link>
            <Link href="/events" prefetch={false} className="hover:text-lt-yellow">
              Events
            </Link>
            <Link href="/#feed-get-in-touch" prefetch={false} className="hover:text-lt-yellow">
              Contact
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-lt-cream/50 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Ladies Taylor. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" prefetch={false} className="hover:text-lt-yellow">
              Privacy Policy
            </Link>
            <p>Bengaluru, India</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
