import { createPublicClient, logQueryError } from "@/lib/supabase/public";
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

async function countRegistrationsBatch(
  supabase: SupabaseClient<Database>,
  eventIds: string[]
) {
  // Fetch all registration counts in parallel instead of sequentially
  const results = await Promise.all(
    eventIds.map(async (eventId) => {
      const { data } = await supabase.rpc("get_event_registration_counts", {
        p_event_id: eventId,
      });
      const row = data?.[0];
      return {
        eventId,
        counts: {
          registered: row?.registered_count ?? 0,
          waiting: row?.waiting_count ?? 0,
        },
      };
    })
  );

  const counts: Record<string, { registered: number; waiting: number }> = {};
  results.forEach(({ eventId, counts: eventCounts }) => {
    counts[eventId] = eventCounts;
  });
  return counts;
}

function mapEvent(
  row: Tables<"events">,
  counts: Record<string, { registered: number; waiting: number }>
): EventItem {
  const { registered: registeredCount, waiting: waitingCount } = counts[row.id] || { registered: 0, waiting: 0 };

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

  if (error) logQueryError("getEvents", error);
  if (error || !data) return [];

  // Batch fetch all registration counts in one RPC call instead of one per event
  const eventIds = data.map((row) => row.id);
  const counts = await countRegistrationsBatch(supabase, eventIds);

  return data.map((row) => mapEvent(row, counts));
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) logQueryError("getEventBySlug", error);
  if (error || !data) return null;

  const counts = await countRegistrationsBatch(supabase, [data.id]);
  return mapEvent(data, counts);
}
