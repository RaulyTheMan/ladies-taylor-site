"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const LINES = [
  { label: "Social Media", href: "/services/social-media" },
  { label: "Branding", href: "/services/branding" },
  { label: "Packaging", href: "/services/packaging" },
  { label: "Web Development", href: "/services/web-development" },
  { label: "Contact", href: "/#feed-get-in-touch" },
];

export default function ServiceBand() {
  return (
    <section className="bg-lt-red px-6 py-16 text-center md:py-20">
      <ul className="mx-auto flex max-w-4xl flex-col gap-2 md:gap-4">
        {LINES.map((line, i) => (
          <motion.li
            key={line.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
          >
            <Link
              href={line.href}
              className="font-display text-3xl uppercase leading-none text-white transition-opacity hover:opacity-80 sm:text-4xl md:text-6xl"
            >
              {line.label}
            </Link>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
