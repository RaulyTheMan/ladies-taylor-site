import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import DesktopHeroGate from "@/components/desktop/DesktopHeroGate";
import MobileHero from "@/components/home/MobileHero";
import ServiceBand from "@/components/home/ServiceBand";
import OurWork from "@/components/home/OurWork";
import PositioningSection from "@/components/home/PositioningSection";
import ContactSection from "@/components/home/ContactSection";
import CtaBand from "@/components/home/CtaBand";
import { homeNav } from "@/lib/nav";
import { getDesktopWindows, getDesktopDockApps } from "@/lib/desktop";

export default async function Home() {
  const [windowDefs, dockApps] = await Promise.all([
    getDesktopWindows(),
    getDesktopDockApps(),
  ]);

  return (
    <>
      <main className="flex-1">
        <div className="md:hidden">
          <MobileHero />
        </div>
        <div
          className="relative hidden flex-col overflow-hidden bg-lt-yellow bg-[url('/images/bg/hill-sky.svg')] bg-bottom bg-no-repeat md:flex"
          style={{ height: "100vh", backgroundSize: "112% auto" }}
        >
          <h1 className="sr-only">
            Ladies Taylor — Branding, Packaging &amp; Social Media Management
          </h1>
          <NavBar items={homeNav} />
          <DesktopHeroGate windowDefs={windowDefs} dockApps={dockApps} />
        </div>
        <ServiceBand />
        <OurWork />
        <PositioningSection />
        <ContactSection />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
