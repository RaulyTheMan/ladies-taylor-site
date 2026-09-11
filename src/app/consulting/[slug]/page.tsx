import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import ConsultBooker from "@/components/consulting/ConsultBooker";
import { consultingNav } from "@/lib/nav";
import { getConsultationTypeBySlug, getConsultationTypes } from "@/lib/consulting";
import { formatRupees } from "@/lib/consulting/time";

export async function generateStaticParams() {
  const types = await getConsultationTypes();
  return types.map((type) => ({ slug: type.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const type = await getConsultationTypeBySlug(slug);
  if (!type) return {};

  const price = type.priceInr === 0 ? "Free" : formatRupees(type.priceInr);
  return {
    title: type.title,
    description: type.description || `${type.durationMinutes} minutes · ${price}`,
    openGraph: {
      title: type.title,
      description: type.description || `${type.durationMinutes} minutes · ${price}`,
    },
  };
}

export default async function ConsultationBookerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const type = await getConsultationTypeBySlug(slug);
  if (!type) notFound();

  return (
    <>
      <div className="flex flex-1 flex-col bg-white">
        <SiteHeader items={consultingNav} />
        {/* Deliberately does NOT fetch slots. They depend on now() and on the
            visitor's timezone, neither of which a cacheable server render knows
            -- doing it here would bake a stale "today" into the HTML and put a
            localised time into server markup. */}
        <main className="flex-1 px-4 pb-20 md:px-10">
          <div className="mx-auto mt-8 max-w-5xl">
            <ConsultBooker type={type} />
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
