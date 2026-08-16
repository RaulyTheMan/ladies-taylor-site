"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { WORK_ITEMS } from "@/lib/work-items";

const COLUMN_COUNT = 3;

const COLUMNS = Array.from({ length: COLUMN_COUNT }, (_, col) =>
  WORK_ITEMS.filter((_, i) => i % COLUMN_COUNT === col)
);

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
      <path d="M8 5v14l11-7-11-7z" fill="currentColor" />
    </svg>
  );
}

export default function OurWorkMosaic() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex gap-1.5"
    >
      {COLUMNS.map((column, ci) => (
        <div key={ci} className="flex flex-1 flex-col gap-1.5">
          {column.map((item) => (
            <div
              key={item.video}
              className="relative aspect-[9/16] overflow-hidden rounded-squircle-xs bg-lt-dark"
            >
              <Image
                src={item.poster}
                alt={`${item.handle} — ${item.label}`}
                fill
                sizes="(min-width: 768px) 0px, 33vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                <span className="truncate text-micro font-semibold text-white">
                  {item.handle}
                </span>
                <PlayIcon />
              </div>
            </div>
          ))}
        </div>
      ))}
    </motion.div>
  );
}
