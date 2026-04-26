// Server Component — no "use client" needed here.
// Client-only toast handling is isolated in PageShell.
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import SupportedFormats from "@/components/SupportedFormats";
import Features from "@/components/Features";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import PageShell from "@/components/PageShell";

export default function Home() {
  return (
    <PageShell>
      <Navbar />
      <Hero />
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <SupportedFormats />
      <Features />
      <div id="faq">
        <FAQ />
      </div>
      <Footer />
      <BackToTop />
    </PageShell>
  );
}
