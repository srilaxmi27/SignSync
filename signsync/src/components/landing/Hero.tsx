import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Container from "@/components/ui/Container";

const nodes = [
  { id: "n1", x: 60,  y: 90,  delay: 0 },
  { id: "n2", x: 140, y: 40,  delay: 0.1 },
  { id: "n3", x: 220, y: 90,  delay: 0.2 },
  { id: "n4", x: 95,  y: 190, delay: 0.3 },
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
    <section
      className="relative overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40"
      style={{ backgroundColor: "#B1D3B9" }}
    >
      {/* Subtle radial depth overlays */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 10% 0%, rgba(255,255,255,0.45), transparent 50%), radial-gradient(ellipse at 90% 100%, rgba(64,145,108,0.18), transparent 55%)",
        }}
      />
      {/* Fine dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle, #2D6A4F 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <Container className="relative grid items-center gap-16 lg:grid-cols-2">
        {/* ── Left column ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Badge tone="blue" className="border border-signal-600/20 bg-signal-600/10 text-signal-700">
            Real-time AI translation
          </Badge>

          <h1 className="mt-6 max-w-xl text-balance font-display text-4xl font-bold leading-[1.1] text-ink-900 sm:text-5xl lg:text-6xl">
            Sign language,{" "}
            <span className="gradient-text-green">understood the moment</span>
            {" "}it happens.
          </h1>

          <p className="mt-6 max-w-lg text-balance text-lg leading-relaxed text-ink-700">
            SignSync watches, listens, and translates between sign language
            and spoken language instantly — so conversations flow both ways
            without a translator in the room.
          </p>

          {/* CTA buttons */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/register")}
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Start free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-ink-900/25 bg-white/40 text-ink-800 hover:bg-white/60"
            >
              Watch demo
            </Button>
          </div>

          {/* SOS Emergency Button */}
          <div className="mt-6">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="inline-flex items-center gap-2.5 rounded-2xl px-6 py-3 text-base font-bold text-white shadow-soft transition-colors"
              style={{ backgroundColor: "#E8000D" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#C0000B")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#E8000D")}
              aria-label="SOS Emergency — call for immediate sign language assistance"
            >
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
              </span>
              <Phone className="h-5 w-5" />
              SOS — Emergency Assist
            </motion.button>
            <p className="mt-1.5 text-xs text-ink-600">
              Immediate sign-language emergency relay
            </p>
          </div>

          {/* Stats row */}
          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-ink-600">
            <div>
              <p className="font-display text-2xl font-bold text-ink-900">40K+</p>
              <p>Conversations translated</p>
            </div>
            <div className="h-10 w-px bg-ink-900/15" />
            <div>
              <p className="font-display text-2xl font-bold text-ink-900">96%</p>
              <p>Recognition accuracy</p>
            </div>
            <div className="h-10 w-px bg-ink-900/15" />
            <div>
              <p className="font-display text-2xl font-bold text-ink-900">3</p>
              <p>Sign languages</p>
            </div>
          </div>
        </motion.div>

        {/* ── Right column — floating demo card ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="relative mx-auto w-full max-w-md animate-floaty"
        >
          <div className="rounded-xl3 border border-white/60 bg-white/50 p-6 shadow-elevated backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-signal-500" />
                <span className="text-sm font-semibold text-ink-700">Live tracking</span>
              </div>
              <span className="rounded-full bg-ink-900/8 px-2.5 py-0.5 text-xs text-ink-500">
                Camera 1
              </span>
            </div>

            <svg
              viewBox="0 0 280 280"
              className="mx-auto mt-4 h-64 w-64"
              role="img"
              aria-label="Animated hand landmark tracking illustration"
            >
              {edges.map(([from, to], index) => {
                const a = nodeMap[from];
                const b = nodeMap[to];
                return (
                  <line
                    key={`${from}-${to}`}
                    x1={a.x} y1={a.y}
                    x2={b.x} y2={b.y}
                    stroke="rgba(45,106,79,0.40)"
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
                  cx={node.x} cy={node.y}
                  r={7}
                  fill="#40916C"
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
                  className="rounded-xl bg-signal-600/10 px-4 py-2.5 text-sm font-medium text-ink-800"
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
