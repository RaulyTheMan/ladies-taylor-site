import type { Metadata } from "next";
import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata: Metadata = {
  title: "Website Development",
  description: "Websites built right for consumer brands, by Ladies Taylor.",
};

export default function WebDevelopmentServicePage() {
  return (
    <ComingSoonPage
      eyebrow="Services / Website Development"
      title="Website Development"
      description="We're building out the write-up on how we build sites that don't suck. Ironically, that page isn't done yet. Reach out and we'll show you real examples instead."
    />
  );
}
