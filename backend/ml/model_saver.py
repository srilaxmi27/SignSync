"""
Model Saver
───────────
Responsibility: persist the trained model and label encoder to disk
using pickle (via joblib for efficiency).

Output files:
    gesture_model.pkl  — trained RandomForestClassifier
    label_encoder.pkl  — fitted LabelEncoder

These files are loaded directly by the prediction service
without retraining.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

from ml.evaluator import EvaluationResult


# ─── Types ────────────────────────────────────────────────────────────────────

@dataclass
class SavedPaths:
    model_path:   Path
    encoder_path: Path
    meta_path:    Path


# ─── Saver ────────────────────────────────────────────────────────────────────

def save_model(
    clf:        RandomForestClassifier,
    le:         LabelEncoder,
    result:     EvaluationResult,
    output_dir: str | Path = ".",
    model_name: str        = "gesture_model.pkl",
) -> SavedPaths:
    """
    Save the classifier, label encoder, and a JSON metadata file.

    Parameters
    ----------
    clf        : fitted RandomForestClassifier
    le         : fitted LabelEncoder
    result     : EvaluationResult for metadata
    output_dir : directory to save files (default: current directory)
    model_name : filename for the model pickle

    Returns
    -------
    SavedPaths with absolute paths to each saved file
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    model_path   = output_dir / model_name
    encoder_path = output_dir / "label_encoder.pkl"
    meta_path    = output_dir / "model_meta.json"

    # ── Pickle model + encoder ────────────────────────────────────────────
    joblib.dump(clf, model_path)
    joblib.dump(le,  encoder_path)

    # ── JSON metadata (human-readable, useful for the inference service) ──
    meta = {
        "classes":        result.class_names,
        "n_classes":      result.n_classes,
        "feature_length": 126,
        "train_accuracy": result.train_accuracy,
        "test_accuracy":  result.test_accuracy,
        "cv_accuracy":    result.cv_mean,
        "n_train":        result.n_train,
        "n_test":         result.n_test,
        "model_file":     model_name,
        "encoder_file":   "label_encoder.pkl",
    }
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

    return SavedPaths(
        model_path=model_path.resolve(),
        encoder_path=encoder_path.resolve(),
        meta_path=meta_path.resolve(),
    )
