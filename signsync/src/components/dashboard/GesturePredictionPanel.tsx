/**
 * GesturePredictionPanel
 * ───────────────────────
 * Displays the live gesture prediction output:
 *   - Predicted gesture label (large, prominent)
 *   - Confidence bar
 *   - Prediction latency and FPS
 *   - Model loading state
 *   - "No Hand Detected" graceful state
 *   - Per-class probability bars (collapsed by default)
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, Zap, Gauge, AlertCircle, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import type { GesturePrediction } from "@/hooks/useGesturePrediction";

interface GesturePredictionPanelProps {
  prediction:    GesturePrediction;
  sessionActive: boolean;
}

// Confidence → colour
function confidenceColor(c: number): string {
  if (c >= 0.85) return "bg-mint-400";
  if (c >= 0.65) return "bg-signal-400";
  return "bg-amber-400";
}

function confidenceLabel(c: number): string {
  if (c >= 0.85) return "High";
  if (c >= 0.65) return "Medium";
  return "Low";
}

export default function GesturePredictionPanel({
  prediction,
  sessionActive,
}: GesturePredictionPanelProps) {
  const [showProbs, setShowProbs] = useState(false);

  const {
    label, confidence, latencyMs, fps,
    modelLoaded, modelError, classes,
  } = prediction;

  // ── Idle state ────────────────────────────────────────────────────────────
  if (!sessionActive) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card variant="elevated" className="flex flex-col gap-4">
          <Header />
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl2 bg-beige-50 py-10 text-center">
            <Sparkles className="h-8 w-8 text-ink-300" />
            <p className="text-sm font-semibold text-ink-500">Start a session to see predictions</p>
          </div>
        </Card>
      </motion.div>
    );
  }

  // ── Model loading ─────────────────────────────────────────────────────────
  if (!modelLoaded && !modelError) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}>
        <Card variant="elevated" className="flex flex-col gap-4">
          <Header />
          <div className="flex flex-col items-center gap-3 rounded-xl2 bg-beige-50 py-10 text-center">
            <Loader2 className="h-7 w-7 animate-spin text-signal-500" />
            <p className="text-sm font-semibold text-ink-500">Loading gesture model…</p>
            <p className="text-xs text-ink-400">Make sure the backend is running</p>
          </div>
        </Card>
      </motion.div>
    );
  }

  // ── Model error ───────────────────────────────────────────────────────────
  if (modelError) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}>
        <Card variant="elevated" className="flex flex-col gap-4">
          <Header />
          <div className="flex flex-col items-center gap-3 rounded-xl2 bg-coral-500/5 px-4 py-8 text-center">
            <AlertCircle className="h-7 w-7 text-coral-500" />
            <p className="text-sm font-semibold text-coral-600">Model not available</p>
            <p className="text-xs leading-relaxed text-ink-500">{modelError}</p>
          </div>
        </Card>
      </motion.div>
    );
  }

  // ── Active prediction ─────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card variant="elevated" className="flex flex-col gap-5">
        <Header />

        {/* Main prediction display */}
        <div className="rounded-xl2 bg-gradient-to-br from-signal-50 to-beige-50 px-6 py-6 text-center">
          <AnimatePresence mode="wait">
            {label ? (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.18 }}
              >
                <p className="font-display text-4xl font-bold capitalize text-ink-900">
                  {label}
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${
                    confidence >= 0.85 ? "bg-mint-500" :
                    confidence >= 0.65 ? "bg-signal-500" : "bg-amber-500"
                  }`}>
                    {confidenceLabel(confidence)}
                  </span>
                  <span className="text-sm font-bold text-ink-700">
                    {(confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="font-display text-2xl font-semibold text-ink-300">
                  No Hand Detected
                </p>
                <p className="mt-1 text-xs text-ink-400">Show your hand to the camera</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confidence bar */}
          {label && (
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-ink-900/8">
              <motion.div
                className={`h-full rounded-full ${confidenceColor(confidence)}`}
                initial={{ width: 0 }}
                animate={{ width: `${confidence * 100}%` }}
                transition={{ duration: 0.25 }}
              />
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-ink-500">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-signal-500" />
            <span>{latencyMs > 0 ? `${latencyMs.toFixed(2)} ms` : "—"}</span>
          </div>
          <div className="h-3 w-px bg-ink-900/10" />
          <div className="flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-signal-500" />
            <span>{fps > 0 ? `${fps} FPS` : "—"}</span>
          </div>
          <div className="h-3 w-px bg-ink-900/10" />
          <span className="text-signal-600 font-medium">
            {classes.length} gestures
          </span>
        </div>

        {/* Per-class probability breakdown (collapsible) */}
        {label && classes.length > 0 && (
          <div>
            <button
              onClick={() => setShowProbs((p) => !p)}
              className="flex w-full items-center justify-between text-xs font-semibold text-ink-500 hover:text-ink-700 transition-colors"
            >
              <span>All class probabilities</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showProbs ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showProbs && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 flex flex-col gap-2">
                    {classes.map((cls) => {
                      return (
                        <div key={cls} className="flex items-center gap-3">
                          <span className="w-24 truncate text-right text-xs text-ink-600 capitalize">
                            {cls}
                          </span>
                          <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-ink-900/8">
                            <motion.div
                              className={`h-full rounded-full ${cls === label ? confidenceColor(confidence) : "bg-ink-300"}`}
                              animate={{ width: `${(cls === label ? confidence : 0) * 100}%` }}
                              transition={{ duration: 0.25 }}
                            />
                          </div>
                          <span className="w-9 text-right text-xs font-medium text-ink-500">
                            {cls === label ? `${(confidence * 100).toFixed(0)}%` : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function Header() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-signal-400 to-signal-600 text-white shadow-soft">
        <Sparkles className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-ink-900">Gesture prediction</h2>
        <p className="text-sm text-ink-500">Real-time Random Forest inference</p>
      </div>
    </div>
  );
}
