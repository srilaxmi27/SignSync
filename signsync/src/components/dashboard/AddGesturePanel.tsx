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
import {
  Plus, Trash2, ChevronDown, BookOpen, AlertCircle,
  Circle, Square, Download, Camera,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { DatasetCollector } from "@/lib/datasetCollector";
import { downloadDataset } from "@/lib/datasetWriter";
import type { FeatureVector } from "@/lib/featureGenerator";

// ─── Custom mapping persistence ───────────────────────────────────────────────

export interface CustomGestureEntry {
  label:       string;
  sentence:    string;
  sentence_te: string;
  emoji:       string;
  category:    "greeting" | "affirmation" | "need" | "emergency" | "general";
}

const STORAGE_KEY = "signsync.custom_gestures";

export function loadCustomGestures(): CustomGestureEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveCustomGestures(entries: CustomGestureEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ─── Shared collector singleton ───────────────────────────────────────────────

const collector = new DatasetCollector();

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: CustomGestureEntry["category"][] = [
  "greeting", "affirmation", "need", "emergency", "general",
];
const EMOJI_PRESETS = ["✋","👋","🙏","👍","❌","✅","💧","🍽️","💊","🆘","📞","😴"];

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
  const [expanded,   setExpanded]   = useState(false);
  const [activeTab,  setActiveTab]  = useState<"mapping" | "record">("mapping");

  // ── Mapping state ─────────────────────────────────────────────────────────
  const [entries,    setEntries]    = useState<CustomGestureEntry[]>(loadCustomGestures);
  const [label,      setLabel]      = useState("");
  const [sentence,   setSentence]   = useState("");
  const [sentenceTe, setSentenceTe] = useState("");
  const [emoji,      setEmoji]      = useState("✋");
  const [category,   setCategory]   = useState<CustomGestureEntry["category"]>("general");
  const [mapError,   setMapError]   = useState("");
  const [mapSaved,   setMapSaved]   = useState(false);

  // ── Recording state ───────────────────────────────────────────────────────
  const [recLabel,      setRecLabel]      = useState("");
  const [recording,     setRecording]     = useState(false);
  const [sampleCount,   setSampleCount]   = useState(0);
  const [totalSamples,  setTotalSamples]  = useState(0);
  const [recError,      setRecError]      = useState("");
  const rafRef = useRef<number | null>(null);
  const fvRef  = useRef<FeatureVector | null>(null);

  // Keep fvRef up-to-date without re-triggering the rAF loop
  useEffect(() => { fvRef.current = featureVector ?? null; }, [featureVector]);

  // ── Sample capture loop ───────────────────────────────────────────────────
  useEffect(() => {
    if (!recording) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      return;
    }
    const loop = () => {
      const fv = fvRef.current;
      if (fv && recLabel.trim()) {
        const result = collector.collect(recLabel.trim(), fv);
        if (result.ok) {
          setSampleCount(collector.countForLabel(recLabel.trim()));
          setTotalSamples(collector.totalSamples);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [recording, recLabel]);

  // Stop recording when session ends
  useEffect(() => {
    if (!sessionActive && recording) setRecording(false);
  }, [sessionActive, recording]);

  // ── Handlers — mapping ────────────────────────────────────────────────────
  const handleAddMapping = () => {
    setMapError("");
    const trimLabel = label.trim().toLowerCase();
    if (!trimLabel)       { setMapError("Gesture label is required."); return; }
    if (!sentence.trim()) { setMapError("English sentence is required."); return; }
    if (entries.some((e) => e.label === trimLabel)) {
      setMapError(`"${trimLabel}" already exists.`); return;
    }
    const entry: CustomGestureEntry = {
      label:       trimLabel,
      sentence:    sentence.trim(),
      sentence_te: sentenceTe.trim() || sentence.trim(),
      emoji,
      category,
    };
    const next = [...entries, entry];
    setEntries(next);
    saveCustomGestures(next);
    setLabel(""); setSentence(""); setSentenceTe(""); setEmoji("✋"); setCategory("general");
    setMapSaved(true);
    setTimeout(() => setMapSaved(false), 2000);
  };

  const handleDeleteMapping = (lbl: string) => {
    const next = entries.filter((e) => e.label !== lbl);
    setEntries(next);
    saveCustomGestures(next);
  };

  // ── Handlers — recording ──────────────────────────────────────────────────
  const handleStartRec = () => {
    setRecError("");
    if (!recLabel.trim()) { setRecError("Enter the gesture label first."); return; }
    if (!sessionActive)   { setRecError("Start a camera session first."); return; }
    setSampleCount(collector.countForLabel(recLabel.trim()));
    setRecording(true);
  };

  const handleStopRec = () => setRecording(false);

  const handleExport = () => {
    try {
      downloadDataset(collector.getSamples(), "json");
    } catch (e) {
      setRecError((e as Error).message);
    }
  };

  const handleClearLabel = () => {
    collector.clearLabel(recLabel.trim());
    setSampleCount(0);
    setTotalSamples(collector.totalSamples);
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
              {/* Tab switcher */}
              <div className="flex border-b border-ink-900/6">
                {(["mapping", "record"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
                      activeTab === tab
                        ? "border-b-2 border-signal-500 text-signal-700"
                        : "text-ink-400 hover:text-ink-700"
                    }`}
                  >
                    {tab === "mapping" ? "✏️ Add Mapping" : "🎥 Record Samples"}
                  </button>
                ))}
              </div>

              {/* ── Mapping tab ───────────────────────────────────────────── */}
              {activeTab === "mapping" && (
                <div className="flex flex-col gap-4 px-5 py-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-ink-700">
                        Gesture label <span className="text-coral-500">*</span>
                      </label>
                      <input
                        value={label}
                        onChange={(e) => { setLabel(e.target.value); setMapError(""); }}
                        placeholder="e.g. cold, happy, exit"
                        className="w-full rounded-xl border border-ink-900/10 bg-beige-50 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-signal-400 focus:outline-none focus:ring-2 focus:ring-signal-400/20"
                      />
                      <p className="mt-0.5 text-[10px] text-ink-400">Must match trained model label</p>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-ink-700">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as CustomGestureEntry["category"])}
                        className="w-full rounded-xl border border-ink-900/10 bg-beige-50 px-3 py-2 text-sm text-ink-700 focus:border-signal-400 focus:outline-none"
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-semibold text-ink-700">
                        English sentence <span className="text-coral-500">*</span>
                      </label>
                      <input
                        value={sentence}
                        onChange={(e) => setSentence(e.target.value)}
                        placeholder="e.g. I am feeling cold."
                        className="w-full rounded-xl border border-ink-900/10 bg-beige-50 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-signal-400 focus:outline-none focus:ring-2 focus:ring-signal-400/20"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-semibold text-ink-700">
                        Telugu sentence <span className="text-ink-400">(optional)</span>
                      </label>
                      <input
                        value={sentenceTe}
                        onChange={(e) => setSentenceTe(e.target.value)}
                        placeholder="e.g. నాకు చలిగా ఉంది."
                        className="w-full rounded-xl border border-ink-900/10 bg-beige-50 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-signal-400 focus:outline-none focus:ring-2 focus:ring-signal-400/20"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold text-ink-700">Emoji</label>
                      <div className="flex flex-wrap gap-1.5">
                        {EMOJI_PRESETS.map((e) => (
                          <button
                            key={e}
                            type="button"
                            onClick={() => setEmoji(e)}
                            className={`rounded-lg p-1.5 text-lg transition-all ${emoji === e ? "bg-signal-100 ring-2 ring-signal-400" : "bg-beige-50 hover:bg-beige-100"}`}
                          >{e}</button>
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
                    variant="primary" size="sm"
                    onClick={handleAddMapping}
                    leftIcon={<Plus className="h-4 w-4" />}
                    className={mapSaved ? "bg-mint-500 hover:bg-mint-600" : ""}
                  >
                    {mapSaved ? "Saved!" : "Add mapping"}
                  </Button>

                  {entries.length > 0 && (
                    <div className="border-t border-ink-900/6 pt-3">
                      <p className="mb-2 text-xs font-semibold text-ink-600">Custom gestures</p>
                      <div className="flex flex-col gap-1.5">
                        {entries.map((entry) => (
                          <div key={entry.label} className="flex items-center justify-between rounded-xl bg-beige-50 px-3 py-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-base">{entry.emoji}</span>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-ink-900 capitalize truncate">{entry.label}</p>
                                <p className="text-[10px] text-ink-500 truncate">{entry.sentence}</p>
                              </div>
                            </div>
                            <button onClick={() => handleDeleteMapping(entry.label)}
                              className="ml-2 shrink-0 rounded-lg p-1 text-ink-400 hover:bg-coral-500/10 hover:text-coral-500 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Record tab ─────────────────────────────────────────────── */}
              {activeTab === "record" && (
                <div className="flex flex-col gap-4 px-5 py-4">
                  <div className="rounded-xl bg-beige-50 px-4 py-3 text-xs text-ink-600 leading-relaxed">
                    <strong className="text-ink-800">How to collect:</strong> Enter the gesture label, start your camera session, show the gesture clearly, then press Record. Aim for 50–100 samples per gesture.
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-ink-700">
                      Gesture label <span className="text-coral-500">*</span>
                    </label>
                    <input
                      value={recLabel}
                      onChange={(e) => { setRecLabel(e.target.value); setRecError(""); }}
                      placeholder="e.g. cold, happy, exit"
                      disabled={recording}
                      className="w-full rounded-xl border border-ink-900/10 bg-beige-50 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-signal-400 focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  {/* Status row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-beige-50 px-3 py-2.5">
                      <p className="text-lg font-bold text-ink-900">{sampleCount}</p>
                      <p className="text-xs text-ink-500">This label</p>
                    </div>
                    <div className="rounded-xl bg-beige-50 px-3 py-2.5">
                      <p className="text-lg font-bold text-ink-900">{totalSamples}</p>
                      <p className="text-xs text-ink-500">Total samples</p>
                    </div>
                  </div>

                  {!sessionActive && (
                    <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                      <Camera className="h-3.5 w-3.5 shrink-0" />
                      Start a camera session first
                    </div>
                  )}

                  {recError && (
                    <div className="flex items-center gap-1.5 rounded-xl bg-coral-500/8 px-3 py-2 text-xs font-medium text-coral-600">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />{recError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!recording ? (
                      <Button
                        variant="primary" size="sm" fullWidth
                        onClick={handleStartRec}
                        disabled={!sessionActive}
                        className="bg-red-600 hover:bg-red-700"
                        leftIcon={<Circle className="h-3.5 w-3.5 fill-current" />}
                      >
                        Record
                      </Button>
                    ) : (
                      <Button
                        variant="secondary" size="sm" fullWidth
                        onClick={handleStopRec}
                        leftIcon={<Square className="h-3.5 w-3.5" />}
                      >
                        Stop
                      </Button>
                    )}
                    <button
                      onClick={handleClearLabel}
                      disabled={sampleCount === 0}
                      title="Clear samples for this label"
                      className="flex items-center justify-center rounded-xl border border-ink-900/10 px-3 py-2 text-ink-500 hover:border-coral-400 hover:text-coral-600 disabled:opacity-30 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {totalSamples > 0 && (
                    <Button
                      variant="secondary" size="sm"
                      onClick={handleExport}
                      leftIcon={<Download className="h-4 w-4" />}
                    >
                      Export dataset ({totalSamples} samples)
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
