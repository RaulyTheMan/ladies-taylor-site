"use client";

import { useLayoutEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { DockApp, WindowDef } from "./types";

// DesktopHero pulls in framer-motion (~195KB) and, via its live-chat window,
// the full Supabase client SDK (~230KB) for a realtime subscription — over
// 400KB of JS that's pure decoration below the `md` breakpoint, where the
// scene is only ever `display:none`. The page still CSS-hides it there (see
// page.tsx) so layout doesn't shift, but this gate stops that JS from being
// fetched, hydrated, or run at all on mobile: it's dynamically imported and
// only actually mounted once a real `md`-or-wider viewport is confirmed
// client-side. SSR renders nothing here — this content has no text/SEO
// value of its own (page.tsx has a separate sr-only <h1> for that), so an
// empty box for one client render pass is a fine trade for not shipping
// ~400KB nobody on mobile can even see.
const DesktopHero = dynamic(() => import("./DesktopHero"), { ssr: false });

export default function DesktopHeroGate({
  windowDefs,
  dockApps,
}: {
  windowDefs: WindowDef[];
  dockApps: DockApp[];
}) {
  const [isDesktop, setIsDesktop] = useState(false);

  useLayoutEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    // matchMedia doesn't exist during SSR, so this can only be read after
    // mount — state starts false (matching the server render) and is
    // corrected here, before paint, to avoid a visible flash on desktop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDesktop(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  if (!isDesktop) return null;
  return <DesktopHero windowDefs={windowDefs} dockApps={dockApps} />;
}
