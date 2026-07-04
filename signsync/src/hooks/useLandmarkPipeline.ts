/**
 * useLandmarkPipeline
 * ────────────────────
 * Wires MediaPipe → LandmarkProcessor → FeatureGenerator every frame.
 *
 * Consumes the `lastFrame` from `useMediaPipe` and synchronously runs:
 *   1. landmarkProcessor.processHands()   — normalize landmarks
 *   2. featureGenerator.generateFeatureVector() — build ML vector
 *   3. Records processing time for the dev panel
 *
 * Returns the latest ProcessedHand[] and FeatureVector plus metadata
 * needed by the DevPanel.
 */

import { useEffect, useRef, useState } from "react";
import type { MediaPipeFrame }  from "@/hooks/useMediaPipe";
import { processHands, type ProcessedHand } from "@/lib/landmarkProcessor";
import {
  generateFeatureVector,
  assertFeatureLength,
  FEATURE_LENGTH,
  type FeatureVector,
} from "@/lib/featureGenerator";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PipelineStats {
  handCount:         number;
  totalLandmarks:    number;
  processingTimeMs:  number;
  featureLength:     number;
  maxConfidence:     number;   // highest handedness score (0-1); MP always returns 1.0
}

export interface PipelineResult {
  processedHands:  ProcessedHand[];
  featureVector:   FeatureVector;
  stats:           PipelineStats;
}

const EMPTY_VECTOR: FeatureVector = {
  data:         new Float32Array(FEATURE_LENGTH),
  length:       FEATURE_LENGTH,
  handsEncoded: 0,
  isZero:       true,
};

const EMPTY_STATS: PipelineStats = {
  handCount:        0,
  totalLandmarks:   0,
  processingTimeMs: 0,
  featureLength:    FEATURE_LENGTH,
  maxConfidence:    0,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLandmarkPipeline(
  lastFrame: MediaPipeFrame | null,
): PipelineResult {
  const [result, setResult] = useState<PipelineResult>({
    processedHands: [],
    featureVector:  EMPTY_VECTOR,
    stats:          EMPTY_STATS,
  });

  // Track the last frame we processed to avoid re-running on the same data
  const lastFrameRef = useRef<MediaPipeFrame | null>(null);

  useEffect(() => {
    // Skip if same frame reference (no new detection)
    if (!lastFrame || lastFrame === lastFrameRef.current) return;
    lastFrameRef.current = lastFrame;

    const t0 = performance.now();

    // ── 1. Normalize landmarks ───────────────────────────────────────────
    const processedHands = processHands(lastFrame.hands);

    // ── 2. Build feature vector ──────────────────────────────────────────
    const featureVector = generateFeatureVector(processedHands);

    // Invariant check (dev safety — no-op in prod if assertions removed)
    try { assertFeatureLength(featureVector); } catch (e) { console.error(e); }

    const processingTimeMs = performance.now() - t0;

    // ── 3. Build stats for DevPanel ──────────────────────────────────────
    const stats: PipelineStats = {
      handCount:        lastFrame.hand_count,
      totalLandmarks:   processedHands.reduce((s, h) => s + h.landmarks.length, 0),
      processingTimeMs: Math.round(processingTimeMs * 100) / 100,
      featureLength:    featureVector.length,
      // MediaPipe Tasks API always returns confidence=1.0 in handedness label;
      // use hand_count > 0 as a proxy (1.0 when detected, 0 otherwise)
      maxConfidence:    lastFrame.hand_count > 0 ? 1.0 : 0,
    };

    setResult({ processedHands, featureVector, stats });
  }, [lastFrame]);

  return result;
}
