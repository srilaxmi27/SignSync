"""
Export trained Random Forest model to browser-compatible JSON.

The browser cannot load .pkl files directly. This script reads
gesture_model.pkl + label_encoder.pkl and writes gesture_model.json
which the FastAPI server will serve to the frontend.

Usage:
    python export_model_json.py

Output:
    backend/gesture_model.json
"""

import json
import sys
from pathlib import Path

import joblib
import numpy as np

BACKEND = Path(__file__).parent

model_path   = BACKEND / "gesture_model.pkl"
encoder_path = BACKEND / "label_encoder.pkl"
out_path     = BACKEND / "gesture_model.json"

if not model_path.exists():
    print("ERROR: gesture_model.pkl not found. Run train_model.py first.")
    sys.exit(1)

print("Loading model…")
clf = joblib.load(model_path)
le  = joblib.load(encoder_path)

# ── Serialize each tree ───────────────────────────────────────────────────────

def export_tree(tree) -> dict:
    """Convert a single DecisionTreeClassifier's internal arrays to plain lists."""
    t = tree.tree_
    return {
        "children_left":  t.children_left.tolist(),
        "children_right": t.children_right.tolist(),
        "feature":        t.feature.tolist(),
        "threshold":      [round(float(v), 6) for v in t.threshold],
        # value shape: (n_nodes, n_outputs, max_n_classes) — take [node][0]
        "value":          [[int(x) for x in v[0]] for v in t.value],
        "n_node_samples": t.n_node_samples.tolist(),
    }

print(f"Exporting {len(clf.estimators_)} trees…")
trees = [export_tree(est) for est in clf.estimators_]

payload = {
    "version":        2,
    "feature_length": 126,
    "n_classes":      len(le.classes_),
    "classes":        [str(c) for c in le.classes_],
    "n_estimators":   len(trees),
    "trees":          trees,
}

out_path.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
size_kb = out_path.stat().st_size / 1024
print(f"Saved -> {out_path}  ({size_kb:.0f} KB)")
print("Done.")
