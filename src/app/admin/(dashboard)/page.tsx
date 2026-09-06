import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { createSessionClient } from "@/lib/supabase/server";
import { ADMIN_H1_CLASS } from "@/lib/admin/ui";
import { ADMIN_CRM_URL } from "@/lib/admin/nav";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createSessionClient();

  const [events, brands, posts, subscribers] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("brands").select("*", { count: "exact", head: true }),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true }),
  ]);

  const cards = [
    { label: "Events", href: "/admin/events", count: events.count ?? 0 },
    { label: "Brands", href: "/admin/brands", count: brands.count ?? 0 },
    {
      label: "Press & Media Posts",
      href: "/admin/press-media",
      count: posts.count ?? 0,
    },
    {
      label: "Subscribers",
      href: "/admin/subscribers",
      count: subscribers.count ?? 0,
    },
  ];

  return (
    <div>
      <h1 className={ADMIN_H1_CLASS}>Dashboard</h1>
      <p className="mt-1 text-sm text-black/60">
        Everything the website publishes.
      </p>

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

      <a
        href={ADMIN_CRM_URL}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-black/10 p-5 transition-colors hover:border-black/25"
      >
        <span>
          <span className="block text-sm font-bold text-black">
            Leads &amp; CRM
          </span>
          <span className="mt-1 block text-sm text-black/60">
            Contact submissions and query forms are worked in the CRM, not here.
          </span>
        </span>
        <ExternalLink className="h-4 w-4 shrink-0 text-black/40" />
      </a>
    </div>
  );
}
