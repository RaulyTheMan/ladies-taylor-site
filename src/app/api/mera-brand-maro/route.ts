import { NextResponse } from "next/server";
import { z } from "zod";
import { createPublicClient, logQueryError } from "@/lib/supabase/public";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { TERMS, TERMS_VERSION } from "@/lib/meraBrandMaro";

const submissionSchema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(50),
  email: z.string().trim().pipe(z.email().max(320)),
  website: z.string().trim().max(500).optional(),
  brandName: z.string().trim().min(1).max(200),
  aboutBrand: z.string().trim().min(1).max(4000),
  whyNoBudget: z.string().trim().min(1).max(4000),
  // One `true` per clause, in order. Checked server-side too so the agreement
  // can't be skipped by posting to the route directly.
  terms: z.array(z.literal(true)).length(TERMS.length),
  // Must match the wording the server holds, so a tab left open across a
  // wording change can't record consent to text it never showed.
  termsVersion: z.literal(TERMS_VERSION),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (!checkRateLimit(`mera-brand-maro:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 })) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = submissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const { name, phone, email, website, brandName, aboutBrand, whyNoBudget } = parsed.data;

  const supabase = createPublicClient();
  const { error } = await supabase.from("mera_brand_maro_submissions").insert({
    name,
    phone,
    email,
    website_url: website || null,
    brand_name: brandName,
    about_brand: aboutBrand,
    why_no_budget: whyNoBudget,
    terms_version: TERMS_VERSION,
  });

  if (error) {
    logQueryError("api/mera-brand-maro insert", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
