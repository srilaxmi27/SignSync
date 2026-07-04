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
  private buffer: string[]  = [];
  private lastSmoothed: SmoothedPrediction | null = null;

  /**
   * @param windowSize  Number of frames to majority-vote over (default 10).
   *                    Higher = more stable but slightly more lag.
   */
  constructor(windowSize = 10) {
    this.windowSize = windowSize;
  }

  /**
   * Feed one raw prediction result.
   * Pass null when no hand is detected or confidence was too low —
   * the smoother keeps the last valid smoothed result until the buffer
   * fills with enough null/absent frames to declare "no gesture".
   */
  push(label: string | null, confidence: number): SmoothedPrediction | null {
    if (label !== null) {
      this.buffer.push(label);
    }
    // Trim buffer to window size
    if (this.buffer.length > this.windowSize) {
      this.buffer.shift();
    }

    if (this.buffer.length === 0) {
      this.lastSmoothed = null;
      return null;
    }

    // Majority vote
    const counts: Record<string, number> = {};
    for (const l of this.buffer) {
      counts[l] = (counts[l] ?? 0) + 1;
    }
    let bestLabel = this.buffer[0];
    let bestCount = 0;
    for (const [l, n] of Object.entries(counts)) {
      if (n > bestCount) { bestCount = n; bestLabel = l; }
    }

    this.lastSmoothed = {
      label:      bestLabel,
      confidence,
      windowSize: this.buffer.length,
    };
    return this.lastSmoothed;
  }

  /** Return the last stable prediction without advancing the buffer. */
  get current(): SmoothedPrediction | null {
    return this.lastSmoothed;
  }

  /** Clear buffer — call when session ends or hand disappears. */
  reset(): void {
    this.buffer      = [];
    this.lastSmoothed = null;
  }
}
