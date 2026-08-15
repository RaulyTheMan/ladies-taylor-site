"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { PRIMARY_BUTTON_CLASS } from "@/lib/ui";
import { trackMetaPixelEvent } from "@/lib/metaPixel";

const CITIES = [
  "Bangalore",
  "Mumbai",
  "Mysore",
  "Mangalore",
  "Chennai",
  "Kochi",
  "Pune",
  "Other",
] as const;

const BRAND_CATEGORIES = [
  "FMCG",
  "CPG",
  "F&B",
  "Pubs and Restaurants",
  "Fashion",
  "Technology",
  "Other",
] as const;

const SERVICES = [
  "Social Media",
  "Videography/Photography",
  "Branding",
  "Performance Marketing",
  "All of the above",
] as const;

const BUDGETS = ["75K", "1 Lakh", "2 Lakhs", "10 Lakhs"] as const;

type FormState = {
  name: string;
  phone: string;
  email: string;
  city: string;
  brandName: string;
  brandCategory: string;
  services: string[];
  budget: string;
};

const EMPTY_STATE: FormState = {
  name: "",
  phone: "",
  email: "",
  city: "",
  brandName: "",
  brandCategory: "",
  services: [],
  budget: "",
};

const labelClass = "text-xs font-bold uppercase tracking-wide text-black/50";

const inputClass =
  "mt-1.5 w-full border-b-2 border-black/20 bg-transparent pb-2 text-base text-black placeholder:text-black/30 focus:border-lt-red focus:outline-none";

const selectClass =
  "mt-1.5 w-full appearance-none border-b-2 border-black/20 bg-transparent bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22none%22 stroke=%22black%22 stroke-width=%222%22><path d=%22M5 8l5 5 5-5%22/></svg>')] bg-[right_0.25rem_center] bg-no-repeat pb-2 pr-6 text-base text-black focus:border-lt-red focus:outline-none";

const servicePillClass =
  "comic-border-sm rounded-squircle-sm bg-white px-3.5 py-2 text-left text-sm font-bold text-black transition-transform hover:-translate-y-0.5";

const servicePillActiveClass =
  "comic-border-sm rounded-squircle-sm bg-lt-yellow px-3.5 py-2 text-left text-sm font-bold text-black";

