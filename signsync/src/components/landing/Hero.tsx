import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, PlayCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Container from "@/components/ui/Container";

const nodes = [
  { id: "n1", x: 60, y: 90, delay: 0 },
  { id: "n2", x: 140, y: 40, delay: 0.1 },
  { id: "n3", x: 220, y: 90, delay: 0.2 },
  { id: "n4", x: 95, y: 190, delay: 0.3 },
  { id: "n5", x: 185, y: 190, delay: 0.4 },
  { id: "n6", x: 140, y: 240, delay: 0.5 },
];

const edges = [
  ["n1", "n2"],
  ["n2", "n3"],
  ["n1", "n4"],
  ["n3", "n5"],
  ["n4", "n6"],
  ["n5", "n6"],
];

const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

const captions = ["Hello", "How are you?", "Nice to meet you"];

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-signal-900 via-signal-800 to-ink-900 pb-20 pt-32 text-white sm:pb-28 sm:pt-40">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(76,141,255,0.35), transparent 40%), radial-gradient(circle at 80% 0%, rgba(76,217,176,0.2), transparent 35%)",
        }}
      />

      <Container className="relative grid items-center gap-16 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Badge tone="mint" className="bg-white/10 text-mint-400">
            Real-time AI translation
          </Badge>

          <h1 className="mt-6 max-w-xl text-balance font-display text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl">
            Sign language, understood the moment it happens.
          </h1>

          <p className="mt-6 max-w-lg text-balance text-lg leading-relaxed text-signal-100/90">
            SignSync watches, listens, and translates between sign language
            and spoken language instantly, so conversations flow both ways
            without a translator in the room.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              size="lg"
              className="bg-white text-signal-700 hover:bg-signal-50"
              onClick={() => navigate("/register")}
            >
              Start free
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg">
              <PlayCircle className="h-5 w-5" />
              Watch demo
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-signal-100/80">
            <div>
              <p className="font-display text-2xl font-bold text-white">40K+</p>
              <p>Conversations translated</p>
            </div>
            <div className="h-10 w-px bg-white/15" />
            <div>
              <p className="font-display text-2xl font-bold text-white">96%</p>
              <p>Recognition accuracy</p>
            </div>
            <div className="h-10 w-px bg-white/15" />
            <div>
              <p className="font-display text-2xl font-bold text-white">3</p>
              <p>Sign languages supported</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="relative mx-auto w-full max-w-md animate-floaty"
        >
          <div className="rounded-xl3 border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-mint-400" />
                <span className="text-sm font-semibold text-white/80">
                  Live tracking
                </span>
              </div>
              <span className="text-xs text-white/50">Camera 1</span>
            </div>

            <svg
              viewBox="0 0 280 280"
              className="mx-auto mt-4 h-64 w-64"
              role="img"
              aria-label="Animated illustration of hand landmark points connecting to represent gesture tracking"
            >
              {edges.map(([from, to], index) => {
                const a = nodeMap[from];
                const b = nodeMap[to];
                return (
                  <line
                    key={`${from}-${to}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth={2}
                    strokeDasharray={140}
                    strokeDashoffset={140}
                    className="animate-dashMove"
                    style={{ animationDelay: `${index * 0.12 + 0.2}s` }}
                  />
                );
              })}
              {nodes.map((node) => (
                <circle
                  key={node.id}
                  cx={node.x}
                  cy={node.y}
                  r={7}
                  fill="#4CD9B0"
                  className="animate-pulseLine"
                  style={{ animationDelay: `${node.delay}s` }}
                />
              ))}
            </svg>

            <div className="mt-4 flex flex-col gap-2">
              {captions.map((caption, index) => (
                <motion.div
                  key={caption}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.25, duration: 0.4 }}
                  className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white"
                >
                  {caption}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
