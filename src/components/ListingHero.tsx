"use client";

import { motion } from "framer-motion";

// Big display heading used atop the Best of Brands / Press & Media / Events
// listing pages — sits directly on the page background, no colored band.
//
// Two typographic treatments:
//   "display" (default) — Druk Wide Medium + Heavy, white, for the pages that
//     still sit on the yellow site background.
//   "sans" — SF Pro Regular + Extrabold in black, matching the reworked
//     Best of Brands art direction.
export default function ListingHero({
  thin,
  thick,
  variant = "display",
}: {
  thin: string;
  thick: string;
  variant?: "display" | "sans";
}) {
  const isSans = variant === "sans";

  return (
    <motion.h1
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={
        isSans
          ? "mt-10 text-5xl leading-none text-black sm:text-6xl md:mt-14 md:text-7xl lg:text-8xl"
          : "font-display mt-16 text-6xl leading-none text-white sm:text-7xl md:mt-20 md:text-8xl lg:text-9xl"
      }
    >
      <span className={isSans ? "font-normal" : "font-medium"}>{thin}</span>{" "}
      <span className={isSans ? "font-extrabold" : "font-black"}>{thick}</span>
    </motion.h1>
  );
}
