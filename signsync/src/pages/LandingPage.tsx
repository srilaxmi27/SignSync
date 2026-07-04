import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import About from "@/components/landing/About";
import CTA from "@/components/landing/CTA";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <About />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
