/**
 * useGesturePrediction — Prediction Controller
 * ─────────────────────────────────────────────
 * Orchestrates:
 *   ModelLoader  → load RF model from backend once
 *   PredictionService → run inference on each feature vector
 *   PredictionSmoother → stabilise output with sliding-window majority vote
 *
 * Consumes the FeatureVector from useLandmarkPipeline (already normalised).
 * Returns a stable, smooth gesture prediction updated every frame.
 *
 * Usage:
 *   const pred = useGesturePrediction(featureVector, { threshold: 0.6 });
 *   pred.label        // "hello" | "food" | … | null
 *   pred.confidence   // 0-1
 *   pred.latencyMs    // raw inference time
 *   pred.fps          // prediction FPS
 *   pred.modelLoaded  // true once model is ready
 *   pred.error        // string if model failed to load
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { loadModel, type RFModel }    from "@/lib/modelLoader";
import { predict }                    from "@/lib/predictionService";
import { PredictionSmoother }         from "@/lib/predictionSmoother";
import type { FeatureVector }         from "@/lib/featureGenerator";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GesturePrediction {
  label:       string | null;
  confidence:  number;
  latencyMs:   number;
  fps:         number;
  modelLoaded: boolean;
  modelError:  string | null;
  classes:     string[];
}

interface PredictionOptions {
  /** Minimum confidence to accept a prediction (0-1, default 0.55). */
  threshold?:   number;
  /** Smoothing window size in frames (default 10). */
  windowSize?:  number;
  /** Re-check backend for a new model every N ms (default 60 000 = 1 min). */
  reloadMs?:    number;
}

// ─── FPS tracker ─────────────────────────────────────────────────────────────

class FpsTracker {
  private times: number[] = [];
  tick(): number {
    const now = performance.now();
    this.times.push(now);
    if (this.times.length > 30) this.times.shift();
    if (this.times.length < 2)  return 0;
    const elapsed = this.times[this.times.length - 1] - this.times[0];
    return elapsed > 0 ? ((this.times.length - 1) / elapsed) * 1000 : 0;
  }
  reset() { this.times = []; }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGesturePrediction(
  featureVector: FeatureVector | null,
  options:       PredictionOptions = {},
): GesturePrediction {
  const {
    threshold  = 0.55,
    windowSize = 10,
    reloadMs   = 60_000,
  } = options;

  const modelRef   = useRef<RFModel | null>(null);
  const smootherRef = useRef(new PredictionSmoother(windowSize));
  const fpsRef      = useRef(new FpsTracker());
  const lastFvRef   = useRef<FeatureVector | null>(null);

  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError,  setModelError]  = useState<string | null>(null);
  const [classes,     setClasses]     = useState<string[]>([]);
  const [prediction,  setPrediction]  = useState<GesturePrediction>({
    label:       null,
    confidence:  0,
    latencyMs:   0,
    fps:         0,
    modelLoaded: false,
    modelError:  null,
    classes:     [],
  });

  // ── Load model ────────────────────────────────────────────────────────────
  const doLoad = useCallback(async (force = false) => {
    try {
      const m = await loadModel(force);
      modelRef.current = m;
      setClasses(m.classes);
      setModelLoaded(true);
      setModelError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setModelError(msg);
      setModelLoaded(false);
    }
  }, []);

  // Initial load
  useEffect(() => { doLoad(); }, [doLoad]);

  // Periodic reload to pick up retrained models
  useEffect(() => {
    const id = setInterval(() => doLoad(true), reloadMs);
    return () => clearInterval(id);
  }, [doLoad, reloadMs]);

  // ── Run prediction whenever featureVector changes ─────────────────────────
  useEffect(() => {
    if (!featureVector || featureVector === lastFvRef.current) return;
    lastFvRef.current = featureVector;

    const model = modelRef.current;

    // No hand → push null to smoother (keeps last valid prediction in buffer)
    if (!model || featureVector.isZero || featureVector.handsEncoded === 0) {
      smootherRef.current.push(null, 0);
      const stable = smootherRef.current.current;
      const f = fpsRef.current.tick();
      setPrediction((prev) => ({
        ...prev,
        label:      stable?.label      ?? null,
        confidence: stable?.confidence ?? 0,
        latencyMs:  0,
        fps:        Math.round(f),
        modelLoaded: !!model,
      }));
      return;
    }

    // Run inference
    const raw = predict(model, featureVector, threshold);

    // Push to smoother (null if below threshold)
    const smoothed = smootherRef.current.push(
      raw?.label ?? null,
      raw?.confidence ?? 0,
    );

    const f = fpsRef.current.tick();

    setPrediction({
      label:       smoothed?.label      ?? null,
      confidence:  smoothed?.confidence ?? 0,
      latencyMs:   Math.round((raw?.latencyMs ?? 0) * 100) / 100,
      fps:         Math.round(f),
      modelLoaded: true,
      modelError:  null,
      classes:     model.classes,
    });
  }, [featureVector, threshold]);

  // Keep modelLoaded / modelError in sync with latest state
  return {
    ...prediction,
    modelLoaded,
    modelError,
    classes,
  };
}
