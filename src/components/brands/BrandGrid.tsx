"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { INDUSTRIES, truncate, type Brand, type IndustryKey } from "@/lib/brands";
import { IndustryIcon } from "@/components/brands/IndustryIcon";

const CATEGORY_OPTIONS: { key: IndustryKey | "all"; label: string }[] = [
  { key: "all", label: "All" },
  ...(Object.keys(INDUSTRIES) as IndustryKey[]).map((key) => ({
    key,
    label: INDUSTRIES[key].label,
  })),
];

export default function BrandGrid({ brands }: { brands: Brand[] }) {
  const [activeIndustry, setActiveIndustry] = useState<IndustryKey | "all">(
    "all",
  );
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredBrands = useMemo(
    () =>
      activeIndustry === "all"
        ? brands
        : brands.filter((brand) => brand.industryKey === activeIndustry),
    [brands, activeIndustry],
  );

  return (
    <>
      <div
        className="relative mt-10 inline-block"
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setMenuOpen(false);
          }
        }}
      >
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          className="flex items-center gap-2 rounded-full bg-lt-dark px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-black"
        >
          Category
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {menuOpen && (
          <div className="absolute left-0 top-full z-10 mt-2 w-48 overflow-hidden rounded-squircle-md border-2 border-black bg-white">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  setActiveIndustry(opt.key);
                  setMenuOpen(false);
                }}
                className={`block w-full px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide transition-colors ${
                  activeIndustry === opt.key
                    ? "bg-lt-dark text-white"
                    : "text-black hover:bg-black/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <motion.div
        layout
        className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filteredBrands.map((brand) => {
          const industry = INDUSTRIES[brand.industryKey];
          return (
            <motion.div key={brand.slug} layout>
              <Link
                href={`/best-of-bands/${brand.slug}`}
                className={`flex h-full flex-col rounded-squircle-xl bg-white p-6 ${
                  brand.isPlaceholder
                    ? "border-2 border-dashed border-black/20"
                    : "border-2 border-black"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-lt-gray">
                    {brand.avatar && (
                      <Image
                        src={brand.avatar}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    )}
                  </div>
                  <p className="truncate text-lg font-bold text-black">
                    @{brand.handle}
                  </p>
                </div>

                {!brand.isPlaceholder && (
                  <p className="mt-5 flex-1 text-sm leading-relaxed text-black/70">
                    {truncate(brand.bio, 110)}
                    <span className="text-black/40">...read more</span>
                  </p>
                )}

                <span
                  className={`mt-6 inline-flex items-center gap-1.5 text-sm font-bold ${industry.colorClass}`}
                >
                  <IndustryIcon industryKey={brand.industryKey} className="h-4 w-4" />
                  {industry.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {filteredBrands.length === 0 && (
        <p className="mt-10 text-center text-sm text-black/60">
          No brands in this category yet.
        </p>
      )}
    </>
  );
}
