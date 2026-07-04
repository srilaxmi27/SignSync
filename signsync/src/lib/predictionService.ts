/**
 * Prediction Service
 * ──────────────────
 * Responsibility: run a single Random Forest inference on a Float32Array
 * feature vector and return class probabilities.
 *
 * The RF is evaluated entirely in JS — no network round-trip.
 * Each tree is a decision tree walk: O(depth) per tree, O(n_trees × depth)
 * total. For 200 trees of depth ~20 this is ~4000 comparisons — sub-ms
 * on any modern CPU.
 */

import type { RFModel, RFTree } from "./modelLoader";
import type { FeatureVector }   from "./featureGenerator";

// Sklearn TREE_LEAF sentinel
const LEAF = -1;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PredictionResult {
  label:        string;          // winning class name
  classIndex:   number;          // integer class index
  confidence:   number;          // 0-1 fraction of trees that voted for label
  probabilities: number[];       // per-class vote fraction (length = n_classes)
  latencyMs:    number;          // inference time in ms
}

// ─── Single-tree inference ────────────────────────────────────────────────────

function predictTree(tree: RFTree, features: Float32Array): number[] {
  let node = 0;
  while (tree.children_left[node] !== LEAF) {
    const feat = tree.feature[node];
    if (features[feat] <= tree.threshold[node]) {
      node = tree.children_left[node];
    } else {
      node = tree.children_right[node];
    }
  }
  return tree.value[node];   // sample counts per class at this leaf
}

// ─── Forest inference ─────────────────────────────────────────────────────────

export function predict(
  model:    RFModel,
  fv:       FeatureVector,
  threshold: number = 0.0,
): PredictionResult | null {
  if (fv.isZero || fv.handsEncoded === 0) return null;

  const t0       = performance.now();
  const features = fv.data;
  const nClasses = model.n_classes;

  // Accumulate vote counts across all trees
  const votes = new Float64Array(nClasses);
  for (const tree of model.trees) {
    const leaf = predictTree(tree, features);
    // leaf is raw sample counts — add normalised vote (majority class gets 1 vote)
    let maxCount = 0;
    let maxIdx   = 0;
    for (let c = 0; c < leaf.length; c++) {
      if (leaf[c] > maxCount) { maxCount = leaf[c]; maxIdx = c; }
    }
    votes[maxIdx] += 1;
  }

  // Convert to probabilities
  const total         = model.n_estimators;
  const probabilities = Array.from(votes).map((v) => v / total);

  // Winning class
  let bestIdx = 0;
  for (let c = 1; c < nClasses; c++) {
    if (probabilities[c] > probabilities[bestIdx]) bestIdx = c;
  }

  const confidence = probabilities[bestIdx];
  const latencyMs  = performance.now() - t0;

  if (confidence < threshold) return null;   // below confidence threshold

  return {
    label:         model.classes[bestIdx],
    classIndex:    bestIdx,
    confidence,
    probabilities,
    latencyMs,
  };
}
