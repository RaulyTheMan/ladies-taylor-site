import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type EventItem = {
  slug: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  price: number;
  hostedBy: { name: string; role: string };
  capacity: number | null;
  registeredCount: number;
  waitingCount: number;
  description: string;
  learnItems: string[];
  coverImageUrl?: string;
  publishedAt?: string;
  // Scaffold entry — title/date/copy are deliberately generic placeholders,
  // not invented event specifics. Swap in real content when it's ready.
  isPlaceholder?: boolean;
};

function formatEventDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.toLocaleDateString("en-GB", { day: "2-digit" });
  const month = d.toLocaleDateString("en-US", { month: "long" });
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  return `${day} ${month}, ${weekday}`;
}

async function countRegistrations(
  supabase: SupabaseClient<Database>,
  eventId: string
) {
  // event_registrations has no anon SELECT policy (protects registrant PII),
  // so counts come from a SECURITY DEFINER RPC that only ever returns
  // aggregates, never individual rows.
  const { data } = await supabase.rpc("get_event_registration_counts", {
    p_event_id: eventId,
  });
  const row = data?.[0];
  return { registered: row?.registered_count ?? 0, waiting: row?.waiting_count ?? 0 };
}

async function mapEvent(
  supabase: SupabaseClient<Database>,
  row: Tables<"events">
): Promise<EventItem> {
  const { registered: registeredCount, waiting: waitingCount } =
    await countRegistrations(supabase, row.id);

  return {
    slug: row.slug,
    title: row.title,
    date: row.event_date ? formatEventDate(row.event_date) : "TBD",
    time: row.time_label ?? "TBD",
    duration: row.duration_label ?? "TBD",
    location: row.location ?? "TBD",
    price: row.price_inr,
    hostedBy: { name: row.host_name, role: row.host_role },
    capacity: row.capacity,
    registeredCount,
    waitingCount,
    description: row.description,
    learnItems: row.learn_items,
    coverImageUrl: row.cover_image_url ?? undefined,
    publishedAt: row.published_at ?? undefined,
    isPlaceholder: row.is_placeholder,
  };
}

export async function getEvents(): Promise<EventItem[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return Promise.all(data.map((row) => mapEvent(supabase, row)));
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return mapEvent(supabase, data);
}
