import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, CameraOff, Maximize2, Mic } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { SessionStatus } from "@/types";

const statusLabels: Record<SessionStatus, string> = {
  idle: "Camera off",
  listening: "Watching for signs",
  translating: "Translating",
};

export default function CameraPanel() {
  const [status, setStatus] = useState<SessionStatus>("idle");

  const isActive = status !== "idle";

  const toggleCamera = () => {
    setStatus((prev) => (prev === "idle" ? "listening" : "idle"));
  };

  return (
    <Card id="camera" className="flex flex-col gap-5" padded>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink-900">Live translation</h2>
          <p className="text-sm text-ink-500">Point your camera and start signing</p>
        </div>
        <Badge tone={isActive ? "mint" : "neutral"}>
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isActive ? "bg-mint-500 animate-pulseLine" : "bg-ink-400"
            }`}
          />
          {statusLabels[status]}
        </Badge>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl2 bg-ink-900">
        {isActive ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-signal-900 via-ink-900 to-ink-900"
          >
            <div className="flex flex-col items-center gap-3 text-white/80">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-mint-400/40">
                <div className="absolute h-20 w-20 animate-ping rounded-full border-2 border-mint-400/30" />
                <Camera className="h-8 w-8 text-mint-400" />
              </div>
              <p className="text-sm font-medium">Tracking hand movement…</p>
            </div>
          </motion.div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/50">
            <CameraOff className="h-10 w-10" />
            <p className="text-sm font-medium">Camera is currently off</p>
          </div>
        )}

        <button
          className="absolute right-3 top-3 rounded-lg bg-black/30 p-2 text-white/80 backdrop-blur-sm hover:text-white"
          aria-label="Expand camera view"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant={isActive ? "secondary" : "primary"}
          fullWidth
          onClick={toggleCamera}
        >
          {isActive ? (
            <>
              <CameraOff className="h-5 w-5" />
              Stop session
            </>
          ) : (
            <>
              <Camera className="h-5 w-5" />
              Start session
            </>
          )}
        </Button>
        <Button variant="secondary" fullWidth disabled={!isActive}>
          <Mic className="h-5 w-5" />
          Enable voice reply
        </Button>
      </div>
    </Card>
  );
}
