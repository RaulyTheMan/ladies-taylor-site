import { createPublicClient, logQueryError } from "@/lib/supabase/public";
import type { Database } from "@/lib/supabase/database.types";

export type BookingStatus = Database["public"]["Enums"]["booking_status"];

export type ConsultationType = {
  id: string;
  slug: string;
  title: string;
  description: string;
  durationMinutes: number;
  priceInr: number;
  locationLabel: string;
  hostTimezone: string;
  minNoticeMinutes: number;
  maxDaysAhead: number;
  /** Only this calendar month is bookable -- enforced in SQL, mirrored in the calendar. */
  currentMonthOnly: boolean;
};

/**
 * The columns the public booker needs, spelled out rather than "*" so an admin-
 * only column added later doesn't quietly start shipping to every visitor.
 */
const PUBLIC_COLUMNS =
  "id, slug, title, description, duration_minutes, price_inr, location_label, host_timezone, min_notice_minutes, max_days_ahead, current_month_only, sort_order";

type PublicRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  duration_minutes: number;
  price_inr: number;
  location_label: string;
  host_timezone: string;
  min_notice_minutes: number;
  max_days_ahead: number;
  current_month_only: boolean;
  sort_order: number;
};

function mapType(row: PublicRow): ConsultationType {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    durationMinutes: row.duration_minutes,
    priceInr: row.price_inr,
    locationLabel: row.location_label,
    hostTimezone: row.host_timezone,
    minNoticeMinutes: row.min_notice_minutes,
    maxDaysAhead: row.max_days_ahead,
    currentMonthOnly: row.current_month_only,
  };
}

export async function getConsultationTypes(): Promise<ConsultationType[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("consultation_types")
    .select(PUBLIC_COLUMNS)
    // RLS already restricts anon to published rows; the filter is here so the
    // same call from an authenticated session behaves identically.
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) logQueryError("getConsultationTypes", error);
  if (error || !data) return [];
  return (data as unknown as PublicRow[]).map(mapType);
}

export async function getConsultationTypeBySlug(
  slug: string
): Promise<ConsultationType | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("consultation_types")
    .select(PUBLIC_COLUMNS)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) logQueryError("getConsultationTypeBySlug", error);
  if (error || !data) return null;
  return mapType(data as unknown as PublicRow);
}

export type ManagedBooking = {
  id: string;
  status: BookingStatus;
  startAt: string;
  endAt: string;
  title: string;
  slug: string;
  durationMinutes: number;
  amountInr: number;
  name: string;
  email: string;
  phone: string;
  notes: string | null;
  guestTimezone: string | null;
  locationLabel: string;
  holdExpiresAt: string | null;
  cancelledAt: string | null;
  refundId: string | null;
  canCancel: boolean;
};

/**
 * Looks a booking up by its manage token -- the guest's only credential.
 *
 * Goes through an RPC rather than a table read because anon has no privileges
 * whatsoever on consultation_bookings.
 */
export async function getBookingByToken(
  token: string
): Promise<ManagedBooking | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .rpc("get_consultation_booking", { p_token: token })
    .maybeSingle();

  if (error) logQueryError("getBookingByToken", error);
  if (error || !data) return null;

  return {
    id: data.id,
    status: data.status,
    startAt: data.start_at,
    endAt: data.end_at,
    title: data.title,
    slug: data.slug,
    durationMinutes: data.duration_minutes,
    amountInr: data.amount_inr,
    name: data.name,
    email: data.email,
    phone: data.phone,
    notes: data.notes,
    guestTimezone: data.guest_timezone,
    locationLabel: data.location_label,
    holdExpiresAt: data.hold_expires_at,
    cancelledAt: data.cancelled_at,
    refundId: data.refund_id,
    canCancel: data.can_cancel,
  };
}
