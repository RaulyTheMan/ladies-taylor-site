import type { Metadata } from "next";
import AugustQueryForm from "@/components/forms/AugustQueryForm";

export const metadata: Metadata = {
  title: "Get in touch",
  description: "Tell us about your brand and what you need — Ladies Taylor.",
  robots: { index: false, follow: false },
};

export default function AugustQueryPage() {
  return <AugustQueryForm />;
}
