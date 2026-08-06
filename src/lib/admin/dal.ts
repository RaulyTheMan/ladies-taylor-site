import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

// The real auth gate (per Next's auth guide): validates the session against
// Supabase Auth directly, unlike the proxy's cookie-presence pre-filter.
// Wrapped in React's cache() so multiple calls in one render pass dedupe.
export const verifySession = cache(async () => {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return { user };
});
