import {
  ActivityEntry,
  FeatureItem,
  RecognizedGesture,
  StatusMetric,
  StepItem,
} from "@/types";

export const statusMetrics: StatusMetric[] = [
  {
    id: "sessions",
    label: "Sessions today",
    value: "6",
    helper: "2 more than yesterday",
    icon: "activity",
    trend: "+18%",
    trendDirection: "up",
  },
  {
    id: "accuracy",
    label: "Recognition accuracy",
    value: "96.2%",
    helper: "Rolling 7-day average",
    icon: "target",
    trend: "+1.4%",
    trendDirection: "up",
  },
  {
    id: "latency",
    label: "Avg. response time",
    value: "180ms",
    helper: "Camera to caption",
    icon: "zap",
    trend: "-12ms",
    trendDirection: "down",
  },
  {
    id: "minutes",
    label: "Minutes translated",
    value: "42",
    helper: "Across all sessions today",
    icon: "clock",
  },
];

export const recognizedGestures: RecognizedGesture[] = [
  { id: "g1", word: "Hello", confidence: 98, timestamp: "just now" },
  { id: "g2", word: "How are you", confidence: 94, timestamp: "2s ago" },
  { id: "g3", word: "Thank you", confidence: 97, timestamp: "6s ago" },
  { id: "g4", word: "Please", confidence: 91, timestamp: "11s ago" },
  { id: "g5", word: "Good morning", confidence: 95, timestamp: "18s ago" },
];

export const activityHistory: ActivityEntry[] = [
  {
    id: "a1",
    title: "Conversation with Priya",
    detail: "12 phrases translated in real time",
    duration: "8 min",
    timestamp: "Today, 10:24 AM",
    accuracy: 97,
    type: "conversation",
  },
  {
    id: "a2",
    title: "Practice: Everyday greetings",
    detail: "Reviewed 20 common greeting signs",
    duration: "5 min",
    timestamp: "Today, 9:02 AM",
    accuracy: 92,
    type: "practice",
  },
  {
    id: "a3",
    title: "Translation session",
    detail: "Doctor's appointment, live captions on",
    duration: "22 min",
    timestamp: "Yesterday, 4:45 PM",
    accuracy: 95,
    type: "translation",
  },
  {
    id: "a4",
    title: "Conversation with Arjun",
    detail: "9 phrases translated in real time",
    duration: "6 min",
    timestamp: "Yesterday, 1:15 PM",
    accuracy: 96,
    type: "conversation",
  },
  {
    id: "a5",
    title: "Practice: Numbers & time",
    detail: "Reviewed 15 number and time signs",
    duration: "7 min",
    timestamp: "Mon, 8:40 AM",
    accuracy: 89,
    type: "practice",
  },
];

export const features: FeatureItem[] = [
  {
    id: "f1",
    title: "Real-time recognition",
    description:
      "SignSync reads hand shape, motion, and position through your camera and turns it into text in a fraction of a second.",
    icon: "camera",
  },
  {
    id: "f2",
    title: "Context-aware AI",
    description:
      "Our model understands phrases, not just isolated signs, so translations read the way people actually speak.",
    icon: "brain",
  },
  {
    id: "f3",
    title: "Two-way conversation",
    description:
      "Speech is converted back into readable captions and avatar cues, so both sides of a conversation stay in sync.",
    icon: "waveform",
  },
  {
    id: "f4",
    title: "Private by design",
    description:
      "Video is processed on-device wherever possible. Nothing is stored without your permission.",
    icon: "shield",
  },
  {
    id: "f5",
    title: "Multiple sign languages",
    description:
      "Support for ASL, BSL, and ISL, with more regional sign languages added every quarter.",
    icon: "globe",
  },
  {
    id: "f6",
    title: "Built for everyone",
    description:
      "Large text, high contrast, and adjustable speeds make SignSync comfortable for every age and ability.",
    icon: "users",
  },
];

export const howItWorksSteps: StepItem[] = [
  {
    id: "s1",
    order: 1,
    title: "Point your camera",
    description:
      "Open SignSync on any device with a camera. No special hardware or gloves required.",
  },
  {
    id: "s2",
    order: 2,
    title: "Sign naturally",
    description:
      "Our AI tracks hand landmarks in real time and follows your natural signing pace and rhythm.",
  },
  {
    id: "s3",
    order: 3,
    title: "Read the translation",
    description:
      "Words appear as captions instantly, with confidence scores so you know when to repeat a sign.",
  },
  {
    id: "s4",
    order: 4,
    title: "Reply in your voice",
    description:
      "The other person speaks or types back, and SignSync displays it clearly for continuous conversation.",
  },
];
