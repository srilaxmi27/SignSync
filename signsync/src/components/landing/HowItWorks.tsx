import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import { howItWorksSteps } from "@/data/dummyData";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Badge tone="mint">Simple by design</Badge>
          <h2 className="mt-4 text-balance text-3xl font-bold sm:text-4xl">
            From sign to speech in four steps
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-500">
            No setup wizard, no dedicated hardware. Open SignSync and start
            signing.
          </p>
        </div>

        <div className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-ink-900/10 lg:block" />
          {howItWorksSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative flex flex-col items-start"
            >
              <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-signal-500 font-display text-lg font-bold text-white shadow-soft">
                {step.order}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
