/**
 * useGestureText
 * ──────────────
 * Consumes a GesturePrediction and produces a stable, flicker-free
 * SentenceResult.
 *
 * Anti-flicker rules:
 *   1. A new sentence is accepted only when a gesture has held for
 *      MIN_STABLE_FRAMES consecutive frames with confidence ≥ threshold.
 *   2. If confidence drops temporarily (no hand, low confidence) the
 *      last valid sentence is kept until NULL_HOLD_FRAMES nulls in a row.
 *   3. Sentence only updates when the LABEL actually changes — same gesture
 *      repeated does not re-trigger animation.
 */

import { useEffect, useRef, useState } from "react";
import type { GesturePrediction } from "@/hooks/useGesturePrediction";
import { generateSentence, type SentenceResult } from "@/lib/sentenceGenerator";

export interface GestureTextResult {
  sentenceResult:  SentenceResult | null;
  currentLabel:    string | null;
  isActive:        boolean;   // true when a valid gesture is currently held
}

// How many consecutive frames a gesture must hold before the sentence updates
const MIN_STABLE_FRAMES = 5;
// How many consecutive null frames before we clear the current sentence
const NULL_HOLD_FRAMES  = 20;

export function useGestureText(
  prediction: GesturePrediction,
  confidenceThreshold = 0.55,
): GestureTextResult {
  const stableCountRef = useRef(0);
  const nullCountRef   = useRef(0);
  const pendingLabel   = useRef<string | null>(null);

  const [currentLabel,   setCurrentLabel]   = useState<string | null>(null);
  const [sentenceResult, setSentenceResult] = useState<SentenceResult | null>(null);

  useEffect(() => {
    const { label, confidence } = prediction;

    const validPrediction =
      label !== null && confidence >= confidenceThreshold;

    if (validPrediction) {
      nullCountRef.current = 0;  // reset null counter

      if (label === pendingLabel.current) {
        stableCountRef.current += 1;
      } else {
        // New label — reset stability counter
        pendingLabel.current   = label;
        stableCountRef.current = 1;
      }

      // Commit only once stable enough
      if (stableCountRef.current >= MIN_STABLE_FRAMES && label !== currentLabel) {
        setCurrentLabel(label);
        setSentenceResult(generateSentence(label));
      }
    } else {
      // No valid prediction this frame
      stableCountRef.current = 0;
      pendingLabel.current   = null;
      nullCountRef.current  += 1;

      // Clear after enough consecutive nulls
      if (nullCountRef.current >= NULL_HOLD_FRAMES) {
        setCurrentLabel(null);
        setSentenceResult(null);
      }
    }
  }, [prediction, confidenceThreshold, currentLabel]);

  return {
    sentenceResult,
    currentLabel,
    isActive: currentLabel !== null,
  };
}
