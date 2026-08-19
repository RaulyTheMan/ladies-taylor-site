import { NextResponse } from "next/server";
import { z } from "zod";
import { createPublicClient, logQueryError } from "@/lib/supabase/public";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendMetaEvent } from "@/lib/metaCapi";
import { metaCaptureSchema } from "@/lib/metaCapture";

const CITIES = [
  "Bangalore",
  "Mumbai",
  "Mysore",
  "Mangalore",
  "Chennai",
  "Kochi",
  "Pune",
  "Other",
] as const;

const BRAND_CATEGORIES = [
  "FMCG",
  "CPG",
  "F&B",
  "Pubs and Restaurants",
  "Fashion",
  "Technology",
  "Other",
] as const;

const BUDGETS = ["75K", "1 Lakh", "2 Lakhs", "10 Lakhs"] as const;

const querySchema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(50),
  email: z.string().trim().email().max(200),
  city: z.enum(CITIES),
  brandName: z.string().trim().min(1).max(200),
  brandCategory: z.enum(BRAND_CATEGORIES),
  services: z.array(z.string().trim().min(1)).min(1),
  budget: z.enum(BUDGETS),
  // Optional so a submission still succeeds if the browser blocked the pixel.
  meta: metaCaptureSchema.optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`august-query:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = querySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const { name, phone, email, city, brandName, brandCategory, services, budget, meta } =
    parsed.data;

  const supabase = createPublicClient();
  const { error } = await supabase.from("august_query_submissions").insert({
    name,
    phone,
    email,
    city,
    brand_name: brandName,
    brand_category: brandCategory,
    services,
    budget,
    fbp: meta?.fbp ?? null,
    fbc: meta?.fbc ?? null,
    fb_event_id: meta?.eventId ?? null,
    event_source_url: meta?.eventSourceUrl ?? null,
  });

  if (error) {
    logQueryError("api/august-query insert", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  // Server-side copy of the browser's Lead event, deduped by the shared event
  // id. Deliberately awaited but never fatal: this is the only copy that
  // survives an ad blocker, so a failure is worth logging, not worth failing
  // the submission over.
  await sendMetaEvent({
    eventName: "Lead",
    eventId: meta?.eventId,
    eventSourceUrl: meta?.eventSourceUrl,
    actionSource: "website",
    customData: { content_name: "August Query Form", lead_source: "august_query" },
    userData: {
      email,
      phone,
      fbp: meta?.fbp,
      fbc: meta?.fbc,
      clientIp: ip,
      userAgent: request.headers.get("user-agent"),
    },
  });

  return NextResponse.json({ ok: true });
}
