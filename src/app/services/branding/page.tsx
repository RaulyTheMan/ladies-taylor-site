import type { Metadata } from "next";
import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata: Metadata = {
  title: "Branding Services",
  description:
    "Identity, positioning and brand systems for consumer brands, done by Ladies Taylor.",
};

export default function BrandingServicePage() {
  return (
    <ComingSoonPage
      eyebrow="Services / Branding"
      title="Branding"
      description="This page is getting the full treatment soon — identity, positioning, the whole build. Until then, talk to us directly and we'll show you the work instead of making you read about it."
    />
  );
}
