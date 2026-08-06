import Link from "next/link";
import type { Metadata } from "next";
import ComingSoonPage from "@/components/ComingSoonPage";
import { servicesDropdown } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Social Media Management, Branding, Packaging and Website Development for consumer brands, done in-house by Ladies Taylor.",
};

export default function ServicesPage() {
  return (
    <ComingSoonPage
      eyebrow="What we do"
      title="Services"
      description="We're still building out the full breakdown of what each service actually gets you. In the meantime, here's what we cover — hit us up and we'll walk you through it."
    >
      <ul className="mx-auto mt-8 flex max-w-md flex-col gap-3 text-left">
        {servicesDropdown.map((service) => (
          <li key={service.href}>
            <Link
              href={service.href}
              className="comic-border-sm flex items-center justify-between rounded-squircle-md bg-white px-5 py-4 text-sm font-bold uppercase tracking-wide text-black transition-transform hover:-translate-y-0.5"
            >
              {service.label}
              <span aria-hidden>→</span>
            </Link>
          </li>
        ))}
      </ul>
    </ComingSoonPage>
  );
}
