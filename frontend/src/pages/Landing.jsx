import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Problem from "@/components/landing/Problem";
import Research from "@/components/landing/Research";
import Solution from "@/components/landing/Solution";
import Features from "@/components/landing/Features";
import Personalization from "@/components/landing/Personalization";
import MiniDemo from "@/components/landing/MiniDemo";
import Trust from "@/components/landing/Trust";
import Waitlist from "@/components/landing/Waitlist";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import ScrollProgress from "@/components/landing/ScrollProgress";
import MobileCTA from "@/components/landing/MobileCTA";

export default function Landing() {
  return (
    <div
      className="min-h-screen w-full overflow-x-hidden bg-[#05070D] text-white font-body"
      data-testid="landing-page"
    >
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Research />
        <Solution />
        <Features />
        <Personalization />
        <MiniDemo />
        <Trust />
        <Waitlist />
        <FAQ />
      </main>
      <Footer />
      <MobileCTA />
    </div>
  );
}
