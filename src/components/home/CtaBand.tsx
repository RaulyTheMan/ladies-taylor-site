"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CtaBand() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-lt-red px-6 py-16 text-center md:py-20"
    >
      <h2 className="font-gothic text-3xl text-white sm:text-4xl">
        Fuck The Bullshit
      </h2>
      <p className="mt-1 text-sm text-white/90">Start getting results.</p>
      <div className="mt-5 flex items-center justify-center gap-4">
        <Link
          href="/#feed-get-in-touch"
          className="text-xs font-bold uppercase tracking-wide text-white"
        >
          Enquire
        </Link>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Link
            href="/#feed-get-in-touch"
            className="comic-border-sm rounded-squircle-md bg-lt-dark px-5 py-2 text-xs font-bold uppercase tracking-wide text-white"
          >
            Contact
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
