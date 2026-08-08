import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { PostgrestError } from "@supabase/supabase-js";

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

/**
 * Most reads on the site fall back to an empty/"no content" render when
 * their Supabase query errors — a real outage (bad RLS policy, expired key,
 * network blip) would otherwise look visually identical to "nothing's been
 * added yet," with no signal anywhere that anything's actually wrong. Call
 * this alongside that fallback so a real failure at least shows up in server
 * logs instead of vanishing silently.
 */
export function logQueryError(context: string, error: PostgrestError) {
  console.error(`[query] ${context}:`, error.message, error);
}
