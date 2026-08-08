"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { useState } from "react";
import type { NavItem } from "@/lib/nav";

export default function NavBar({ items }: { items: NavItem[] }) {
  // Radix's NavigationMenu owns hover-intent, touch, keyboard (arrows,
  // Escape), and outside-dismiss internally — this used to be a large block
  // of hand-rolled state (including a touch-specific patch) that's no
  // longer needed. This local flag exists only to drive the full-screen
  // backdrop, which Radix has no opinion on.
  const [hasOpenItem, setHasOpenItem] = useState(false);

  return (
    <>
      {hasOpenItem && (
        <div
          aria-hidden
          onClick={() => setHasOpenItem(false)}
          className="fixed inset-0 z-[10000] bg-white/70 opacity-0 backdrop-blur-sm transition-opacity duration-150 data-[open=true]:opacity-100"
          data-open={hasOpenItem}
        />
      )}

      <header className="relative z-[10001] flex items-center justify-between gap-4 px-6 py-5 md:px-10">
        <Link href="/" className="shrink-0" prefetch={false}>
          <Image
            src="/images/logo/logo-mark.png"
            alt="Ladies Taylor"
            width={253}
            height={72}
            className="h-8 w-auto md:h-9"
            priority
          />
        </Link>

        <NavigationMenu.Root
          onValueChange={(value) => setHasOpenItem(value !== "")}
          className="relative hidden md:block"
        >
          <NavigationMenu.List className="window-border flex items-center gap-1 rounded-squircle-md bg-lt-red px-2 py-1.5">
            {items.map((item) =>
              item.dropdown ? (
                <NavigationMenu.Item key={item.label} value={item.label}>
                  <NavigationMenu.Trigger className="group flex items-center gap-1 rounded-squircle-sm px-4 py-2 text-xs font-bold uppercase tracking-wide text-white outline-none transition-colors hover:bg-black/15 data-[state=open]:text-lt-yellow data-[state=open]:underline data-[state=open]:decoration-2 data-[state=open]:underline-offset-4">
                    {item.label}
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 6"
                      fill="none"
                      aria-hidden
                      className="transition-transform group-data-[state=open]:rotate-180"
                    >
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content className="outline-none">
                    <div className="grid grid-cols-[220px_1fr] gap-8 p-6">
                      <ul className="flex flex-col gap-1">
                        {item.dropdown.map((sub, si) => (
                          <li key={sub.label}>
                            <NavigationMenu.Link asChild>
                              <Link
                                href={sub.href}
                                prefetch={false}
                                className={`block rounded-squircle-sm px-3 py-2 text-left text-xs font-semibold ${
                                  si === 0
                                    ? "bg-lt-cream text-black"
                                    : "text-white hover:bg-black/15"
                                }`}
                              >
                                {sub.label}
                              </Link>
                            </NavigationMenu.Link>
                          </li>
                        ))}
                      </ul>
                      <div className="rounded-squircle-sm bg-lt-gray" />
                    </div>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              ) : (
                <NavigationMenu.Item key={item.label}>
                  <NavigationMenu.Link asChild>
                    <Link
                      href={item.href}
                      prefetch={false}
                      className="flex items-center gap-1 rounded-squircle-sm px-4 py-2 text-xs font-bold uppercase tracking-wide text-white outline-none transition-colors hover:bg-black/15"
                    >
                      {item.label}
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
              )
            )}
          </NavigationMenu.List>

          <div className="absolute left-0 right-0 top-full mt-2 flex justify-center">
            <NavigationMenu.Viewport className="window-border h-[var(--radix-navigation-menu-viewport-height)] w-full origin-top scale-y-95 rounded-squircle-md bg-lt-red opacity-0 transition-[opacity,transform] duration-150 data-[state=open]:scale-y-100 data-[state=open]:opacity-100" />
          </div>
        </NavigationMenu.Root>

        <div className="flex shrink-0 items-center gap-4">
          <Link
            href="/#feed-get-in-touch"
            prefetch={false}
            className="hidden text-xs font-bold uppercase tracking-wide text-lt-red sm:inline"
          >
            Enquire
          </Link>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/#feed-get-in-touch"
              prefetch={false}
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
