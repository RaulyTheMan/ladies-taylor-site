"use client";

import { useId, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { controlClasses } from "@/components/ui/Field";

/**
 * Debounced, URL-driven filter box. Writes `q` so the server component
 * re-filters on navigation.
 *
 * Uncontrolled and keyed on the URL's current value rather than synced via a
 * setState-in-effect: typing doesn't change `initialValue`, so no remount
 * happens until the debounced navigation actually lands (browser back/forward,
 * say), at which point the key and the DOM value already agree.
 */
export default function StudioSearchInput({
  placeholder = "Search...",
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialValue = searchParams.get("q") ?? "";
  const inputId = useId();

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
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-admin-muted"
        aria-hidden="true"
      />
      <input
        key={initialValue}
        id={inputId}
        name="q"
        type="search"
        defaultValue={initialValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        className={controlClasses(false, "h-8 pl-8 pr-2.5")}
      />
    </div>
  );
}
