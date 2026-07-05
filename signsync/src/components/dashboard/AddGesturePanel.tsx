/**
 * AddGesturePanel
 * ────────────────
 * Two sections in one collapsible card:
 *
 * 1. ADD GESTURE MAPPING — map a gesture label to English + Telugu sentences.
 *    Saved to localStorage; merged with static mappings immediately.
 *
 * 2. RECORD SAMPLES — collect training samples for a new gesture using the
 *    live camera feed. Uses the existing DatasetCollector + DatasetWriter.
 *    Samples auto-capture at frame rate while "Recording" is active.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ChevronDown, BookOpen, AlertCircle, Camera, Circle, Square, Download } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { downloadDataset } from "@/lib/datasetWriter";
import { PersistentDatasetCollector } from "@/lib/customGestureSamples";
import type { FeatureVector } from "@/lib/featureGenerator";

// ─── Custom mapping persistence ───────────────────────────────────────────────

export interface CustomGestureEntry {
  label:       string;
  sentence:    string;
  sentence_te: string;
  sentence_hi: string;
  emoji:       string;
  category:    "greeting" | "affirmation" | "need" | "emergency" | "general";
}

const STORAGE_KEY = "signsync.custom_gestures";

const phraseTranslations: Record<string, { te: string; hi: string }> = {
  help: { te: "సహాయం", hi: "मदद" },
  water: { te: "నీరు", hi: "पानी" },
  food: { te: "ఆహారం", hi: "खाना" },
  medicine: { te: "మందు", hi: "दवा" },
  doctor: { te: "డాక్టర్", hi: "डॉक्टर" },
  yes: { te: "అవును", hi: "हाँ" },
  no: { te: "కాదు", hi: "नहीं" },
  please: { te: "దయచేసి", hi: "कृपया" },
  thank: { te: "ధన్యవాదాలు", hi: "धन्यवाद" },
  thanks: { te: "ధన్యవాదాలు", hi: "धन्यवाद" },
  sorry: { te: "క్షమించండి", hi: "माफ़ कीजिए" },
  sleep: { te: "నిద్ర", hi: "नींद" },
  pain: { te: "నొప్పి", hi: "दर्द" },
  toilet: { te: "టాయిలెట్", hi: "शौचालय" },
  emergency: { te: "అత్యవసరము", hi: "आपातकाल" },
  call: { te: "ఫోన్ చేయండి", hi: "बुलाओ" },
  i: { te: "నేను", hi: "मैं" },
  me: { te: "నాకు", hi: "मुझे" },
  need: { te: "కావాలి", hi: "चाहिए" },
  want: { te: "కావాలి", hi: "चाहिए" },
  go: { te: "వెళ్ళండి", hi: "जाओ" },
  come: { te: "వచ్చండి", hi: "आओ" },
};

function translatePhrase(input: string): { te: string; hi: string } {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return { te: "", hi: "" };

  const direct = phraseTranslations[trimmed];
  if (direct) return { te: direct.te, hi: direct.hi };

  const words = trimmed
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  const te = words.map((word) => phraseTranslations[word]?.te ?? word).join(" ");
  const hi = words.map((word) => phraseTranslations[word]?.hi ?? word).join(" ");

  return { te, hi };
}

export function loadCustomGestures(): CustomGestureEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveCustomGestures(entries: CustomGestureEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMOJI_PRESETS = ["✋","👋","🙏","👍","❌","✅","💧","🍽️","💊","🆘","📞","😴"];
const collector = new PersistentDatasetCollector();

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddGesturePanelProps {
  featureVector?: FeatureVector | null;
  sessionActive?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddGesturePanel({
  featureVector = null,
  sessionActive = false,
}: AddGesturePanelProps) {
  const [expanded, setExpanded] = useState(false);

  // ── Mapping state ─────────────────────────────────────────────────────────
  const [entries, setEntries] = useState<CustomGestureEntry[]>(loadCustomGestures);
  const [label, setLabel] = useState("");
  const [sentence, setSentence] = useState("");
  const [sentenceTe, setSentenceTe] = useState("");
  const [sentenceHi, setSentenceHi] = useState("");
  const [emoji, setEmoji] = useState("✋");
  const [mapError, setMapError] = useState("");
  const [mapSaved, setMapSaved] = useState(false);
  const [recording, setRecording] = useState(false);
  const [sampleCount, setSampleCount] = useState(0);
  const [totalSamples, setTotalSamples] = useState(0);
  const [recError, setRecError] = useState("");
  const rafRef = useRef<number | null>(null);
  const fvRef = useRef<FeatureVector | null>(null);

  useEffect(() => {
    fvRef.current = featureVector ?? null;
  }, [featureVector]);

  useEffect(() => {
    if (!sessionActive) return;
    if (label) setMapError("");
  }, [label, sessionActive]);

  useEffect(() => {
    const translated = translatePhrase(sentence);
    setSentenceTe(translated.te);
    setSentenceHi(translated.hi);
  }, [sentence]);

  useEffect(() => {
    if (!recording) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const loop = () => {
      const fv = fvRef.current;
      if (fv && label.trim()) {
        const result = collector.collect(label.trim(), fv);
        if (result.ok) {
          setSampleCount(collector.countForLabel(label.trim()));
          setTotalSamples(collector.totalSamples);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [recording, label]);

  useEffect(() => {
    if (!sessionActive && recording) setRecording(false);
  }, [recording, sessionActive]);

  // ── Handlers — mapping ────────────────────────────────────────────────────
  const handleAddMapping = () => {
    setMapError("");
    const trimLabel = label.trim().toLowerCase();
    if (!trimLabel) {
      setMapError("Gesture label is required.");
      return;
    }
    if (!sentence.trim()) {
      setMapError("A simple phrase is required.");
      return;
    }
    if (entries.some((e) => e.label === trimLabel)) {
      setMapError(`"${trimLabel}" already exists.`);
      return;
    }
    const entry: CustomGestureEntry = {
      label: trimLabel,
      sentence: sentence.trim(),
      sentence_te: sentenceTe.trim() || sentence.trim(),
      sentence_hi: sentenceHi.trim() || sentence.trim(),
      emoji,
      category: "general",
    };
    const next = [...entries, entry];
    setEntries(next);
    saveCustomGestures(next);
    setLabel("");
    setSentence("");
    setSentenceTe("");
    setSentenceHi("");
    setEmoji("✋");
    setMapSaved(true);
    window.dispatchEvent(new Event("signsync:custom-gesture-samples"));
    window.setTimeout(() => setMapSaved(false), 1800);
  };

  const handleDeleteMapping = (lbl: string) => {
    const next = entries.filter((e) => e.label !== lbl);
    setEntries(next);
    saveCustomGestures(next);
    window.dispatchEvent(new Event("signsync:custom-gesture-samples"));
  };

  const handleStartCapture = () => {
    setRecError("");
    if (!label.trim()) {
      setRecError("Enter a gesture label first.");
      return;
    }
    if (!sessionActive) {
      setRecError("Start the camera session first.");
      return;
    }
    setSampleCount(collector.countForLabel(label.trim()));
    setRecording(true);
  };

  const handleStopCapture = () => {
    setRecording(false);
  };

  const handleClearCapture = () => {
    collector.clearLabel(label.trim());
    setSampleCount(0);
    setTotalSamples(collector.totalSamples);
  };

  const handleExport = () => {
    try {
      downloadDataset(collector.getSamples(), "json");
    } catch (error) {
      setRecError((error as Error).message);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card variant="elevated" className="overflow-hidden p-0">
        {/* Header toggle */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex w-full items-center justify-between px-5 py-4 hover:bg-ink-900/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-signal-400 to-signal-600 text-white shadow-soft">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-ink-900">Gesture Manager</p>
              <p className="text-xs text-ink-400">
                Add mappings &amp; record training samples
              </p>
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 text-ink-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-t border-ink-900/6"
            >
              <div className="flex flex-col gap-4 px-5 py-4">
                <div className="rounded-xl bg-beige-50 px-3 py-2.5 text-xs text-ink-600">
                  Add a new gesture in one quick step. It will be available for translation when the live camera detects the same label.
                </div>

                <div className="grid gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-ink-700">
                      Gesture label <span className="text-coral-500">*</span>
                    </label>
                    <input
                      value={label}
                      onChange={(e) => {
                        setLabel(e.target.value);
                        setMapError("");
                      }}
                      placeholder="e.g. cold, help, yes"
                      className="w-full rounded-xl border border-ink-900/10 bg-beige-50 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-signal-400 focus:outline-none focus:ring-2 focus:ring-signal-400/20"
                    />
                  </div>

                  <div className="rounded-xl border border-ink-900/8 bg-beige-50 p-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-ink-700">
                      <Camera className="h-3.5 w-3.5" />
                      Record live samples
                    </div>
                    <p className="mt-1 text-[11px] leading-5 text-ink-500">
                      Keep the camera on and perform the gesture while capture is active. The app will collect feature samples for that label.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {!recording ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleStartCapture}
                          leftIcon={<Circle className="h-3.5 w-3.5 fill-current" />}
                        >
                          Start capture
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleStopCapture}
                          leftIcon={<Square className="h-3.5 w-3.5" />}
                        >
                          Stop capture
                        </Button>
                      )}
                      <button
                        onClick={handleClearCapture}
                        className="rounded-xl border border-ink-900/10 px-3 py-2 text-xs font-medium text-ink-500 transition-colors hover:border-coral-400 hover:text-coral-600"
                      >
                        Clear samples
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-white/70 px-2.5 py-2">
                        <p className="font-semibold text-ink-800">{sampleCount}</p>
                        <p className="text-ink-500">for this label</p>
                      </div>
                      <div className="rounded-lg bg-white/70 px-2.5 py-2">
                        <p className="font-semibold text-ink-800">{totalSamples}</p>
                        <p className="text-ink-500">total samples</p>
                      </div>
                    </div>
                    {recError && (
                      <p className="mt-2 text-[11px] font-medium text-coral-600">{recError}</p>
                    )}
                    {totalSamples > 0 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-3"
                        onClick={handleExport}
                        leftIcon={<Download className="h-4 w-4" />}
                      >
                        Export samples
                      </Button>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-ink-700">
                      English phrase <span className="text-coral-500">*</span>
                    </label>
                    <input
                      value={sentence}
                      onChange={(e) => setSentence(e.target.value)}
                      placeholder="e.g. I need water"
                      className="w-full rounded-xl border border-ink-900/10 bg-beige-50 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-signal-400 focus:outline-none focus:ring-2 focus:ring-signal-400/20"
                    />
                  </div>

                  <div className="rounded-xl border border-ink-900/8 bg-white/70 p-3">
                    <p className="mb-2 text-xs font-semibold text-ink-700">Auto-translated phrases</p>
                    <div className="grid gap-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-ink-600">Telugu</label>
                        <input
                          value={sentenceTe}
                          readOnly
                          placeholder="Auto-generated Telugu"
                          className="w-full rounded-xl border border-ink-900/10 bg-beige-50 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold text-ink-600">Hindi</label>
                        <input
                          value={sentenceHi}
                          readOnly
                          placeholder="Auto-generated Hindi"
                          className="w-full rounded-xl border border-ink-900/10 bg-beige-50 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-ink-700">Pick an emoji</label>
                    <div className="flex flex-wrap gap-1.5">
                      {EMOJI_PRESETS.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => setEmoji(e)}
                          className={`rounded-lg p-1.5 text-lg transition-all ${emoji === e ? "bg-signal-100 ring-2 ring-signal-400" : "bg-beige-50 hover:bg-beige-100"}`}
                        >
                          {e}
                        </button>
                      ))}
                      <input
                        value={!EMOJI_PRESETS.includes(emoji) ? emoji : ""}
                        onChange={(e) => setEmoji(e.target.value || "✋")}
                        placeholder="custom"
                        maxLength={2}
                        className="w-16 rounded-lg border border-ink-900/10 bg-beige-50 px-2 py-1 text-center text-sm focus:border-signal-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {mapError && (
                  <div className="flex items-center gap-1.5 rounded-xl bg-coral-500/8 px-3 py-2 text-xs font-medium text-coral-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />{mapError}
                  </div>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddMapping}
                  leftIcon={<Plus className="h-4 w-4" />}
                  className={mapSaved ? "bg-mint-500 hover:bg-mint-600" : ""}
                >
                  {mapSaved ? "Added" : "Add gesture"}
                </Button>

                {entries.length > 0 && (
                  <div className="border-t border-ink-900/6 pt-3">
                    <p className="mb-2 text-xs font-semibold text-ink-600">Your gestures</p>
                    <div className="flex flex-col gap-1.5">
                      {entries.map((entry) => (
                        <div key={entry.label} className="flex items-center justify-between rounded-xl bg-beige-50 px-3 py-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="text-base">{entry.emoji}</span>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold capitalize text-ink-900">{entry.label}</p>
                              <p className="truncate text-[10px] text-ink-500">{entry.sentence}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteMapping(entry.label)}
                            className="ml-2 shrink-0 rounded-lg p-1 text-ink-400 transition-colors hover:bg-coral-500/10 hover:text-coral-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
