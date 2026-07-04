import { motion } from "framer-motion";
import { Camera, Brain, AudioWaveform, Shield, Globe, Users } from "lucide-react";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { features } from "@/data/dummyData";
import { FeatureItem } from "@/types";

const iconMap: Record<FeatureItem["icon"], typeof Camera> = {
  camera: Camera,
  brain: Brain,
  waveform: AudioWaveform,
  shield: Shield,
  globe: Globe,
  users: Users,
};

export default function Features() {
  return (
    <section id="features" className="bg-paper py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Badge tone="blue">Why SignSync</Badge>
          <h2 className="mt-4 text-balance text-3xl font-bold sm:text-4xl">
            Everything a real conversation needs
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-500">
            SignSync pairs computer vision with language understanding to
            keep both sides of a conversation clear, fast, and private.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon];
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <Card hoverLift className="h-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-signal-50 text-signal-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-ink-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
