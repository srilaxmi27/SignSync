import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import { howItWorksSteps } from "@/data/dummyData";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24">
      <Container>
        <SectionTitle
          badge="Simple by design"
          badgeTone="mint"
          heading="From sign to speech in four steps"
          subtext="No setup wizard, no dedicated hardware. Open SignSync and start signing."
          align="center"
        />

        <div className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Desktop connector dashes */}
          <div className="absolute left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] top-6 hidden h-px border-t-2 border-dashed border-signal-200 lg:block" />

          {howItWorksSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative flex flex-col items-start group"
            >
              <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-signal-500 to-signal-600 font-display text-lg font-bold text-white shadow-glow-signal transition-shadow duration-300 group-hover:shadow-lg">
                {step.order}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
