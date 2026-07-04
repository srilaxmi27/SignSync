/**
 * Prediction Smoother
 * ────────────────────
 * Responsibility: reduce per-frame label jitter using a sliding window
 * majority vote.
 *
 * Strategy:
 *   - Keep the last N predictions in a ring buffer.
 *   - The smoothed output is the class that appears most frequently.
 *   - If a low-confidence / null prediction arrives, the buffer retains
 *     the last valid entry — the smoothed label does NOT flicker to "—".
 *   - A consecutive-frames threshold controls how quickly a new gesture
 *     can replace the current one (prevents single-frame spurious swaps).
 *
 * Pure class — no React, no side effects.
 */

export interface SmoothedPrediction {
  label:       string;    // stable gesture label
  confidence:  number;    // confidence of the raw prediction that voted in
  windowSize:  number;    // current number of predictions in the buffer
}

export class PredictionSmoother {
  private readonly windowSize: number;
  private buffer: (string | null)[] = [];
  private lastSmoothed: SmoothedPrediction | null = null;
  private lastValidLabel: string | null = null;
  private lastValidConfidence: number = 0;

  /**
   * @param windowSize  Number of frames to majority-vote over (default 10).
   *                    Higher = more stable but slightly more lag.
   */
  constructor(windowSize = 10) {
    this.windowSize = windowSize;
  }

  /**
   * Feed one raw prediction result.
   * Pass null when no hand is detected or confidence was too low.
   * The smoother keeps the last valid smoothed result until the buffer
   * fills with enough null/absent frames to declare "no gesture".
   */
  push(label: string | null, confidence: number): SmoothedPrediction | null {
    // Push the raw prediction label (could be a valid label or null)
    this.buffer.push(label);

    // Trim buffer to window size
    if (this.buffer.length > this.windowSize) {
      this.buffer.shift();
    }

    // Count label frequencies and null frames
    const counts: Record<string, number> = {};
    let nullCount = 0;
    for (const l of this.buffer) {
      if (l === null) {
        nullCount++;
      } else {
        counts[l] = (counts[l] ?? 0) + 1;
      }
    }

    // If the majority of the window is null (e.g. >= 60%), clear and return null
    const nullRatio = nullCount / this.buffer.length;
    if (nullRatio >= 0.6) {
      this.lastSmoothed = null;
      this.lastValidLabel = null;
      this.lastValidConfidence = 0;
      return null;
    }

    // Majority vote among non-null labels
    let bestLabel: string | null = null;
    let bestCount = 0;
    for (const [l, n] of Object.entries(counts)) {
      if (n > bestCount) {
        bestCount = n;
        bestLabel = l;
      }
    }

    // Stability threshold: best label must appear in at least 30% of the window
    // to ignore sporadic noise/unstable predictions.
    const minRequiredCount = Math.max(2, Math.floor(this.windowSize * 0.3));
    if (bestLabel && bestCount >= minRequiredCount) {
      this.lastValidLabel = bestLabel;
      if (label === bestLabel) {
        this.lastValidConfidence = confidence;
      } else if (this.lastValidConfidence === 0) {
        this.lastValidConfidence = confidence;
      }
    }

    if (this.lastValidLabel) {
      this.lastSmoothed = {
        label:      this.lastValidLabel,
        confidence: this.lastValidConfidence || confidence,
        windowSize: this.buffer.length,
      };
      return this.lastSmoothed;
    }

    this.lastSmoothed = null;
    return null;
  }

  /** Return the last stable prediction without advancing the buffer. */
  get current(): SmoothedPrediction | null {
    return this.lastSmoothed;
  }

  /** Clear buffer — call when session ends or hand disappears. */
  reset(): void {
    this.buffer = [];
    this.lastSmoothed = null;
    this.lastValidLabel = null;
    this.lastValidConfidence = 0;
  }
}
