import { NextResponse } from "next/server";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";
import { sendAugustQueryNotification } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

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

  const { name, phone, email, city, brandName, brandCategory, services, budget } =
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
  });

  if (error) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  try {
    await sendAugustQueryNotification({
      name,
      phone,
      email,
      city,
      brandName,
      brandCategory,
      services,
      budget,
    });
  } catch {
    // Notification email is best-effort — the submission itself already saved.
  }

  return NextResponse.json({ ok: true });
}
