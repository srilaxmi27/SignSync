import { DatasetCollector, type DataSample, type ValidationResult } from "./datasetCollector";
import { type FeatureVector } from "./featureGenerator";

export type { DataSample } from "./datasetCollector";

const STORAGE_KEY = "signsync.custom_gesture_samples";

export function loadCustomGestureSamples(): DataSample[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is DataSample => Boolean(item) && typeof item.label === "string" && Array.isArray(item.features));
  } catch {
    return [];
  }
}

export function saveCustomGestureSamples(samples: DataSample[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
}

export class PersistentDatasetCollector extends DatasetCollector {
  constructor() {
    super();
    const samples = loadCustomGestureSamples();
    for (const sample of samples) {
      super.collect(sample.label, {
        data: new Float32Array(sample.features),
        length: sample.features.length,
        handsEncoded: 1,
        isZero: false,
      });
    }
  }

  private persist(): void {
    saveCustomGestureSamples(this.getSamples());
  }

  override collect(label: string, fv: FeatureVector): ValidationResult {
    const result = super.collect(label, fv);
    if (result.ok) this.persist();
    return result;
  }

  override clearLabel(label: string): void {
    super.clearLabel(label);
    this.persist();
  }

  override clear(): void {
    super.clear();
    this.persist();
  }
}
