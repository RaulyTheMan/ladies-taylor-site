import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { eventsNav } from "@/lib/nav";
import { getEventBySlug, getEvents } from "@/lib/events";
import EventRegisterForm from "@/components/events/EventRegisterForm";

function formatRupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) return {};

  const description =
    event.description || `${event.title} — ${event.date}, ${event.location}.`;

  return {
    title: event.title,
    description,
    openGraph: {
      title: event.title,
      description,
      images: event.coverImageUrl ? [{ url: event.coverImageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description,
      images: event.coverImageUrl ? [event.coverImageUrl] : undefined,
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <>
      <SiteHeader items={eventsNav} />
      <main className="flex-1 px-4 pb-20 md:px-10">
        <section className="comic-border overflow-hidden rounded-squircle-lg bg-lt-cream">
          <div className="flex items-center gap-1.5 bg-lt-red px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-lt-yellow" />
            <span className="h-3 w-3 rounded-full bg-lt-blue" />
            <span className="h-3 w-3 rounded-full bg-lt-green" />
          </div>

          <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-2 md:gap-10 md:p-10">
            <div>
              <h1 className="font-sans text-4xl font-extrabold leading-none text-black md:text-5xl">
                {event.title}
              </h1>

              <ul className="mt-6 space-y-2 text-sm text-black/80">
                <li>{event.date}</li>
                <li>{event.time}</li>
                <li>{event.duration}</li>
                <li className="underline underline-offset-2">
                  {event.location}
                </li>
              </ul>

              {!event.isPlaceholder && (
                <p className="mt-6 text-3xl font-extrabold text-black">
                  {formatRupees(event.price)}
                </p>
              )}

              {!event.isPlaceholder && <EventRegisterForm slug={slug} />}
            </div>

            <div className="relative aspect-[4/3] rounded-squircle-sm bg-lt-gray">
              {event.coverImageUrl && (
                <Image
                  src={event.coverImageUrl}
                  alt=""
                  fill
                  className="rounded-squircle-sm object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              )}
            </div>
          </div>
        </section>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr] md:gap-10">
          <div>
            <h3 className="text-sm font-bold text-black">Hosted By</h3>
            <p className="mt-2 text-sm text-black/80">
              {event.hostedBy.name}
              <br />
              {event.hostedBy.role}
            </p>

            <h3 className="mt-8 text-sm font-bold text-black">Registered</h3>
            <p className="mt-2 text-sm text-black/80">
              <span className="font-bold">{event.registeredCount}</span>{" "}
              Registered,{" "}
              <span className="font-bold">{event.waitingCount}</span> Waiting
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-black">
              What you&apos;ll learn
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-black/80">
              {event.description}
            </p>

            {event.learnItems.length > 0 && (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-black/80">
                {event.learnItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <section className="relative left-1/2 right-1/2 -mx-[50vw] mt-12 w-screen bg-lt-blue px-6 py-16 text-center md:py-20">
          <h2 className="mx-auto max-w-4xl font-display text-3xl uppercase leading-none text-white sm:text-4xl md:text-5xl">
            Learn social media like how it&apos;s practiced not like what you
            see.
          </h2>
        </section>

        <section className="mt-12 pb-4">
          <h2 className="font-gothic text-3xl text-black">Location</h2>
          {event.location === "TBD" ? (
            <div className="mt-6 aspect-video rounded-squircle-lg bg-lt-gray" />
          ) : (
            <div className="mt-6 aspect-video overflow-hidden rounded-squircle-lg">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  event.location
                )}&output=embed`}
                loading="lazy"
                title={`Map showing ${event.location}`}
                className="h-full w-full border-0"
              />
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
