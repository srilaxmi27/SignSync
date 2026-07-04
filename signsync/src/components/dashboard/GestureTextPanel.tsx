/**
 * GestureTextPanel
 * ─────────────────
 * Displays:
 *   • Detected gesture label
 *   • Confidence score
 *   • Generated sentence (from gesture mapping)
 *   • "No gesture detected" when nothing is recognised
 *
 * Consumes useGestureText output — no prediction logic here.
 */

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareText, HandMetal, Volume2, VolumeX } from "lucide-react";
import Card from "@/components/ui/Card";
import type { GestureTextResult } from "@/hooks/useGestureText";
import type { GesturePrediction }  from "@/hooks/useGesturePrediction";

interface GestureTextPanelProps {
  gestureText:  GestureTextResult;
  prediction:   GesturePrediction;
  sessionActive: boolean;
}

const categoryColors: Record<string, string> = {
  greeting:    "bg-signal-50 text-signal-700 border-signal-200",
  affirmation: "bg-mint-400/10 text-mint-600 border-mint-400/20",
  need:        "bg-amber-50 text-amber-700 border-amber-200",
  emergency:   "bg-red-50 text-red-700 border-red-200",
  general:     "bg-beige-100 text-ink-600 border-ink-900/10",
};

export default function GestureTextPanel({
  gestureText,
  prediction,
  sessionActive,
}: GestureTextPanelProps) {
  const { sentenceResult, currentLabel, isActive, isMuted, setIsMuted, language, setLanguage } = gestureText;
  const { confidence } = prediction;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
    >
      <Card variant="elevated" className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-signal-300 to-signal-500 text-white shadow-soft">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink-900">Translation</h2>
              <p className="text-sm text-ink-500">Gesture to sentence</p>
            </div>
          </div>

          {sessionActive && (
            <div className="flex items-center gap-2">
              {/* Language Selector Pill */}
              <div className="flex rounded-lg bg-beige-100 p-0.5 border border-ink-900/5">
                {(["en", "te", "hi"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`rounded-md px-2 py-0.5 text-xs font-bold transition-all ${
                      language === lang
                        ? "bg-white text-signal-700 shadow-soft"
                        : "text-ink-500 hover:text-ink-900"
                    }`}
                  >
                    {lang === "en" ? "EN" : lang === "te" ? "తె" : "हि"}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`rounded-xl p-2 transition-all ${
                  isMuted
                    ? "bg-coral-500/10 text-coral-500 hover:bg-coral-500/15"
                    : "bg-mint-500/10 text-mint-600 hover:bg-mint-500/15"
                }`}
                title={isMuted ? "Unmute TTS speech" : "Mute TTS speech"}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            </div>
          )}
        </div>

        {/* Main content */}
        <AnimatePresence mode="wait">
          {!sessionActive ? (
            /* Session not started */
            <motion.div
              key="idle"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 rounded-xl2 bg-beige-50 py-10 text-center"
            >
              <HandMetal className="h-8 w-8 text-ink-300" />
              <p className="text-sm font-semibold text-ink-400">
                Start a session to begin translating
              </p>
            </motion.div>

          ) : !isActive ? (
            /* No gesture detected */
            <motion.div
              key="none"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-2 rounded-xl2 bg-beige-50 py-8 text-center"
            >
              <p className="text-base font-semibold text-ink-400">No gesture detected</p>
              <p className="text-xs text-ink-300">Show your hand and sign clearly</p>
            </motion.div>

          ) : sentenceResult ? (
            /* Active gesture with sentence */
            <motion.div
              key={currentLabel}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col gap-4"
            >
              {/* Gesture label row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{sentenceResult.emoji}</span>
                  <span className="font-display text-xl font-bold capitalize text-ink-900">
                    {currentLabel}
                  </span>
                </div>
                {/* Confidence badge */}
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  confidence >= 0.85
                    ? "border-mint-400/20 bg-mint-400/10 text-mint-600"
                    : confidence >= 0.65
                    ? "border-signal-200 bg-signal-50 text-signal-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}>
                  {(confidence * 100).toFixed(0)}%
                </span>
              </div>

              {/* Generated sentence */}
              <div className={`rounded-xl2 border px-5 py-4 ${
                categoryColors[sentenceResult.category] ?? categoryColors.general
              }`}>
                <p className="text-lg font-semibold leading-snug">
                  {language === "te" ? sentenceResult.sentence_te :
                   language === "hi" ? sentenceResult.sentence_hi :
                   sentenceResult.sentence}
                </p>
                {!sentenceResult.isMapped && (
                  <p className="mt-1 text-xs opacity-60">
                    No mapping configured — showing default text
                  </p>
                )}
              </div>

              {/* Category chip */}
              <p className="text-xs capitalize text-ink-400">
                Category: {sentenceResult.category}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
