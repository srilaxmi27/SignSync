/**
 * Sentence Generator
 * ──────────────────
 * Converts a gesture label into a human-readable sentence in the
 * requested language (English, Telugu, Hindi).
 *
 * Merges static GESTURE_MAPPINGS with any custom gestures the user
 * has added via AddGesturePanel (stored in localStorage).
 */

import { GESTURE_MAPPINGS, UNMAPPED_TEMPLATE } from "@/config/gestureMappings";
import { loadCustomGestures } from "@/components/dashboard/AddGesturePanel";

export interface SentenceResult {
  sentence:      string;
  emoji:         string;
  category:      string;
  standardName:  string;
  sentence_te:   string;
  sentence_hi:   string;
  isMapped:      boolean;
  tutorialUrl?:  string;
  imageUrl?:     string;
  gifUrl?:       string;
  videoUrl?:     string;
  externalLink?: string;
}

/** Build a merged lookup from static + custom gestures (called per-lookup so custom additions take effect immediately). */
function getMergedMappings(): Record<string, SentenceResult> {
  const merged: Record<string, SentenceResult> = {};

  // Static mappings
  for (const [key, m] of Object.entries(GESTURE_MAPPINGS)) {
    merged[key] = {
      sentence:     m.sentence,
      emoji:        m.emoji      ?? "✋",
      category:     m.category   ?? "general",
      standardName: m.standardName,
      sentence_te:  m.sentence_te,
      sentence_hi:  m.sentence_hi,
      isMapped:     true,
      tutorialUrl:  m.tutorialUrl,
      imageUrl:     m.imageUrl,
      gifUrl:       m.gifUrl,
      videoUrl:     m.videoUrl,
      externalLink: m.externalLink,
    };
  }

  // Custom gestures override/extend static ones
  for (const c of loadCustomGestures()) {
    merged[c.label.toLowerCase()] = {
      sentence:    c.sentence,
      emoji:       c.emoji,
      category:    c.category,
      standardName: `Custom — ${c.label}`,
      sentence_te: c.sentence_te || c.sentence,
      sentence_hi: c.sentence_hi || c.sentence_te || c.sentence,
      isMapped:    true,
    };
  }

  return merged;
}

export function generateSentence(label: string | null): SentenceResult | null {
  if (!label || !label.trim()) return null;

  const key    = label.trim().toLowerCase();
  const merged = getMergedMappings();
  const found  = merged[key];

  if (found) return found;

  // Graceful fallback
  const fallback = UNMAPPED_TEMPLATE(label);
  return {
    sentence:    fallback,
    emoji:       "✋",
    category:    "general",
    standardName: `ISL / ASL — ${label}`,
    sentence_te: fallback,
    sentence_hi: fallback,
    isMapped:    false,
  };
}

export function isMappedGesture(label: string): boolean {
  return label.trim().toLowerCase() in getMergedMappings();
}
