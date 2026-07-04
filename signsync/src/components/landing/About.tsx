import { motion } from "framer-motion";
import { HeartHandshake, Sparkles } from "lucide-react";
import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";

export default function About() {
  return (
    <section id="about" className="bg-paper py-24">
      <Container className="grid items-center gap-14 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <Badge tone="coral">Our mission</Badge>
          <h2 className="mt-4 text-balance text-3xl font-bold sm:text-4xl">
            Built by a team that believes conversation shouldn't wait
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-500">
            SignSync started as a hackathon project after watching how often
            simple conversations were delayed by the lack of an interpreter
            in the room. We set out to build something that keeps up with a
            conversation as it happens, for classrooms, clinics, and daily
            life.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-ink-500">
            Today the team includes linguists, deaf and hard-of-hearing
            advisors, and machine learning engineers, all working from the
            same principle: technology should adapt to people, not the other
            way around.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid gap-5 sm:grid-cols-2"
        >
          <Card className="sm:col-span-2">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-signal-50 text-signal-600">
                <HeartHandshake className="h-5.5 w-5.5" />
              </div>
              <div>
                <h3 className="font-semibold text-ink-900">
                  Designed with the community
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                  Every feature is reviewed with deaf and hard-of-hearing
                  advisors before it ships.
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <p className="font-display text-3xl font-bold text-signal-600">12</p>
            <p className="mt-1 text-sm text-ink-500">Advisors and linguists</p>
          </Card>
          <Card>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-mint-500" />
              <p className="font-display text-3xl font-bold text-mint-500">
                2024
              </p>
            </div>
            <p className="mt-1 text-sm text-ink-500">Hackathon origin story</p>
          </Card>
        </motion.div>
      </Container>
    </section>
  );
}
