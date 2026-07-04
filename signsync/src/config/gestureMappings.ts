/**
 * Gesture → Sentence Mapping Configuration
 * ─────────────────────────────────────────
 * Add new gestures here. Keys are lowercase gesture labels exactly as
 * they appear in the trained model's class list.
 *
 * To add a new gesture:
 *   1. Collect samples and retrain the model.
 *   2. Add an entry below: "your_gesture_label": "Your sentence."
 *   3. No other file needs to change.
 */

export interface GestureMapping {
  sentence:    string;   // text shown to the user
  emoji?:      string;   // optional visual cue
  category?:   "greeting" | "affirmation" | "need" | "emergency" | "general";
}

export const GESTURE_MAPPINGS: Record<string, GestureMapping> = {
  // ── Greetings ────────────────────────────────────────────────────────────
  "hello":         { sentence: "Hello!",                        emoji: "👋", category: "greeting"    },
  "goodbye":       { sentence: "Goodbye!",                      emoji: "🙏", category: "greeting"    },
  "thank you":     { sentence: "Thank you.",                    emoji: "🙏", category: "greeting"    },
  "please":        { sentence: "Please.",                       emoji: "🤲", category: "greeting"    },
  "sorry":         { sentence: "I am sorry.",                   emoji: "😔", category: "general"     },

  // ── Affirmations ─────────────────────────────────────────────────────────
  "yes":           { sentence: "Yes.",                          emoji: "✅", category: "affirmation" },
  "no":            { sentence: "No.",                           emoji: "❌", category: "affirmation" },
  "good":          { sentence: "That is good.",                 emoji: "👍", category: "affirmation" },

  // ── Needs ─────────────────────────────────────────────────────────────────
  "water please":  { sentence: "I need water.",                 emoji: "💧", category: "need"        },
  "water":         { sentence: "I need water.",                 emoji: "💧", category: "need"        },
  "food":          { sentence: "I am hungry.",                  emoji: "🍽️", category: "need"        },
  "medicine":      { sentence: "I need medicine.",              emoji: "💊", category: "need"        },
  "sleep":         { sentence: "I need to sleep.",              emoji: "😴", category: "need"        },
  "washroom":      { sentence: "I need to use the restroom.",   emoji: "🚻", category: "need"        },
  "pain":          { sentence: "I am in pain.",                 emoji: "😣", category: "need"        },

  // ── Emergency ─────────────────────────────────────────────────────────────
  "help":          { sentence: "I need help.",                  emoji: "🆘", category: "emergency"   },
  "doctor":        { sentence: "I need a doctor.",              emoji: "🏥", category: "emergency"   },
  "call":          { sentence: "Please call someone.",          emoji: "📞", category: "emergency"   },
  "emergency":     { sentence: "This is an emergency!",         emoji: "🚨", category: "emergency"   },
};

/** Fallback when no mapping exists for a recognized gesture. */
export const UNMAPPED_TEMPLATE = (label: string) =>
  label.charAt(0).toUpperCase() + label.slice(1) + ".";
