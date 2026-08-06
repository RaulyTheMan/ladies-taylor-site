import Link from "next/link";
import type { Metadata } from "next";
import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata: Metadata = {
  title: "Our Fr**nds",
  description: "The people and brands Ladies Taylor rates.",
};

export default function OurFriendsPage() {
  return (
    <ComingSoonPage
      eyebrow="Our Fr**nds"
      title="Our Friends"
      description="A proper shoutout page for the people and brands we rate is in the works. Until it's live, check out the brands we've actually worked with."
    >
      <div className="mt-8">
        <Link
          href="/best-of-bands"
          className="comic-border-sm inline-block rounded-squircle-md bg-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-black transition-transform hover:-translate-y-0.5"
        >
          See Best of Br*nds →
        </Link>
      </div>
    </ComingSoonPage>
  );
}
