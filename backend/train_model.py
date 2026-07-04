"""
SignSync — Gesture Classifier Training Entry Point
══════════════════════════════════════════════════
Orchestrates the full training pipeline using the ml/ modules.

Usage
─────
    python train_model.py                           # uses backend/dataset.json
    python train_model.py --dataset path/to/file.json
    python train_model.py --trees 300 --test-size 0.15

Output (saved to backend/)
──────────────────────────
    gesture_model.pkl   — trained RandomForestClassifier
    label_encoder.pkl   — fitted LabelEncoder
    model_meta.json     — accuracy + class names (for inference service)
"""

import argparse
import sys
from pathlib import Path

# ── ensure backend/ is on sys.path so ml.* imports work ──────────────────────
sys.path.insert(0, str(Path(__file__).parent))

from ml.dataset_loader import load_dataset, DatasetError
from ml.preprocessor   import preprocess
from ml.trainer        import train
from ml.evaluator      import evaluate, print_results
from ml.model_saver    import save_model

# ─── CLI ──────────────────────────────────────────────────────────────────────

parser = argparse.ArgumentParser(description="Train SignSync gesture classifier")
parser.add_argument("--dataset",   default="dataset.json",
                    help="Path to dataset JSON (default: dataset.json in backend/)")
parser.add_argument("--trees",     type=int,   default=200,
                    help="Number of Random Forest trees (default 200)")
parser.add_argument("--test-size", type=float, default=0.2, dest="test_size",
                    help="Test split fraction (default 0.2)")
parser.add_argument("--output",    default="gesture_model.pkl",
                    help="Model output filename (default gesture_model.pkl)")
args = parser.parse_args()

BACKEND_DIR = Path(__file__).parent

# Resolve dataset path — absolute or relative to backend/
dataset_path = Path(args.dataset)
if not dataset_path.is_absolute():
    dataset_path = BACKEND_DIR / dataset_path

# ─── Pipeline ─────────────────────────────────────────────────────────────────

W = 55
print(f"\n{'='*W}")
print(f"  SignSync — Gesture Classifier Training")
print(f"{'='*W}")

# 1. Load + validate
print(f"\n  [1/5] Loading dataset …")
try:
    dataset = load_dataset(dataset_path)
except DatasetError as exc:
    print(f"\n  ERROR: {exc}\n")
    sys.exit(1)

print(f"        {dataset.total_samples} samples  |  "
      f"{len(dataset.classes)} classes: {dataset.classes}")

# 2. Preprocess
print(f"\n  [2/5] Preprocessing …")
data = preprocess(dataset, test_size=args.test_size)
print(f"        Train: {data.n_train}  |  Test: {data.n_test}  |  "
      f"Classes: {data.n_classes}")

# Per-class sample counts
print(f"\n        Samples per class:")
import numpy as np
for cls, n in zip(*np.unique(
        [s["label"] for s in dataset.samples], return_counts=True)):
    print(f"          {cls:<22} {n}")

# 3. Train
print(f"\n  [3/5] Training Random Forest ({args.trees} trees) …")
clf = train(data, n_estimators=args.trees)
print(f"        Training complete.")

# 4. Evaluate
print(f"\n  [4/5] Evaluating …")
result = evaluate(clf, data)
print_results(result)

# 5. Save
print(f"  [5/5] Saving model …")
paths = save_model(
    clf=clf,
    le=data.label_encoder,
    result=result,
    output_dir=BACKEND_DIR,
    model_name=args.output,
)
print(f"        gesture_model → {paths.model_path}")
print(f"        label_encoder → {paths.encoder_path}")
print(f"        metadata      → {paths.meta_path}")

print(f"\n{'='*W}")
print(f"  DONE  |  Test accuracy: {result.test_accuracy:.1f}%")
print(f"{'='*W}\n")
