"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { INDUSTRIES, truncate, type Brand, type IndustryKey } from "@/lib/brands";
import { IndustryIcon } from "@/components/brands/IndustryIcon";
import FilterDropdown, {
  type FilterOption,
} from "@/components/brands/FilterDropdown";

const CATEGORY_OPTIONS: FilterOption[] = [
  { key: "all", label: "All" },
  ...(Object.keys(INDUSTRIES) as IndustryKey[]).map((key) => ({
    key,
    label: INDUSTRIES[key].label,
  })),
];

export default function BrandGrid({ brands }: { brands: Brand[] }) {
  const [industry, setIndustry] = useState("all");
  const [collection, setCollection] = useState("all");
  const [year, setYear] = useState("all");

  // Collection and year aren't a fixed taxonomy — both dropdowns are built
  // from whatever the published brands actually carry.
  const collectionOptions = useMemo<FilterOption[]>(() => {
    const names = [...new Set(brands.map((b) => b.collection).filter(Boolean))];
    names.sort((a, b) => a!.localeCompare(b!));
    return [
      { key: "all", label: "All" },
      ...names.map((name) => ({ key: name!, label: name! })),
    ];
  }, [brands]);

  const yearOptions = useMemo<FilterOption[]>(() => {
    const years = [...new Set(brands.map((b) => b.yearAdded).filter(Boolean))];
    years.sort((a, b) => b! - a!);
    return [
      { key: "all", label: "All" },
      ...years.map((y) => ({ key: String(y), label: String(y) })),
    ];
  }, [brands]);

  const filteredBrands = useMemo(
    () =>
      brands.filter(
        (brand) =>
          (industry === "all" || brand.industryKey === industry) &&
          (collection === "all" || brand.collection === collection) &&
          (year === "all" || String(brand.yearAdded) === year)
      ),
    [brands, industry, collection, year]
  );

  return (
    <>
      <p className="mt-6 text-sm font-bold text-black">filter by category</p>

      <div className="mt-3 flex flex-wrap gap-3">
        <FilterDropdown
          label="Category"
          options={CATEGORY_OPTIONS}
          value={industry}
          onChange={setIndustry}
        />
        <FilterDropdown
          label="Collection"
          options={collectionOptions}
          value={collection}
          onChange={setCollection}
        />
        <FilterDropdown
          label="Year Added"
          options={yearOptions}
          value={year}
          onChange={setYear}
        />
      </div>

      <motion.div
        layout
        className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filteredBrands.map((brand) => {
          const industryMeta = INDUSTRIES[brand.industryKey];
          return (
            <motion.div key={brand.slug} layout>
              <Link
                href={`/best-of-bands/${brand.slug}`}
                className={`flex h-full flex-col overflow-hidden rounded-squircle-lg bg-white ${
                  brand.isPlaceholder
                    ? "border-2 border-dashed border-black/20"
                    : "border-2 border-black"
                }`}
              >
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-lt-gray">
                      {brand.avatar && (
                        <Image
                          src={brand.avatar}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      )}
                    </div>
                    <p className="truncate text-base font-bold text-black">
                      @{brand.handle}
                    </p>
                  </div>

                  {!brand.isPlaceholder && (
                    <p className="mt-5 flex-1 text-sm leading-relaxed text-black/80">
                      {truncate(brand.bio, 110)}
                      <span className="text-black/40">... read more</span>
                    </p>
                  )}
                </div>

                <div
                  className={`px-5 py-3 ${
                    brand.isPlaceholder
                      ? "border-t border-dashed border-black/20"
                      : "border-t border-black/15"
                  }`}
                >
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold ${industryMeta.colorClass}`}
                  >
                    <IndustryIcon
                      industryKey={brand.industryKey}
                      className="h-4 w-4"
                    />
                    {industryMeta.label}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {filteredBrands.length === 0 && (
        <p className="mt-10 text-center text-sm text-black/60">
          No brands match these filters yet.
        </p>
      )}
    </>
  );
}
