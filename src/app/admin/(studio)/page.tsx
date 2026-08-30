import Link from "next/link";
import { ExternalLink, ArrowRight } from "lucide-react";
import { createSessionClient } from "@/lib/supabase/server";
import { STUDIO_CRM_URL } from "@/lib/studio/nav";
import { cn } from "@/lib/ui/cn";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import { Heading, Text } from "@/components/ui/Text";
import { FOCUS_RING } from "@/components/ui/focus";

export const dynamic = "force-dynamic";

export default async function StudioDashboardPage() {
  const supabase = await createSessionClient();

  const [events, brands, posts, windows, subscribers] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("brands").select("*", { count: "exact", head: true }),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("desktop_windows").select("*", { count: "exact", head: true }),
    supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true }),
  ]);

  const cards = [
    { label: "Desktop windows", href: "/admin/desktop", count: windows.count },
    { label: "Press & media posts", href: "/admin/press-media", count: posts.count },
    { label: "Brands", href: "/admin/brands", count: brands.count },
    { label: "Events", href: "/admin/events", count: events.count },
    { label: "Subscribers", href: "/admin/subscribers", count: subscribers.count },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Dashboard"
        description="Everything the website publishes."
      />

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={cn(
              "group rounded-admin-lg border border-admin-border bg-admin-bg p-4 transition-colors hover:border-admin-border-strong hover:bg-admin-surface",
              FOCUS_RING
            )}
          >
            <p className="text-2xl font-semibold tabular-nums text-admin-fg">
              {card.count ?? "—"}
            </p>
            <p className="mt-0.5 text-xs text-admin-muted">{card.label}</p>
          </Link>
        ))}
      </div>

      <Card className="mt-3 flex items-center justify-between gap-4 p-4">
        <div>
          <Heading level={3}>Leads &amp; CRM</Heading>
          <Text muted className="mt-0.5">
            Contact submissions and query forms are worked in the CRM, not here.
          </Text>
        </div>
        <a
          href={STUDIO_CRM_URL}
          target="_blank"
          rel="noreferrer noopener"
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-admin-md border border-admin-border-strong px-2.5 py-1.5 text-[13px] font-medium text-admin-fg transition-colors hover:bg-admin-surface-hover",
            FOCUS_RING
          )}
        >
          Open CRM
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </Card>

      <Card className="mt-3 flex items-center gap-2 p-4">
        <ArrowRight className="h-4 w-4 shrink-0 text-admin-muted" aria-hidden="true" />
        <Text muted>
          Press{" "}
          <kbd className="rounded-admin-sm border border-admin-border bg-admin-surface px-1 font-sans text-[11px] text-admin-fg">
            ⌘K
          </kbd>{" "}
          anywhere to jump to a section or create something.
        </Text>
      </Card>
    </div>
  );
}
