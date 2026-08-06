import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Anon-key client for public reads and public form inserts. `no-store` keeps
 * Supabase reads out of Next's fetch cache — freshness is driven entirely by
 * `revalidatePath` calls from the admin mutations, not fetch-cache tags.
 */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    }
  );
}
