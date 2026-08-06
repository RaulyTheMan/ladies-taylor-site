"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState, type FocusEvent, type KeyboardEvent } from "react";
import type { NavItem } from "@/lib/nav";

export default function NavBar({ items }: { items: NavItem[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const activeItem = hoveredIndex !== null ? items[hoveredIndex] : null;

  function closeMenu() {
    setHoveredIndex(null);
  }

  // Closes the dropdown once focus leaves the whole nav (not just the
  // current link) — e.g. tabbing past the last dropdown link.
  function handleNavBlur(e: FocusEvent<HTMLElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      closeMenu();
    }
  }

  function handleNavKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key === "Escape" && hoveredIndex !== null) {
      closeMenu();
      (e.currentTarget.querySelector("a") as HTMLElement | null)?.focus();
    }
  }

  return (
    <>
      <AnimatePresence>
        {hoveredIndex !== null && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[10000] bg-white/70 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <header className="relative z-[10001] flex items-center justify-between gap-4 px-6 py-5 md:px-10">
        <Link href="/" className="shrink-0">
          <Image
            src="/images/logo/logo-mark.png"
            alt="Ladies Taylor"
            width={253}
            height={72}
            className="h-8 w-auto md:h-9"
            priority
          />
        </Link>

        <nav
          onMouseLeave={closeMenu}
          onBlur={handleNavBlur}
          onKeyDown={handleNavKeyDown}
          className="window-border relative hidden items-center gap-1 rounded-squircle-md bg-lt-red px-2 py-1.5 md:flex"
        >
          {items.map((item, i) => {
            const isOpen = hoveredIndex === i;
            const dropdownId = `nav-dropdown-${i}`;

            return (
              <div
                key={item.label}
                onMouseEnter={() => setHoveredIndex(i)}
                className="relative"
              >
                <Link
                  href={item.href}
                  onFocus={() => setHoveredIndex(i)}
                  aria-haspopup={item.dropdown ? true : undefined}
                  aria-expanded={item.dropdown ? isOpen : undefined}
                  aria-controls={item.dropdown ? dropdownId : undefined}
                  className={`flex items-center gap-1 rounded-squircle-sm px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                    isOpen
                      ? "text-lt-yellow underline decoration-2 underline-offset-4"
                      : "text-white hover:bg-black/15"
                  }`}
                >
                  {item.label}
                  {item.dropdown && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 6"
                      fill="none"
                      aria-hidden
                      className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    >
                      <path
                        d="M1 1l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  )}
                </Link>
              </div>
            );
          })}

          <AnimatePresence>
            {activeItem?.dropdown && (
              <motion.div
                id={`nav-dropdown-${hoveredIndex}`}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="window-border absolute left-0 right-0 top-full mt-2 rounded-squircle-md bg-lt-red p-6"
              >
                <div className="grid grid-cols-[220px_1fr] gap-8">
                  <ul className="flex flex-col gap-1">
                    {activeItem.dropdown.map((sub, si) => (
                      <li key={sub.label}>
                        <Link
                          href={sub.href}
                          className={`block rounded-squircle-sm px-3 py-2 text-left text-xs font-semibold ${
                            si === 0
                              ? "bg-lt-cream text-black"
                              : "text-white hover:bg-black/15"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="rounded-squircle-sm bg-lt-gray" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <div className="flex shrink-0 items-center gap-4">
          <Link
            href="/#feed-get-in-touch"
            className="hidden text-xs font-bold uppercase tracking-wide text-lt-red sm:inline"
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
      </header>
    </>
  );
}
