/**
 * Feature Generator
 * ─────────────────
 * Responsibility: Convert normalized landmarks into a fixed-length float32
 * feature vector ready for a machine-learning classifier.
 *
 * Layout (per hand — 63 values):
 *   [x0, y0, z0, x1, y1, z1, ..., x20, y20, z20]
 *   21 landmarks × 3 coordinates = 63 floats
 *
 * Single-hand vector:  63 values
 * Two-hand vector:    126 values (hand 0 first, then hand 1)
 *
 * When fewer hands are detected than MAX_HANDS, the missing hand's
 * section is zero-padded so the vector length is always FEATURE_LENGTH.
 *
 * Handedness flag convention:
 *   Hand 0 slot = Left hand  (or the only detected hand)
 *   Hand 1 slot = Right hand
 * If only one hand is detected it occupies slot 0; slot 1 is zeroed.
 * This gives the classifier consistent positional semantics.
 */

import { LANDMARK_COUNT, type ProcessedHand } from "./landmarkProcessor";

// ─── Constants ────────────────────────────────────────────────────────────────

export const COORDS_PER_LANDMARK = 3;                              // x, y, z
export const VALUES_PER_HAND     = LANDMARK_COUNT * COORDS_PER_LANDMARK; // 63
export const MAX_HANDS           = 2;
export const FEATURE_LENGTH      = VALUES_PER_HAND * MAX_HANDS;   // 126

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FeatureVector {
  data:          Float32Array;   // always FEATURE_LENGTH = 126 elements
  length:        number;         // always FEATURE_LENGTH
  handsEncoded:  number;         // 0, 1, or 2 — how many real hands contributed
  isZero:        boolean;        // true when no hands detected (all zeros)
}

// ─── Core generation ─────────────────────────────────────────────────────────

/**
 * Build a fixed-length Float32Array feature vector from processed hands.
 *
 * Accepts 0, 1, or 2 ProcessedHand objects.
 * Always returns a vector of exactly FEATURE_LENGTH floats.
 */
export function generateFeatureVector(hands: ProcessedHand[]): FeatureVector {
  const data = new Float32Array(FEATURE_LENGTH);   // initialized to 0

  // Map by handedness so Left always occupies slot 0, Right slot 1.
  // If both hands have the same label (edge case) index by hand_index.
  const slotFor = (h: ProcessedHand): 0 | 1 =>
    h.handedness === "Left" ? 0 : 1;

  let handsEncoded = 0;

  for (const hand of hands) {
    if (!hand.isValid) continue;
    const slot   = slotFor(hand);
    const offset = slot * VALUES_PER_HAND;
    hand.landmarks.forEach((lm, i) => {
      data[offset + i * COORDS_PER_LANDMARK + 0] = lm.x;
      data[offset + i * COORDS_PER_LANDMARK + 1] = lm.y;
      data[offset + i * COORDS_PER_LANDMARK + 2] = lm.z;
    });
    handsEncoded++;
  }

  return {
    data,
    length:       FEATURE_LENGTH,
    handsEncoded,
    isZero:       handsEncoded === 0,
  };
}

/**
 * Validate that a FeatureVector has the expected fixed length.
 * Throws if the invariant is broken (should never happen in normal use).
 */
export function assertFeatureLength(fv: FeatureVector): void {
  if (fv.length !== FEATURE_LENGTH || fv.data.length !== FEATURE_LENGTH) {
    throw new Error(
      `Feature vector length invariant violated: expected ${FEATURE_LENGTH}, ` +
      `got data.length=${fv.data.length}, fv.length=${fv.length}`
    );
  }
}

/**
 * Convert Float32Array to a plain number[] for JSON serialization / logging.
 */
export function featureVectorToArray(fv: FeatureVector): number[] {
  return Array.from(fv.data);
}
