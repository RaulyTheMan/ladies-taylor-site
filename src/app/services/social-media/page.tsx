import type { Metadata } from "next";
import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata: Metadata = {
  title: "Social Media Management",
  description:
    "Social content, strategy and execution for consumer brands, run by Ladies Taylor.",
};

export default function SocialMediaServicePage() {
  return (
    <ComingSoonPage
      eyebrow="Services / Social Media Management"
      title="Social Media"
      description="The full page on how we run social — content, strategy, the works — is still being written. We're not about to half-ass the page about not half-assing your feed. Get in touch and we'll tell you everything now."
    />
  );
}