export default function AugustQueryForm() {
  const [page, setPage] = useState<1 | 2>(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<FormState>(EMPTY_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const page1Valid = useMemo(
    () =>
      data.name.trim().length > 0 &&
      data.phone.trim().length > 0 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()) &&
      data.city.length > 0,
    [data]
  );

  const page2Valid = useMemo(
    () =>
      data.brandName.trim().length > 0 &&
      data.brandCategory.length > 0 &&
      data.services.length > 0 &&
      data.budget.length > 0,
    [data]
  );

  function toggleService(service: string) {
    setData((d) => ({
      ...d,
      services: d.services.includes(service)
        ? d.services.filter((s) => s !== service)
        : [...d.services, service],
    }));
  }

  function goToPage2() {
    if (!page1Valid) return;
    setDirection(1);
    setPage(2);
  }

  function goToPage1() {
    setDirection(-1);
    setPage(1);
  }

  async function handleSubmit() {
    if (!page2Valid) return;
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/august-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        trackMetaPixelEvent("Lead", { content_name: "August Query Form" });
        setSubmitted(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -24 : 24 }),
  };

  const progress = submitted ? 1 : page === 1 ? 0.15 : 0.6;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo/logo-mark.png"
            alt="Ladies Taylor"
            width={253}
            height={72}
            className="h-6 w-auto"
          />
        </Link>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-black/10 md:w-56">
          <motion.div
            className="h-full bg-lt-red"
            animate={{ width: `${Math.round(progress * 100)}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-wide text-black/40 hover:text-black"
        >
          Close
        </Link>
      </header>

      <div className="flex flex-1 items-start justify-center px-6 py-8 md:items-center md:px-10">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" custom={direction}>
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-center"
              >
                <p className="text-sm font-semibold text-black/60 line-through decoration-lt-red decoration-2">
                  logged.
                </p>
                <h1 className="mt-2 text-4xl font-bold leading-none text-black md:text-5xl">
                  Thanks, we&rsquo;re on it.
                </h1>
                <p className="mx-auto mt-6 max-w-md text-base text-black/70">
                  Someone from the team will reach out shortly. In the
                  meantime, go check out the rest of the site.
                </p>
                <Link href="/" className={`${PRIMARY_BUTTON_CLASS} mt-8 inline-block`}>
                  Back home
                </Link>
              </motion.div>
            ) : page === 1 ? (
              <motion.div
                key="page1"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-lt-red">
                  Section I
                </p>
                <h1 className="mt-1 text-3xl font-bold leading-tight text-black md:text-4xl">
                  Who are you?
                </h1>

                <div className="mt-8 flex flex-col gap-5">
                  <label className="block">
                    <span className={labelClass}>Your Name</span>
                    <input
                      type="text"
                      value={data.name}
                      onChange={(e) =>
                        setData((d) => ({ ...d, name: e.target.value }))
                      }
                      placeholder="Full name"
                      className={inputClass}
                    />
                  </label>

                  <label className="block">
                    <span className={labelClass}>Number</span>
                    <input
                      type="tel"
                      value={data.phone}
                      onChange={(e) =>
                        setData((d) => ({ ...d, phone: e.target.value }))
                      }
                      placeholder="(+91) Phone number"
                      className={inputClass}
                    />
                  </label>

                  <label className="block">
                    <span className={labelClass}>Email</span>
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) =>
                        setData((d) => ({ ...d, email: e.target.value }))
                      }
                      placeholder="your@email.com"
                      className={inputClass}
                    />
                  </label>

                  <label className="block">
                    <span className={labelClass}>City</span>
                    <select
                      value={data.city}
                      onChange={(e) =>
                        setData((d) => ({ ...d, city: e.target.value }))
                      }
                      className={selectClass}
                    >
                      <option value="" disabled>
                        Select a city
                      </option>
                      {CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-9 flex justify-end">
                  <button
                    type="button"
                    onClick={goToPage2}
                    disabled={!page1Valid}
                    className={`${PRIMARY_BUTTON_CLASS} disabled:opacity-30`}
                  >
                    Next →
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="page2"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-lt-red">
                  Section II
                </p>
                <h1 className="mt-1 text-3xl font-bold leading-tight text-black md:text-4xl">
                  Why are you reaching out?
                </h1>

                <div className="mt-8 flex flex-col gap-5">
                  <label className="block">
                    <span className={labelClass}>Brand Name</span>
                    <input
                      type="text"
                      value={data.brandName}
                      onChange={(e) =>
                        setData((d) => ({ ...d, brandName: e.target.value }))
                      }
                      placeholder="Brand name"
                      className={inputClass}
                    />
                  </label>

                  <label className="block">
                    <span className={labelClass}>Brand Category</span>
                    <select
                      value={data.brandCategory}
                      onChange={(e) =>
                        setData((d) => ({
                          ...d,
                          brandCategory: e.target.value,
                        }))
                      }
                      className={selectClass}
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      {BRAND_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {data.brandCategory === "Other" && (
                      <span className="mt-1.5 block text-xs text-black/50">
                        You can still send us the query, but we don&rsquo;t
                        service this category yet.
                      </span>
                    )}
                  </label>

                  <div>
                    <span className={labelClass}>What services do you need?</span>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {SERVICES.map((service) => (
                        <button
                          key={service}
                          type="button"
                          onClick={() => toggleService(service)}
                          className={
                            data.services.includes(service)
                              ? servicePillActiveClass
                              : servicePillClass
                          }
                        >
                          {service}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="block">
                    <span className={labelClass}>What&rsquo;s your budget?</span>
                    <select
                      value={data.budget}
                      onChange={(e) =>
                        setData((d) => ({ ...d, budget: e.target.value }))
                      }
                      className={selectClass}
                    >
                      <option value="" disabled>
                        Select a budget
                      </option>
                      {BUDGETS.map((budget) => (
                        <option key={budget} value={budget}>
                          {budget}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {error && (
                  <p className="mt-4 text-sm font-semibold text-lt-red">
                    Something went wrong. Please try again.
                  </p>
                )}

                <div className="mt-9 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={goToPage1}
                    className="text-xs font-bold uppercase tracking-wide text-black/40 hover:text-black"
                  >
                    ← Back
                  </button>
                  <motion.button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!page2Valid || submitting}
                    whileHover={{ scale: !page2Valid || submitting ? 1 : 1.03 }}
                    whileTap={{ scale: !page2Valid || submitting ? 1 : 0.97 }}
                    className={`${PRIMARY_BUTTON_CLASS} disabled:opacity-30`}
                  >
                    {submitting ? "Sending..." : "Send it →"}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
