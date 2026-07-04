"""
Dataset Loader
──────────────
Responsibility: read the exported JSON dataset from disk, validate its
structure, and return raw Python objects for downstream processing.

Raises meaningful DatasetError instead of crashing on bad input.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import List


# ─── Errors ───────────────────────────────────────────────────────────────────

class DatasetError(Exception):
    """Raised for any dataset problem that should abort training."""


# ─── Config ───────────────────────────────────────────────────────────────────

REQUIRED_FEATURE_LENGTH = 126
MIN_SAMPLES             = 10
MIN_CLASSES             = 2


# ─── Types ────────────────────────────────────────────────────────────────────

@dataclass
class RawDataset:
    samples:        List[dict]   # list of {label, features, timestamp?}
    feature_length: int
    classes:        List[str]
    total_samples:  int
    source_path:    Path


# ─── Loader ───────────────────────────────────────────────────────────────────

def load_dataset(path: str | Path) -> RawDataset:
    """
    Load and structurally validate a SignSync JSON dataset file.

    Parameters
    ----------
    path : path to the exported dataset.json

    Returns
    -------
    RawDataset — validated raw dataset ready for preprocessing

    Raises
    ------
    DatasetError — if the file is missing, malformed, or too small to train on
    """
    path = Path(path)

    # ── File existence ────────────────────────────────────────────────────
    if not path.exists():
        raise DatasetError(
            f"Dataset file not found: {path}\n"
            "Export your dataset from the SignSync dashboard and place it "
            "in the backend/ folder as dataset.json"
        )

    # ── Parse JSON ────────────────────────────────────────────────────────
    try:
        with open(path, encoding="utf-8") as f:
            raw = json.load(f)
    except json.JSONDecodeError as exc:
        raise DatasetError(f"Dataset file is not valid JSON: {exc}") from exc

    # ── Required keys ─────────────────────────────────────────────────────
    for key in ("samples", "feature_length", "classes"):
        if key not in raw:
            raise DatasetError(f"Dataset missing required key: '{key}'")

    samples        = raw["samples"]
    feature_length = int(raw["feature_length"])
    classes        = raw["classes"]

    # ── Feature length ────────────────────────────────────────────────────
    if feature_length != REQUIRED_FEATURE_LENGTH:
        raise DatasetError(
            f"Feature length mismatch: dataset has {feature_length}, "
            f"expected {REQUIRED_FEATURE_LENGTH}. "
            "Re-export the dataset from the current version of SignSync."
        )

    # ── Minimum samples ───────────────────────────────────────────────────
    if len(samples) < MIN_SAMPLES:
        raise DatasetError(
            f"Dataset has only {len(samples)} samples. "
            f"Need at least {MIN_SAMPLES}. Collect more data."
        )

    # ── Minimum classes ───────────────────────────────────────────────────
    actual_classes = list({s["label"] for s in samples})
    if len(actual_classes) < MIN_CLASSES:
        raise DatasetError(
            f"Dataset has only {len(actual_classes)} gesture class. "
            f"Need at least {MIN_CLASSES} different gestures."
        )

    # ── Each sample has a features array of the right length ─────────────
    bad = [
        i for i, s in enumerate(samples)
        if len(s.get("features", [])) != REQUIRED_FEATURE_LENGTH
    ]
    if bad:
        raise DatasetError(
            f"{len(bad)} samples have wrong feature length "
            f"(first bad index: {bad[0]}). Dataset may be corrupted."
        )

    return RawDataset(
        samples=samples,
        feature_length=feature_length,
        classes=classes,
        total_samples=len(samples),
        source_path=path,
    )
