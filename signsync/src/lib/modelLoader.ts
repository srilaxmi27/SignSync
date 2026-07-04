/**
 * Model Loader
 * ────────────
 * Responsibility: fetch the serialised Random Forest JSON from the backend
 * and cache it in memory.
 *
 * The model is loaded once per browser session. A new fetch is triggered
 * automatically if the backend ETag changes (i.e. model was retrained).
 */

const MODEL_URL = `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/v1/model/gesture`;
const META_URL  = `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/api/v1/model/meta`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RFTree {
  children_left:  number[];
  children_right: number[];
  feature:        number[];
  threshold:      number[];
  value:          number[][];   // [node_idx][class_idx] → sample count
  n_node_samples: number[];
}

export interface RFModel {
  version:        number;
  feature_length: number;
  n_classes:      number;
  classes:        string[];
  n_estimators:   number;
  trees:          RFTree[];
}

export interface ModelMeta {
  classes:        string[];
  n_classes:      number;
  feature_length: number;
  train_accuracy: number;
  test_accuracy:  number;
  cv_accuracy:    number;
  n_train:        number;
  n_test:         number;
}

// ─── Cache ────────────────────────────────────────────────────────────────────

let cachedModel: RFModel | null = null;
let cachedEtag:  string | null  = null;
let loadPromise: Promise<RFModel> | null = null;

// ─── Loader ───────────────────────────────────────────────────────────────────

/**
 * Load the Random Forest model from the backend.
 * Uses ETag to avoid re-downloading after a retrain when called again.
 * Returns the cached model if the ETag has not changed.
 */
export async function loadModel(forceRefresh = false): Promise<RFModel> {
  // Return in-progress promise if a load is already running
  if (loadPromise && !forceRefresh) return loadPromise;

  loadPromise = (async () => {
    const headers: HeadersInit = {};
    if (cachedEtag && !forceRefresh) {
      headers["If-None-Match"] = cachedEtag;
    }

    const res = await fetch(MODEL_URL, { headers });

    if (res.status === 304 && cachedModel) {
      // Not modified — return cached version
      return cachedModel;
    }

    if (!res.ok) {
      throw new Error(
        `Failed to load gesture model (HTTP ${res.status}). ` +
        "Make sure the backend is running and export_model_json.py has been executed."
      );
    }

    const data: RFModel = await res.json();
    cachedModel = data;
    cachedEtag  = res.headers.get("ETag") ?? null;
    return data;
  })();

  return loadPromise;
}

export async function loadMeta(): Promise<ModelMeta> {
  const res = await fetch(META_URL);
  if (!res.ok) throw new Error(`Failed to load model meta (HTTP ${res.status})`);
  return res.json();
}

/** Clear cache — forces a full reload on next call. */
export function clearModelCache(): void {
  cachedModel = null;
  cachedEtag  = null;
  loadPromise = null;
}
