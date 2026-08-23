"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { PRIMARY_BUTTON_CLASS } from "@/lib/ui";

export default function ContactFormCard() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="border border-black">
      <div className="flex items-center gap-3 px-6 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-lt-cream">
          <Image
            src="/images/logo/logo-mark.png"
            alt="Ladies Taylor"
            width={253}
            height={72}
            className="h-3 w-auto"
          />
        </div>
        <span className="text-sm font-bold text-black">ladies.taylor</span>
      </div>

      <div className="px-6 pb-10 pt-2">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.p
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="py-16 text-center text-lg text-black"
            >
              Thanks — we&rsquo;ll be in touch. 🤙
            </motion.p>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
            <p className="text-sm font-semibold text-black/60 line-through decoration-lt-red decoration-2">
              come touch us
            </p>
            <h2 className="mt-1 font-gothic text-4xl leading-none text-black">
              Get in touch
            </h2>

            <form
              className="mt-8 flex flex-col gap-6"
              onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);
                setError(false);

                try {
                  const res = await fetch("/api/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, phone, email }),
                  });
                  if (res.ok) {
                    setSubmitted(true);
                  } else {
                    setError(true);
                  }
                } catch {
                  setError(true);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <label htmlFor="contact-name" className="sr-only">
                Full Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="border-b border-black/30 bg-transparent pb-2 text-lg text-black placeholder:text-black/50 focus:border-black focus:outline-none"
              />
              <label htmlFor="contact-phone" className="sr-only">
                Phone Number
              </label>
              <input
                id="contact-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(+91) Phone Number"
                className="border-b border-black/30 bg-transparent pb-2 text-lg text-black placeholder:text-black/50 focus:border-black focus:outline-none"
              />
              <label htmlFor="contact-email" className="sr-only">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="border-b border-black/30 bg-transparent pb-2 text-lg text-black placeholder:text-black/50 focus:border-black focus:outline-none"
              />

              {error && (
                <p className="text-sm font-semibold text-lt-red">
                  Something went wrong. Please try again.
                </p>
              )}

              <div className="mt-4 flex items-center gap-5">
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: submitting ? 1 : 1.03 }}
                  whileTap={{ scale: submitting ? 1 : 0.97 }}
                  className={`${PRIMARY_BUTTON_CLASS} disabled:opacity-60`}
                >
                  {submitting ? "Signing up..." : "Sign up"}
                </motion.button>
              </div>
            </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
