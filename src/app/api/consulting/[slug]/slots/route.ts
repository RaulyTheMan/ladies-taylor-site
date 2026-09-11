import { NextResponse } from "next/server";
import { z } from "zod";
import { createPublicClient, logQueryError } from "@/lib/supabase/public";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// A GET route handler rather than a Server Action, on purpose: GETs are
// abortable when someone flips months quickly, can carry Cache-Control, and can
// be debugged with curl -- which you will want the first time the slot maths
// looks wrong.

const querySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = getClientIp(request);
  // 60, not the house 5: a visitor legitimately pages through several months,
  // and a 429 here breaks browsing rather than stopping abuse. The endpoint
  // only reads derived data -- the expensive one to protect is /hold.
  if (!checkRateLimit(`consult-slots:${ip}`, { limit: 60, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  const { slug } = await params;
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    from: url.searchParams.get("from"),
    to: url.searchParams.get("to"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid range." }, { status: 400 });
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("list_consultation_slots", {
    p_slug: slug,
    p_from: parsed.data.from,
    p_to: parsed.data.to,
  });

  if (error) {
    logQueryError("api/consulting/slots", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  // UTC instants only. No localised string crosses the wire, so there is
  // nothing for the server and the client to disagree about.
  return NextResponse.json(
    { slots: (data ?? []).map((row) => row.starts_at) },
    {
      headers: {
        // A month of availability changes rarely; this collapses the traffic of
        // someone flipping back and forth without making a taken slot linger
        // for long.
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  );
}
