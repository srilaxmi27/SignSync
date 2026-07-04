/**
 * Dataset Collector
 * ─────────────────
 * Responsibility: validate incoming feature vectors and accumulate
 * training samples in memory.
 *
 * Separated from the UI so it can be used headlessly in tests or
 * from any component without coupling to React state.
 *
 * A sample is only accepted when:
 *   - The gesture label is non-empty (trimmed)
 *   - The feature vector has the correct fixed length (FEATURE_LENGTH)
 *   - The vector is not all-zeros (no hand detected)
 *   - At least one hand is encoded (handsEncoded > 0)
 */

import { FEATURE_LENGTH, type FeatureVector, featureVectorToArray } from "./featureGenerator";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DataSample {
  label:      string;          // gesture class name
  features:   number[];        // fixed-length float array, length = FEATURE_LENGTH
  timestamp:  number;          // Date.now()
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

// ─── Validator ────────────────────────────────────────────────────────────────

export function validateSample(
  label: string,
  fv:    FeatureVector,
): ValidationResult {
  if (!label.trim()) {
    return { ok: false, reason: "Gesture label must not be empty." };
  }
  if (fv.length !== FEATURE_LENGTH || fv.data.length !== FEATURE_LENGTH) {
    return { ok: false, reason: `Feature vector has wrong length: ${fv.data.length} (expected ${FEATURE_LENGTH}).` };
  }
  if (fv.isZero || fv.handsEncoded === 0) {
    return { ok: false, reason: "No hand detected — sample skipped." };
  }
  return { ok: true };
}

// ─── Collector ────────────────────────────────────────────────────────────────

export class DatasetCollector {
  private _samples: DataSample[] = [];

  /** Total collected samples across all labels. */
  get totalSamples(): number {
    return this._samples.length;
  }

  /** Count of samples for a specific label. */
  countForLabel(label: string): number {
    return this._samples.filter((s) => s.label === label).length;
  }

  /** All unique labels collected so far. */
  get labels(): string[] {
    return [...new Set(this._samples.map((s) => s.label))];
  }

  /**
   * Try to add one sample.
   * Returns a ValidationResult — caller decides whether to show the error.
   * Invalid samples are silently skipped (not stored).
   */
  collect(label: string, fv: FeatureVector): ValidationResult {
    const result = validateSample(label, fv);
    if (!result.ok) return result;

    this._samples.push({
      label:     label.trim(),
      features:  featureVectorToArray(fv),
      timestamp: Date.now(),
    });

    return { ok: true };
  }

  /**
   * Return a snapshot of all collected samples.
   * The returned array is a shallow copy — mutations won't affect the store.
   */
  getSamples(): DataSample[] {
    return [...this._samples];
  }

  /** Remove all samples for a specific label. */
  clearLabel(label: string): void {
    this._samples = this._samples.filter((s) => s.label !== label);
  }

  /** Wipe the entire dataset. */
  clear(): void {
    this._samples = [];
  }
}
