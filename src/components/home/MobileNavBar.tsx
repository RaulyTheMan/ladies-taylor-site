"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { NavItem } from "@/lib/nav";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MobileNavBar({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    setExpandedIndex(null);
  };

  // Moves focus into the dialog on open, and back to the trigger on close —
  // standard modal focus management so keyboard/screen-reader users aren't
  // dropped back at the top of the page.
  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    } else {
      openButtonRef.current?.focus();
    }
  }, [open]);

  function handleDialogKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }

    if (e.key !== "Tab" || !dialogRef.current) return;

    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <div className="mx-6 mt-6">
        <div className="window-border flex items-center justify-between rounded-squircle-md bg-lt-cream px-4 py-3">
          <Image
            src="/images/logo/logo-mark.png"
            alt="Ladies Taylor"
            width={253}
            height={72}
            className="h-7 w-auto"
            priority
          />

          <button
            ref={openButtonRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-squircle-sm border border-black"
          >
            <span className="h-0.5 w-4 bg-black" />
            <span className="h-0.5 w-4 bg-black" />
            <span className="h-0.5 w-4 bg-black" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            onKeyDown={handleDialogKeyDown}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[10000] flex flex-col bg-lt-red"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <Image
                src="/images/logo/logo-mark.png"
                alt="Ladies Taylor"
                width={253}
                height={72}
                className="h-6 w-auto"
              />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-squircle-sm border border-white text-white"
              >
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                  <path
                    d="M1 1l14 14M15 1L1 15"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <nav className="flex flex-1 flex-col overflow-y-auto px-6 pb-8">
              <ul className="flex flex-col divide-y divide-white/20">
                {items.map((item, i) => (
                  <li key={item.label}>
                    {item.dropdown ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedIndex(expandedIndex === i ? null : i)
                          }
                          className="flex w-full items-center justify-between py-4 text-left text-lg font-bold uppercase tracking-wide text-white"
                        >
                          {item.label}
                          <svg
                            width="12"
                            height="8"
                            viewBox="0 0 10 6"
                            fill="none"
                            className={`transition-transform ${
                              expandedIndex === i ? "rotate-180" : ""
                            }`}
                          >
                            <path
                              d="M1 1l4 4 4-4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </button>
                        <AnimatePresence initial={false}>
                          {expandedIndex === i && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="flex flex-col gap-1 overflow-hidden pl-4"
                            >
                              {item.dropdown.map((sub) => (
                                <li key={sub.label} className="pb-2 pt-1">
                                  <Link
                                    href={sub.href}
                                    onClick={close}
                                    className="block py-1 text-sm font-semibold text-white/80"
                                  >
                                    {sub.label}
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={close}
                        className="block py-4 text-lg font-bold uppercase tracking-wide text-white"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex flex-col gap-3 pt-8">
                <Link
                  href="/#feed-get-in-touch"
                  onClick={close}
                  className="comic-border-sm rounded-squircle-md bg-lt-dark px-6 py-3 text-center text-sm font-bold uppercase tracking-wide text-lt-red"
                >
                  Contact
                </Link>
                <Link
                  href="/#feed-get-in-touch"
                  onClick={close}
                  className="py-2 text-center text-sm font-bold uppercase tracking-wide text-white underline underline-offset-4"
                >
                  Enquire
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
