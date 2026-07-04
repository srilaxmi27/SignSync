/**
 * Sentence Generator
 * ──────────────────
 * Responsibility: convert a gesture label into a human-readable sentence.
 *
 * Lookup is case-insensitive and trims whitespace so minor label
 * inconsistencies don't break the mapping.
 *
 * Returns null when label is null/empty (no gesture detected).
 * Falls back to a capitalised version of the label when no mapping exists.
 */

import {
  GESTURE_MAPPINGS,
  UNMAPPED_TEMPLATE,
  type GestureMapping,
} from "@/config/gestureMappings";

export interface SentenceResult {
  sentence:  string;
  emoji:     string;
  category:  string;
  isMapped:  boolean;   // true if an explicit mapping was found
}

/**
 * Generate a sentence for a gesture label.
 * Returns null when label is null or empty.
 */
export function generateSentence(label: string | null): SentenceResult | null {
  if (!label || !label.trim()) return null;

  const key     = label.trim().toLowerCase();
  const mapping: GestureMapping | undefined = GESTURE_MAPPINGS[key];

  if (mapping) {
    return {
      sentence: mapping.sentence,
      emoji:    mapping.emoji     ?? "✋",
      category: mapping.category  ?? "general",
      isMapped: true,
    };
  }

  // Graceful fallback — still shows something instead of crashing
  return {
    sentence: UNMAPPED_TEMPLATE(label),
    emoji:    "✋",
    category: "general",
    isMapped: false,
  };
}

/**
 * Check whether a mapping exists for a given label.
 * Useful for UI indicators (e.g. showing an "unmapped" badge).
 */
export function isMappedGesture(label: string): boolean {
  return label.trim().toLowerCase() in GESTURE_MAPPINGS;
}
