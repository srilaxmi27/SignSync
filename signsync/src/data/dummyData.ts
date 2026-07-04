/**
 * Static content only — no fake session/gesture/activity data.
 * Features and HowItWorks steps are real product copy used on the landing page.
 */

import { FeatureItem, StepItem } from "@/types";

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
