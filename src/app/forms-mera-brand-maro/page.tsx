import type { Metadata } from "next";
import MeraBrandMaroForm from "@/components/forms/MeraBrandMaroForm";

export const metadata: Metadata = {
  title: "Mera Brand Maro",
  description: "Tell us about your brand — Ladies Taylor.",
  robots: { index: false, follow: false },
};

export default function MeraBrandMaroPage() {
  return <MeraBrandMaroForm />;
}
