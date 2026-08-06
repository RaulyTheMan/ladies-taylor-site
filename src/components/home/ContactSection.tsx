import ContactFormCard from "./ContactFormCard";

// The single always-rendered "Get in touch" anchor target on the site —
// every Contact/Enquire link across the app points at
// `/#feed-get-in-touch`. The mobile grid's own contact card (inside
// PostFeed) is a nice interactive extra, but it only exists in the DOM
// after a tap, so it can't be the thing anchor links rely on.
export default function ContactSection() {
  return (
    <section
      id="feed-get-in-touch"
      className="bg-lt-yellow px-6 py-16 md:py-20"
    >
      <div className="mx-auto max-w-md">
        <ContactFormCard />
      </div>
    </section>
  );
}
