import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import ListingHero from "@/components/ListingHero";
import { StaggerGrid, StaggerItem } from "@/components/StaggerGrid";
import { eventsNav } from "@/lib/nav";
import { getEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: "Ev*nts",
  description:
    "Workshops, meetups and sessions hosted by Ladies Taylor — see what's coming up and grab a spot.",
};

function formatRupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <div className="flex flex-1 flex-col bg-white">
        <SiteHeader items={eventsNav} />
        <main className="flex-1 px-4 pb-20 md:px-10">
          <ListingHero thin="Our" thick="EV*NTS" variant="sans" />

          <StaggerGrid className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <StaggerItem key={event.slug}>
                <Link
                  href={`/events/${event.slug}`}
                  className={`block rounded-squircle-md bg-white p-4 ${
                    event.isPlaceholder
                      ? "border-2 border-dashed border-black/20"
                      : "comic-border-sm"
                  }`}
                >
                  <div className="relative aspect-[4/3] rounded-squircle-sm bg-lt-gray">
                    {event.coverImageUrl && (
                      <Image
                        src={event.coverImageUrl}
                        alt=""
                        fill
                        className="rounded-squircle-sm object-cover"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    )}
                    {event.isPlaceholder && (
                      <span className="absolute right-2 top-2 rounded-squircle-sm bg-black/50 px-2 py-1 text-micro font-bold uppercase tracking-wide text-white">
                        Coming soon
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm font-bold text-black">
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs text-black/60">{event.date}</p>
                  {!event.isPlaceholder && (
                    <p className="mt-2 text-sm font-bold text-black">
                      {formatRupees(event.price)}
                    </p>
                  )}
                </Link>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </main>
      </div>
      <Footer />
    </>
  );
}
