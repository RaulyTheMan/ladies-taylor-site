import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { homeNav } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Ladies Taylor collects, uses and stores the information you share through this site.",
};

// Grievance contact required under the DPDP Act. Update this if the public
// address changes — it is the only route people have to exercise their rights.
const PRIVACY_CONTACT = "hello@ladiestaylor.com";

const LAST_UPDATED = "19 August 2026";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-heading text-xl text-black md:text-2xl">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-black/75">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <div className="flex flex-1 flex-col bg-white">
        <SiteHeader items={homeNav} />

        <main className="flex-1 px-4 pb-20 md:px-10">
          <div className="mx-auto max-w-2xl pt-10">
            <h1 className="font-heading text-3xl text-black md:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-2 text-xs uppercase tracking-wide text-black/50">
              Last updated {LAST_UPDATED}
            </p>

            <p className="mt-6 text-sm leading-relaxed text-black/75">
              Ladies Taylor is a marketing studio based in Bengaluru, India.
              This policy explains what we collect when you use this website,
              why we collect it, who else can see it, and what you can ask us to
              do about it.
            </p>

            <Section title="What we collect">
              <p>We only collect information you actively give us:</p>
              <ul className="ml-4 list-disc space-y-1.5">
                <li>
                  <strong>Enquiry forms</strong> — your name, phone number and
                  email address. Our detailed enquiry form also asks for your
                  city, brand name, brand category, a description of your
                  brand and your budget range.
                </li>
                <li>
                  <strong>Event registrations</strong> — your name, phone,
                  email, and optionally your brand name, designation and reason
                  for attending.
                </li>
                <li>
                  <strong>Newsletter sign-ups</strong> — your email address.
                </li>
                <li>
                  <strong>WhatsApp replies</strong> — if you reply to our
                  WhatsApp message, we store your WhatsApp profile name, whether
                  you said you were interested, and any callback time you chose.
                </li>
                <li>
                  <strong>Livestream comments</strong> — the display name and
                  message you post, plus a random identifier stored in your
                  browser so you can manage your own comments.
                </li>
              </ul>
              <p>
                We do not ask for or store payment details, identity documents,
                or any special category data through this website.
              </p>
            </Section>

            <Section title="Why we use it">
              <p>
                To reply to your enquiry, register you for events, send you the
                newsletter you asked for, and understand which of our marketing
                campaigns actually reach the right people. We do not sell your
                information, and we do not share it with anyone for their own
                marketing.
              </p>
            </Section>

            <Section title="Cookies and tracking">
              <p>Three things run on this site:</p>
              <ul className="ml-4 list-disc space-y-1.5">
                <li>
                  <strong>Meta (Facebook) Pixel</strong> — sets cookies named{" "}
                  <code className="rounded bg-black/5 px-1">_fbp</code> and{" "}
                  <code className="rounded bg-black/5 px-1">_fbc</code> to
                  measure whether our ads lead to real enquiries. If you submit a
                  form, we also send Meta a copy of that event from our server,
                  including your email and phone in an irreversibly scrambled
                  (hashed) form so Meta can match it without us handing over the
                  plain details. If you later become a client, we may tell Meta
                  that the enquiry was worthwhile — again using only hashed
                  identifiers.
                </li>
                <li>
                  <strong>Vercel Analytics</strong> — counts page views and
                  visits. It sets no cookies and does not identify you.
                </li>
                <li>
                  <strong>Login cookies</strong> — only used by our own team on
                  the admin area. These are essential for keeping a session
                  signed in.
                </li>
              </ul>
              <p>
                You can block the Meta Pixel with a browser-level ad or tracker
                blocker, or by adjusting your Facebook and Instagram ad settings.
                Doing so does not stop you from using this site or submitting an
                enquiry.
              </p>
            </Section>

            <Section title="Who else can see it">
              <p>
                We use a small number of service providers to actually run
                things. They process your information on our behalf, under their
                own security commitments:
              </p>
              <ul className="ml-4 list-disc space-y-1.5">
                <li>
                  <strong>Supabase</strong> — stores enquiries and our team
                  logins.
                </li>
                <li>
                  <strong>Vercel</strong> — hosts this website and provides the
                  visit analytics.
                </li>
                <li>
                  <strong>Meta Platforms</strong> — ad measurement, and the
                  WhatsApp Business messages we send you.
                </li>
                <li>
                  <strong>Resend</strong> — delivers the internal email that
                  alerts us to a new enquiry.
                </li>
              </ul>
              <p>
                Some of these providers operate servers outside India, so your
                information may be processed abroad.
              </p>
            </Section>

            <Section title="How long we keep it">
              <p>
                Enquiries stay in our system while we are in conversation with
                you and for a reasonable period afterwards, so we have context if
                you come back to us. Newsletter sign-ups are kept until you
                unsubscribe. You can ask us to delete your information sooner at
                any time.
              </p>
            </Section>

            <Section title="Your rights">
              <p>
                Under India&apos;s Digital Personal Data Protection Act, 2023,
                you can ask us what we hold about you, ask us to correct it, ask
                us to delete it, and raise a grievance about how we have handled
                it. If you are in the UK or the European Economic Area, the UK
                GDPR and GDPR give you equivalent rights, including the right to
                complain to your local supervisory authority.
              </p>
              <p>
                To exercise any of these, email{" "}
                <a
                  className="font-semibold text-black underline underline-offset-2"
                  href={`mailto:${PRIVACY_CONTACT}`}
                >
                  {PRIVACY_CONTACT}
                </a>
                . We will respond as quickly as we reasonably can.
              </p>
            </Section>

            <Section title="Children">
              <p>
                This site is meant for businesses and the people who run them.
                We do not knowingly collect information from children. If you
                believe a child has sent us their details, contact us and we will
                remove it.
              </p>
            </Section>

            <Section title="Changes to this policy">
              <p>
                If we start collecting something new or add another service
                provider, we will update this page and change the date at the
                top.
              </p>
            </Section>

            <div className="mt-12 border-t border-black/10 pt-6">
              <Link
                href="/"
                prefetch={false}
                className="text-xs font-bold uppercase tracking-wide text-black/60 hover:text-black"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
