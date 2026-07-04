/**
 * Dataset Writer
 * ──────────────
 * Responsibility: serialize collected samples to JSON or CSV and
 * trigger a browser download.
 *
 * JSON format  (default, recommended for training):
 * {
 *   "version": 1,
 *   "feature_length": 126,
 *   "classes": ["Hello", "Yes", ...],
 *   "samples": [
 *     { "label": "Hello", "features": [0.12, -0.04, ...], "timestamp": 1712345678901 },
 *     ...
 *   ]
 * }
 *
 * CSV format (one row per sample):
 *   label,f0,f1,...,f125,timestamp
 *   Hello,0.12,-0.04,...,1712345678901
 *
 * The format is intentionally simple so sklearn / pandas can load it
 * directly without any transformation:
 *   df = pd.read_csv("dataset.csv")
 *   X  = df.iloc[:, 1:-1].values
 *   y  = df["label"].values
 */

import { FEATURE_LENGTH } from "./featureGenerator";
import type { DataSample } from "./datasetCollector";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExportFormat = "json" | "csv";

interface DatasetJson {
  version:        number;
  feature_length: number;
  classes:        string[];
  total_samples:  number;
  exported_at:    string;
  samples:        DataSample[];
}

// ─── Serializers ─────────────────────────────────────────────────────────────

function toJson(samples: DataSample[]): string {
  const classes = [...new Set(samples.map((s) => s.label))].sort();
  const payload: DatasetJson = {
    version:        1,
    feature_length: FEATURE_LENGTH,
    classes,
    total_samples:  samples.length,
    exported_at:    new Date().toISOString(),
    samples,
  };
  return JSON.stringify(payload, null, 2);
}

function toCsv(samples: DataSample[]): string {
  // Header row
  const featureCols = Array.from({ length: FEATURE_LENGTH }, (_, i) => `f${i}`);
  const header = ["label", ...featureCols, "timestamp"].join(",");

  const rows = samples.map((s) =>
    [
      `"${s.label.replace(/"/g, '""')}"`,  // quote-escape the label
      ...s.features.map((v) => v.toFixed(6)),
      s.timestamp,
    ].join(",")
  );

  return [header, ...rows].join("\n");
}

// ─── Download trigger ─────────────────────────────────────────────────────────

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Download the dataset as a file in the browser.
 * format: "json" (default) | "csv"
 */
export function downloadDataset(
  samples:  DataSample[],
  format:   ExportFormat = "json",
  basename: string       = "signsync_dataset",
): void {
  if (samples.length === 0) {
    throw new Error("Cannot export an empty dataset.");
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename  = `${basename}_${timestamp}.${format}`;

  if (format === "json") {
    triggerDownload(toJson(samples), filename, "application/json");
  } else {
    triggerDownload(toCsv(samples), filename, "text/csv");
  }
}
