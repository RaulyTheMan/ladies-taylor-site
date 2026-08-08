"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function PositioningSection() {
  return (
    <section className="bg-lt-blue px-6 py-16 md:py-20">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 md:flex-row md:items-center md:gap-12">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="shrink-0"
        >
          <Image
            src="/images/mascots/godzilla.png"
            alt=""
            width={1024}
            height={1024}
            loading="lazy"
            className="w-56 sm:w-72"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          <span className="comic-border-sm inline-block -rotate-1 bg-lt-red px-4 py-2 font-display text-xl uppercase text-white sm:text-2xl md:text-3xl">
            Most Agencies Don&apos;t Give a Sh*t!
          </span>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
            And they&apos;re not supposed to, they&apos;ve got a B2B brands
            willing to pay f*cktons for absolutely mediocre work.
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
            That&apos;s the problem we recognized, D2C and consumer brands
            don&apos;t have many agencies left because the top dogs sell
            themselves out for the corporate moolah. There&apos;s also a
            large gap in terms of offering vs capability. We don&apos;t
            outsource the work, it&apos;s all in-house. And finally
            there&apos;s the biggest issue, it&apos;s the talent.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
