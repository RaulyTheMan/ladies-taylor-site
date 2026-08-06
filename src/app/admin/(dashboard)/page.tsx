import Link from "next/link";
import { createSessionClient } from "@/lib/supabase/server";
import { ADMIN_H1_CLASS } from "@/lib/admin/ui";

export default async function AdminDashboardPage() {
  const supabase = await createSessionClient();

  const [events, brands, posts, leads] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("brands").select("*", { count: "exact", head: true }),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase
      .from("contact_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  const cards = [
    { label: "Events", href: "/admin/events", count: events.count ?? 0 },
    { label: "Brands", href: "/admin/brands", count: brands.count ?? 0 },
    {
      label: "Press & Media Posts",
      href: "/admin/press-media",
      count: posts.count ?? 0,
    },
    { label: "New Leads", href: "/admin/leads", count: leads.count ?? 0 },
  ];

  return (
    <div>
      <h1 className={ADMIN_H1_CLASS}>Dashboard</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border border-black/10 p-5 transition-colors hover:border-black/25"
          >
            <p className="text-3xl font-semibold text-black">{card.count}</p>
            <p className="mt-1 text-sm text-black/60">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
