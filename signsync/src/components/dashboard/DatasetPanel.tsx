/**
 * DatasetPanel — Developer Dataset Collection UI
 * ───────────────────────────────────────────────
 * Allows collecting normalized gesture landmark samples while the
 * camera session is running.
 *
 * Responsibilities here: UI only.
 * All validation and storage logic lives in datasetCollector.ts.
 * All serialization logic lives in datasetWriter.ts.
 *
 * Props:
 *   featureVector  – latest vector from useLandmarkPipeline (or null)
 *   sessionActive  – collection is only allowed while camera is on
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Play, Square, Download, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { DatasetCollector } from "@/lib/datasetCollector";
import { downloadDataset, type ExportFormat } from "@/lib/datasetWriter";
import type { FeatureVector } from "@/lib/featureGenerator";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DatasetPanelProps {
  featureVector:  FeatureVector | null;
  sessionActive:  boolean;
}

type CollectionStatus = "idle" | "collecting" | "paused";

interface Toast {
  id:      number;
  type:    "success" | "error" | "info";
  message: string;
}

// ─── Singleton collector (persists across re-renders) ─────────────────────────
const collector = new DatasetCollector();

// ─── Component ────────────────────────────────────────────────────────────────

export default function DatasetPanel({ featureVector, sessionActive }: DatasetPanelProps) {
  const [label,            setLabel]            = useState("");
  const [status,           setStatus]           = useState<CollectionStatus>("idle");
  const [samplesForLabel,  setSamplesForLabel]  = useState(0);
  const [totalSamples,     setTotalSamples]     = useState(0);
  const [labelCounts,      setLabelCounts]      = useState<Record<string, number>>({});
  const [exportFormat,     setExportFormat]     = useState<ExportFormat>("json");
  const [toasts,           setToasts]           = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const isCollecting = status === "collecting";

  // ── Toast helpers ────────────────────────────────────────────────────────
  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  // ── Refresh display counts ────────────────────────────────────────────────
  const refreshCounts = useCallback(() => {
    setTotalSamples(collector.totalSamples);
    setSamplesForLabel(label.trim() ? collector.countForLabel(label.trim()) : 0);
    const counts: Record<string, number> = {};
    for (const l of collector.labels) counts[l] = collector.countForLabel(l);
    setLabelCounts(counts);
  }, [label]);

  // ── Capture one sample (called in rAF via effect) ─────────────────────────
  const captureRef = useRef<(() => void) | null>(null);
  captureRef.current = useCallback(() => {
    if (!featureVector || !isCollecting) return;
    const result = collector.collect(label, featureVector);
    if (result.ok) {
      refreshCounts();
    }
    // silently skip invalid detections — don't toast every skipped frame
  }, [featureVector, isCollecting, label, refreshCounts]);

  // ── Auto-capture loop while collecting ────────────────────────────────────
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isCollecting) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      return;
    }
    const loop = () => {
      captureRef.current?.();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    };
  }, [isCollecting]);

  // ── Stop collecting when session ends ────────────────────────────────────
  useEffect(() => {
    if (!sessionActive && isCollecting) {
      setStatus("idle");
      addToast("info", "Collection stopped — session ended.");
    }
  }, [sessionActive, isCollecting, addToast]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleStart = () => {
    if (!label.trim()) {
      addToast("error", "Enter a gesture label before collecting.");
      return;
    }
    if (!sessionActive) {
      addToast("error", "Start a camera session first.");
      return;
    }
    setStatus("collecting");
    addToast("success", `Collecting samples for "${label.trim()}"`);
  };

  const handleStop = () => {
    setStatus("idle");
    addToast("info", `Stopped. ${samplesForLabel} samples for "${label.trim()}"`);
  };

  const handleClearLabel = () => {
    if (!label.trim()) return;
    collector.clearLabel(label.trim());
    refreshCounts();
    addToast("info", `Cleared all samples for "${label.trim()}"`);
  };

  const handleClearAll = () => {
    collector.clear();
    refreshCounts();
    addToast("info", "All samples cleared.");
  };

  const handleExport = () => {
    try {
      downloadDataset(collector.getSamples(), exportFormat);
      addToast("success", `Downloaded dataset as .${exportFormat}`);
    } catch (e) {
      addToast("error", (e as Error).message);
    }
  };

  // Refresh label count whenever label input changes
  useEffect(() => { refreshCounts(); }, [label, refreshCounts]);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="relative rounded-xl2 border border-ink-900/8 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink-900/6 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-signal-50">
            <Database className="h-4 w-4 text-signal-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-ink-900">Dataset Collector</p>
            <p className="text-xs text-ink-400">Dev tool — capture gesture samples</p>
          </div>
        </div>
        {/* Status pill */}
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          isCollecting
            ? "bg-mint-400/15 text-mint-600"
            : "bg-ink-900/5 text-ink-500"
        }`}>
          {isCollecting ? "● Collecting" : "Idle"}
        </span>
      </div>

      <div className="flex flex-col gap-4 p-5">
        {/* Label input */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-700">
            Gesture label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Hello, Thank You, Yes…"
            disabled={isCollecting}
            className="w-full rounded-xl border border-ink-900/10 bg-beige-50 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-signal-400 focus:outline-none focus:ring-2 focus:ring-signal-400/20 disabled:opacity-50"
          />
          {label.trim() && (
            <p className="mt-1 text-xs text-ink-400">
              {samplesForLabel} sample{samplesForLabel !== 1 ? "s" : ""} collected for this label
            </p>
          )}
        </div>

        {/* Collect / Stop */}
        <div className="flex gap-2">
          {!isCollecting ? (
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={handleStart}
              disabled={!sessionActive}
              leftIcon={<Play className="h-3.5 w-3.5" />}
            >
              Start collecting
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={handleStop}
              leftIcon={<Square className="h-3.5 w-3.5" />}
            >
              Stop
            </Button>
          )}
          <button
            onClick={handleClearLabel}
            disabled={isCollecting || !label.trim() || samplesForLabel === 0}
            title="Clear samples for this label"
            className="flex items-center justify-center rounded-xl border border-ink-900/10 px-3 py-2 text-ink-500 hover:border-coral-400 hover:text-coral-600 disabled:opacity-30 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          {[
            ["Total samples", totalSamples],
            ["Labels", Object.keys(labelCounts).length],
          ].map(([k, v]) => (
            <div key={k as string} className="rounded-xl bg-beige-50 px-3 py-2.5">
              <p className="text-lg font-bold text-ink-900">{v}</p>
              <p className="text-xs text-ink-500">{k}</p>
            </div>
          ))}
        </div>

        {/* Per-label breakdown */}
        {Object.keys(labelCounts).length > 0 && (
          <div className="rounded-xl border border-ink-900/6 bg-beige-50 px-3 py-2.5">
            <p className="mb-2 text-xs font-semibold text-ink-600">Samples per label</p>
            <div className="flex flex-col gap-1">
              {Object.entries(labelCounts).map(([l, n]) => (
                <div key={l} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink-700">{l}</span>
                  <span className="font-bold text-signal-600">{n}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export controls */}
        <div className="flex gap-2 border-t border-ink-900/6 pt-3">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
            className="flex-1 rounded-xl border border-ink-900/10 bg-beige-50 px-3 py-2 text-xs text-ink-700 focus:outline-none focus:border-signal-400"
          >
            <option value="json">JSON (recommended)</option>
            <option value="csv">CSV (pandas/sklearn)</option>
          </select>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            disabled={totalSamples === 0}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Export
          </Button>
          <button
            onClick={handleClearAll}
            disabled={totalSamples === 0}
            title="Clear entire dataset"
            className="flex items-center justify-center rounded-xl border border-ink-900/10 px-3 py-2 text-ink-500 hover:border-coral-400 hover:text-coral-600 disabled:opacity-30 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Camera not active warning */}
        {!sessionActive && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            Start a camera session to enable collection.
          </p>
        )}
      </div>

      {/* Toast notifications */}
      <div className="absolute bottom-full left-0 right-0 mb-2 flex flex-col-reverse gap-1.5 px-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold shadow-soft ${
                t.type === "success" ? "bg-mint-400/10 text-mint-600" :
                t.type === "error"   ? "bg-coral-500/10 text-coral-600" :
                "bg-signal-50 text-signal-700"
              }`}
            >
              {t.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> :
               t.type === "error"   ? <AlertCircle  className="h-3.5 w-3.5 shrink-0" /> :
               null}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
