import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, CameraOff, Maximize2, Mic } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { SessionStatus } from "@/types";

const statusMap: Record<SessionStatus, { status: "live" | "idle"; label: string }> = {
  idle:        { status: "idle", label: "Camera off" },
  listening:   { status: "live", label: "Watching for signs" },
  translating: { status: "live", label: "Translating" },
};

export default function CameraPanel() {
  const [status, setStatus] = useState<SessionStatus>("idle");
  const isActive = status !== "idle";

  const toggleCamera = () => {
    setStatus((prev) => (prev === "idle" ? "listening" : "idle"));
  };

  const badge = statusMap[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card id="camera" variant="elevated" className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink-900">Live translation</h2>
            <p className="text-sm text-ink-500">Point your camera and start signing</p>
          </div>
          <StatusBadge status={badge.status} label={badge.label} pulse={isActive} />
        </div>

        {/* Viewport */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl2 bg-signal-900">
          <AnimatePresence mode="wait">
            {isActive ? (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-signal-900 via-signal-800 to-ink-900"
              >
                {/* Scanning line */}
                <motion.div
                  className="absolute left-0 right-0 h-px bg-mint-400/30"
                  animate={{ top: ["20%", "80%", "20%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="flex flex-col items-center gap-3 text-white/80">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-mint-400/40">
                    <motion.div
                      className="absolute h-24 w-24 rounded-full border-2 border-mint-400/20"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <Camera className="h-8 w-8 text-mint-400" />
                  </div>
                  <p className="text-sm font-medium">Tracking hand movement…</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                  <CameraOff className="h-8 w-8 text-white/30" />
                </div>
                <p className="text-sm font-medium text-white/40">Camera is currently off</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            className="absolute right-3 top-3 rounded-lg bg-black/30 p-2 text-white/70 backdrop-blur-sm hover:text-white transition-colors"
            aria-label="Expand camera view"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant={isActive ? "secondary" : "primary"}
            fullWidth
            onClick={toggleCamera}
            leftIcon={isActive ? <CameraOff className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
          >
            {isActive ? "Stop session" : "Start session"}
          </Button>
          <Button
            variant="secondary"
            fullWidth
            disabled={!isActive}
            leftIcon={<Mic className="h-5 w-5" />}
          >
            Enable voice reply
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
