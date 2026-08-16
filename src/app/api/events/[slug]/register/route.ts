import { NextResponse } from "next/server";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(50),
  email: z.string().trim().email().max(200),
  // Optional context captured by the "Join The Waiting List" modal.
  reason: z.string().trim().max(2000).optional(),
  brandName: z.string().trim().max(200).optional(),
  designation: z.string().trim().max(200).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`event-register:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  const { slug } = await params;
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const supabase = createPublicClient();
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (eventError || !event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const { data: status, error } = await supabase.rpc("register_for_event", {
    p_event_id: event.id,
    p_name: parsed.data.name,
    p_phone: parsed.data.phone,
    p_email: parsed.data.email,
    p_reason: parsed.data.reason,
    p_brand_name: parsed.data.brandName,
    p_designation: parsed.data.designation,
  });

  if (error) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ status });
}
