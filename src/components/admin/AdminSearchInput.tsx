"use client";

import { useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ADMIN_INPUT_CLASS } from "@/lib/admin/ui";

// Debounced, URL-driven search box. Writes to the `q` query param so the
// server component re-filters on navigation — works without client JS for
// the initial render, and degrades to a normal (non-live) search if JS is
// slow to hydrate.
//
// Uncontrolled + keyed on the URL's current value rather than synced via a
// setState-in-effect: typing doesn't change `initialValue`, so no remount
// happens until the debounced navigation actually lands (e.g. browser
// back/forward), at which point the key and the DOM value already agree.
export default function AdminSearchInput({
  placeholder = "Search...",
}: {
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialValue = searchParams.get("q") ?? "";

  function handleChange(next: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) {
        params.set("q", next);
      } else {
        params.delete("q");
      }
      router.replace(`${pathname}?${params.toString()}`);
    }, 250);
  }

  return (
    <input
      key={initialValue}
      type="search"
      defaultValue={initialValue}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className={`${ADMIN_INPUT_CLASS} mt-0 max-w-xs`}
    />
  );
}
