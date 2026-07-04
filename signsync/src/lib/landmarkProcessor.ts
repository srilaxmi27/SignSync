/**
 * Landmark Processor
 * ──────────────────
 * Responsibility: Extract and normalize raw MediaPipe landmarks.
 *
 * Normalization makes the feature vector invariant to:
 *   1. Hand position in the frame  → translate so wrist (landmark 0) is origin
 *   2. Hand size / camera distance → scale by the wrist-to-middle-MCP distance
 *   3. Z is also normalized by the same scale factor for depth-invariance
 *
 * Output: a ProcessedHand containing 21 NormalizedLandmark3D points,
 * always exactly LANDMARK_COUNT = 21 entries.
 *
 * If fewer than 21 landmarks arrive (shouldn't happen with MediaPipe but
 * handled defensively), missing entries are zero-padded.
 */

import type { LandmarkPoint, HandData } from "@/hooks/useMediaPipe";

// ─── Constants ────────────────────────────────────────────────────────────────

export const LANDMARK_COUNT = 21;

// Wrist landmark index (translation anchor)
const WRIST = 0;
// Middle finger MCP (landmark 9) — used as scale reference.
// The distance wrist→middle-MCP is a stable proxy for hand size.
const MIDDLE_MCP = 9;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NormalizedLandmark3D {
  id: number;
  x:  number;  // wrist-relative, scale-normalized
  y:  number;
  z:  number;
}

export interface ProcessedHand {
  hand_index:  number;
  handedness:  "Left" | "Right";
  landmarks:   NormalizedLandmark3D[];   // always LANDMARK_COUNT entries
  scale:       number;                   // wrist→middle-MCP distance (px equiv)
  isValid:     boolean;                  // true if 21 landmarks present + scale > 0
}

// ─── Core normalization ───────────────────────────────────────────────────────

/**
 * Normalize a single hand's landmarks.
 *
 * Steps:
 *   1. Translate: subtract wrist (landmark 0) from all points.
 *   2. Scale:     divide by distance(wrist, middle_mcp) so hand size cancels.
 *   3. Pad:       if < 21 landmarks, fill missing ones with {0,0,0}.
 */
export function processHand(hand: HandData): ProcessedHand {
  const raw = hand.landmarks;

  // Defensive pad to exactly 21 entries
  const padded: LandmarkPoint[] = Array.from({ length: LANDMARK_COUNT }, (_, i) =>
    raw[i] ?? { id: i, x: 0, y: 0, z: 0 }
  );

  const wrist = padded[WRIST];
  const mcp   = padded[MIDDLE_MCP];

  // Euclidean distance wrist → middle MCP (in normalised 0-1 space)
  const scale = Math.sqrt(
    (mcp.x - wrist.x) ** 2 +
    (mcp.y - wrist.y) ** 2 +
    (mcp.z - wrist.z) ** 2
  );

  const isValid = raw.length === LANDMARK_COUNT && scale > 1e-6;

  const normalized: NormalizedLandmark3D[] = padded.map((lm) => ({
    id: lm.id,
    x:  isValid ? (lm.x - wrist.x) / scale : 0,
    y:  isValid ? (lm.y - wrist.y) / scale : 0,
    z:  isValid ? (lm.z - wrist.z) / scale : 0,
  }));

  return {
    hand_index: hand.hand_index,
    handedness: hand.handedness,
    landmarks:  normalized,
    scale,
    isValid,
  };
}

/**
 * Process all hands from a single frame.
 * Returns [] when no hands are detected — never throws.
 */
export function processHands(hands: HandData[]): ProcessedHand[] {
  if (!hands || hands.length === 0) return [];
  return hands.map(processHand);
}
