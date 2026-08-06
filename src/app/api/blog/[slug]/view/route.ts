import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: "Missing slug." }, { status: 400 });
  }

  const supabase = createPublicClient();
  const { data: viewCount, error } = await supabase.rpc("increment_post_view", {
    p_slug: slug,
  });

  if (error) {
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }

  // The RPC only matches published posts and returns null for anything else
  // (unpublished slug, typo, race with deletion) — treat that as a quiet
  // no-op rather than a client-visible error.
  if (viewCount === null) {
    return NextResponse.json({ viewCount: null });
  }

  return NextResponse.json({ viewCount });
}
