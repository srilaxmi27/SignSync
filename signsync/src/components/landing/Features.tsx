import { motion } from "framer-motion";
import { Camera, Brain, AudioWaveform, Shield, Globe, Users } from "lucide-react";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import { features } from "@/data/dummyData";
import { FeatureItem } from "@/types";

const iconMap: Record<FeatureItem["icon"], typeof Camera> = {
  camera:   Camera,
  brain:    Brain,
  waveform: AudioWaveform,
  shield:   Shield,
  globe:    Globe,
  users:    Users,
};

// Unique gradient per feature (green palette)
const iconGradients = [
  "from-signal-400 to-signal-600",
  "from-signal-500 to-signal-700",
  "from-mint-400 to-signal-500",
  "from-signal-300 to-signal-500",
  "from-signal-600 to-signal-800",
  "from-mint-400 to-mint-500",
];

export default function Features() {
  return (
    <section id="features" className="bg-gradient-to-b from-beige-50 to-paper py-24">
      <Container>
        <SectionTitle
          badge="Why SignSync"
          badgeTone="green"
          heading="Everything a real conversation needs"
          subtext="SignSync pairs computer vision with language understanding to keep both sides of a conversation clear, fast, and private."
          align="center"
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon];
            const gradient = iconGradients[index % iconGradients.length];
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <Card variant="elevated" interactive className="h-full">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-soft`}
                  >
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
