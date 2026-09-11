import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import ListingHero from "@/components/ListingHero";
import { StaggerGrid, StaggerItem } from "@/components/StaggerGrid";
import { consultingNav } from "@/lib/nav";
import { getConsultationTypes } from "@/lib/consulting";
import { formatRupees } from "@/lib/consulting/time";

export const metadata: Metadata = {
  title: "Consult*ng",
  description:
    "Book a one-to-one session with Ladies Taylor — brand, positioning and what to do next.",
};

export default async function ConsultingPage() {
  const types = await getConsultationTypes();

  return (
    <>
      <div className="flex flex-1 flex-col bg-white">
        <SiteHeader items={consultingNav} />
        <main className="flex-1 px-4 pb-20 md:px-10">
          <ListingHero thin="Book a" thick="CONSULT" variant="sans" />

          {types.length === 0 ? (
            <div className="comic-border-sm mx-auto mt-10 max-w-lg rounded-squircle-md bg-lt-yellow p-6">
              <p className="text-lg font-extrabold text-black">
                Nothing open right now.
              </p>
              <p className="mt-2 text-sm text-black/70">
                Sessions open up regularly — check back, or get in touch through the
                contact form.
              </p>
            </div>
          ) : (
            <StaggerGrid className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {types.map((type) => (
                <StaggerItem key={type.id}>
                  <Link
                    href={`/consulting/${type.slug}`}
                    className="comic-border-sm flex h-full flex-col rounded-squircle-md bg-white p-5 transition-colors hover:bg-lt-yellow"
                  >
                    <h2 className="text-xl font-extrabold leading-tight text-black">
                      {type.title}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-squircle-xs bg-black/[0.06] px-2 py-1 text-xs font-semibold text-black">
                        {type.durationMinutes} min
                      </span>
                      <span className="rounded-squircle-xs bg-black/[0.06] px-2 py-1 text-xs font-semibold text-black">
                        {type.priceInr === 0 ? "Free" : formatRupees(type.priceInr)}
                      </span>
                    </div>
                    {type.description && (
                      <p className="mt-3 line-clamp-4 text-sm text-black/70">
                        {type.description}
                      </p>
                    )}
                    <span className="mt-auto pt-4 text-xs font-bold uppercase tracking-wide text-lt-red">
                      Book a time →
                    </span>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGrid>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
