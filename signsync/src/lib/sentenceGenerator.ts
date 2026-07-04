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
  sentence:     string;
  emoji:        string;
  category:     string;
  standardName: string;
  sentence_te:  string;
  sentence_hi:  string;
  isMapped:     boolean;   // true if an explicit mapping was found
  tutorialUrl?: string;
  imageUrl?:    string;
  gifUrl?:      string;
  videoUrl?:    string;
  externalLink?: string;
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
      sentence:     mapping.sentence,
      emoji:        mapping.emoji     ?? "✋",
      category:     mapping.category  ?? "general",
      standardName: mapping.standardName,
      sentence_te:  mapping.sentence_te,
      sentence_hi:  mapping.sentence_hi,
      isMapped:     true,
      tutorialUrl:  mapping.tutorialUrl,
      imageUrl:     mapping.imageUrl,
      gifUrl:       mapping.gifUrl,
      videoUrl:     mapping.videoUrl,
      externalLink: mapping.externalLink,
    };
  }

  const defaultStandardName = "ISL / ASL - " + label.charAt(0).toUpperCase() + label.slice(1);
  const fallbackSentence = UNMAPPED_TEMPLATE(label);

  // Graceful fallback — still shows something instead of crashing
  return {
    sentence:     fallbackSentence,
    emoji:        "✋",
    category:     "general",
    standardName: defaultStandardName,
    sentence_te:  fallbackSentence,
    sentence_hi:  fallbackSentence,
    isMapped:     false,
  };
}

/**
 * Check whether a mapping exists for a given label.
 * Useful for UI indicators (e.g. showing an "unmapped" badge).
 */
export function isMappedGesture(label: string): boolean {
  return label.trim().toLowerCase() in GESTURE_MAPPINGS;
}
