import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import ListingHero from "@/components/ListingHero";
import { bandsNav } from "@/lib/nav";
import { getBrands } from "@/lib/brands";
import BrandGrid from "@/components/brands/BrandGrid";

export const metadata: Metadata = {
  title: "Best of Br*nds",
  description:
    "Consumer brands we've worked with, doing it right — a running list of the best of Ladies Taylor's client work.",
};

export default async function BestOfBandsPage() {
  const brands = await getBrands();

  return (
    <>
      <div className="flex flex-1 flex-col bg-white">
        <SiteHeader items={bandsNav} />
        <main className="flex-1 px-4 pb-20 md:px-10">
          <ListingHero thin="Best of" thick="BR*NDS" variant="sans" />

          <BrandGrid brands={brands} />
        </main>
      </div>
      <Footer />
    </>
  );
}
