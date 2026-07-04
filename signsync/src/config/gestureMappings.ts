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
  sentence:     string;   // text shown to the user
  emoji?:       string;   // optional visual cue
  category?:    "greeting" | "affirmation" | "need" | "emergency" | "general";
  standardName: string;   // standard sign language name (e.g. ISL / ASL - Hello)
  sentence_te:  string;   // Telugu translation
  sentence_hi:  string;   // Hindi translation
  tutorialUrl?: string;   // optional tutorial URL (for future use)
  imageUrl?:    string;   // optional image URL (for future use)
  gifUrl?:      string;   // optional GIF URL (for future use)
  videoUrl?:    string;   // optional video URL (for future use)
  externalLink?: string;  // optional external learning link (for future use)
}

export const GESTURE_MAPPINGS: Record<string, GestureMapping> = {
  // ── Greetings ────────────────────────────────────────────────────────────
  "hello":         {
    sentence: "Hello!",
    emoji: "👋",
    category: "greeting",
    standardName: "ISL / ASL - Hello",
    sentence_te: "నమస్కారం!",
    sentence_hi: "नमस्ते!",
    tutorialUrl: "https://www.youtube.com/embed/HOrs2O_0Jxs"
  },
  "goodbye":       {
    sentence: "Goodbye!",
    emoji: "🙏",
    category: "greeting",
    standardName: "ISL / ASL - Goodbye",
    sentence_te: "సెలవు!",
    sentence_hi: "अलविदा!",
    tutorialUrl: "https://www.youtube.com/embed/HOrs2O_0Jxs"
  },
  "thank you":     {
    sentence: "Thank you.",
    emoji: "🙏",
    category: "greeting",
    standardName: "ISL / ASL - Thank You",
    sentence_te: "ధన్యవాదాలు.",
    sentence_hi: "धन्यवाद।",
    tutorialUrl: "https://www.youtube.com/embed/HOrs2O_0Jxs"
  },
  "please":        {
    sentence: "Please.",
    emoji: "🤲",
    category: "greeting",
    standardName: "ISL / ASL - Please",
    sentence_te: "దయచేసి.",
    sentence_hi: "कृपया।",
    tutorialUrl: "https://www.youtube.com/embed/HOrs2O_0Jxs"
  },
  "sorry":         {
    sentence: "I am sorry.",
    emoji: "😔",
    category: "general",
    standardName: "ISL / ASL - Sorry",
    sentence_te: "నన్ను క్షమించండి.",
    sentence_hi: "मुझे खेद है।",
    tutorialUrl: "https://www.youtube.com/embed/HOrs2O_0Jxs"
  },

  // ── Affirmations ─────────────────────────────────────────────────────────
  "yes":           {
    sentence: "Yes.",
    emoji: "✅",
    category: "affirmation",
    standardName: "ISL / ASL - Yes",
    sentence_te: "అవును.",
    sentence_hi: "हाँ।",
    tutorialUrl: "https://www.youtube.com/embed/HOrs2O_0Jxs"
  },
  "no":            {
    sentence: "No.",
    emoji: "❌",
    category: "affirmation",
    standardName: "ISL / ASL - No",
    sentence_te: "కాదు.",
    sentence_hi: "नहीं।",
    tutorialUrl: "https://www.youtube.com/embed/HOrs2O_0Jxs"
  },
  "good":          {
    sentence: "That is good.",
    emoji: "👍",
    category: "affirmation",
    standardName: "ISL / ASL - Good",
    sentence_te: "అది చాలా బాగుంది.",
    sentence_hi: "वह अच्छा है।",
    tutorialUrl: "https://www.youtube.com/embed/HOrs2O_0Jxs"
  },

  // ── Needs ─────────────────────────────────────────────────────────────────
  "water please":  {
    sentence: "I need water.",
    emoji: "💧",
    category: "need",
    standardName: "ISL / ASL - Water Please",
    sentence_te: "నాకు మంచి నీరు కావాలి.",
    sentence_hi: "मुझे पानी चाहिए।",
    tutorialUrl: "https://www.youtube.com/embed/HOrs2O_0Jxs"
  },
  "water":         {
    sentence: "I need water.",
    emoji: "💧",
    category: "need",
    standardName: "ISL / ASL - Water",
    sentence_te: "నాకు మంచి నీరు కావాలి.",
    sentence_hi: "मुझे पानी चाहिए।",
    tutorialUrl: "https://www.youtube.com/embed/HOrs2O_0Jxs"
  },
  "food":          {
    sentence: "I am hungry.",
    emoji: "🍽️",
    category: "need",
    standardName: "ISL / ASL - Food",
    sentence_te: "నాకు ఆకలిగా ఉంది.",
    sentence_hi: "मुझे भूख लगी है।",
    tutorialUrl: "https://www.youtube.com/embed/HOrs2O_0Jxs"
  },
  "medicine":      {
    sentence: "I need medicine.",
    emoji: "💊",
    category: "need",
    standardName: "ISL / ASL - Medicine",
    sentence_te: "నాకు మందులు కావాలి.",
    sentence_hi: "मुझे दवा चाहिए।",
    tutorialUrl: "https://www.youtube.com/embed/HOrs2O_0Jxs"
  },
  "sleep":         {
    sentence: "I need to sleep.",
    emoji: "😴",
    category: "need",
    standardName: "ISL / ASL - Sleep",
    sentence_te: "నేను పడుకోవాలి.",
    sentence_hi: "मुझे सोना है।",
    tutorialUrl: "https://www.youtube.com/embed/HOrs2O_0Jxs"
  },
  "washroom":      {
    sentence: "I need to use the restroom.",
    emoji: "🚻",
    category: "need",
    standardName: "ISL / ASL - Washroom",
    sentence_te: "నేను టాయిలెట్ వెళ్ళాలి.",
    sentence_hi: "मुझे वॉशरुम जाना है।",
    tutorialUrl: "https://www.youtube.com/embed/HOrs2O_0Jxs"
  },
  "pain":          {
    sentence: "I am in pain.",
    emoji: "😣",
    category: "need",
    standardName: "ISL / ASL - Pain",
    sentence_te: "నాకు నొప్పిగా ఉంది.",
    sentence_hi: "मुझे दर्द हो रहा है।",
    tutorialUrl: "https://www.youtube.com/embed/HOrs2O_0Jxs"
  },

  // ── Emergency ─────────────────────────────────────────────────────────────
  "help":          {
    sentence: "I need help.",
    emoji: "🆘",
    category: "emergency",
    standardName: "ISL / ASL - Help",
    sentence_te: "నాకు సహాయం కావాలి.",
    sentence_hi: "मुझे मदद चाहिए।",
    tutorialUrl: "https://www.youtube.com/embed/HOrs2O_0Jxs"
  },
  "doctor":        {
    sentence: "I need a doctor.",
    emoji: "🏥",
    category: "emergency",
    standardName: "ISL / ASL - Doctor",
    sentence_te: "నాకు డాక్టర్ కావాలి.",
    sentence_hi: "मुझे डॉक्टर की जरूरत है।",
    tutorialUrl: "https://www.youtube.com/embed/HOrs2O_0Jxs"
  },
  "call":          {
    sentence: "Please call someone.",
    emoji: "📞",
    category: "emergency",
    standardName: "ISL / ASL - Call",
    sentence_te: "దయచేసి ఒకరికి ఫోన్ చేయండి.",
    sentence_hi: "कृपया किसी को बुलाएं।",
    tutorialUrl: "https://www.youtube.com/embed/HOrs2O_0Jxs"
  },
  "emergency":     {
    sentence: "This is an emergency!",
    emoji: "🚨",
    category: "emergency",
    standardName: "ISL / ASL - Emergency",
    sentence_te: "ఇది అత్యవసర పరిస్థితి!",
    sentence_hi: "यह एक आपातकालीन स्थिति है!",
    tutorialUrl: "https://www.youtube.com/embed/HOrs2O_0Jxs"
  },
};

/** Fallback when no mapping exists for a recognized gesture. */
export const UNMAPPED_TEMPLATE = (label: string) =>
  label.charAt(0).toUpperCase() + label.slice(1) + ".";
