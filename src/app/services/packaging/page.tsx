import type { Metadata } from "next";
import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata: Metadata = {
  title: "Packaging Services",
  description:
    "Packaging design that stands out on shelf and on screen, done by Ladies Taylor.",
};

export default function PackagingServicePage() {
  return (
    <ComingSoonPage
      eyebrow="Services / Packaging"
      title="Packaging"
      description="Details on our packaging work are on the way. If you've got a product that needs to actually stand out on a shelf or a screen, don't wait on the page — come talk to us."
    />
  );
}
