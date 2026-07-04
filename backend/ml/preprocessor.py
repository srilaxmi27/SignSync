"""
Data Preprocessor
─────────────────
Responsibility: convert RawDataset into NumPy arrays suitable for
sklearn, encode labels, and split into train/test sets.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

from ml.dataset_loader import RawDataset


# ─── Types ────────────────────────────────────────────────────────────────────

@dataclass
class PreparedData:
    X_train:      np.ndarray       # (n_train, 126) float32
    X_test:       np.ndarray       # (n_test,  126) float32
    y_train:      np.ndarray       # (n_train,) int
    y_test:       np.ndarray       # (n_test,)  int
    X_full:       np.ndarray       # full array before split — for CV
    y_full:       np.ndarray       # full labels before split
    label_encoder: LabelEncoder
    class_names:  list[str]
    n_classes:    int
    n_train:      int
    n_test:       int


# ─── Preprocessor ─────────────────────────────────────────────────────────────

def preprocess(
    dataset:   RawDataset,
    test_size: float = 0.2,
    seed:      int   = 42,
) -> PreparedData:
    """
    Convert a RawDataset into train/test splits with encoded labels.

    Parameters
    ----------
    dataset   : loaded RawDataset
    test_size : fraction for testing (default 0.2)
    seed      : random seed for reproducibility

    Returns
    -------
    PreparedData
    """
    samples = dataset.samples

    # ── Build feature matrix ──────────────────────────────────────────────
    X = np.array([s["features"] for s in samples], dtype=np.float32)
    y_raw = np.array([s["label"] for s in samples])

    # Clean NaN / Inf (defensive — should not appear in normal exports)
    if np.isnan(X).any() or np.isinf(X).any():
        print("  WARNING: NaN/Inf values found — replacing with 0.")
        X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)

    # ── Encode labels ─────────────────────────────────────────────────────
    le = LabelEncoder()
    y  = le.fit_transform(y_raw)

    # ── Train / test split ────────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=test_size,
        random_state=seed,
        stratify=y,     # preserve class proportions in both splits
    )

    # ── Data Augmentation ─────────────────────────────────────────────────
    # Duplicate training samples with small Gaussian noise to improve accuracy/generalization
    rng = np.random.default_rng(seed)
    noise = rng.normal(0, 0.003, X_train.shape).astype(np.float32)
    X_train_aug = X_train.copy()
    # Apply noise only to non-zero elements to avoid corrupting empty hands
    non_zero_mask = X_train != 0.0
    X_train_aug[non_zero_mask] += noise[non_zero_mask]

    X_train = np.vstack([X_train, X_train_aug])
    y_train = np.hstack([y_train, y_train])

    return PreparedData(
        X_train=X_train,
        X_test=X_test,
        y_train=y_train,
        y_test=y_test,
        X_full=X,
        y_full=y,
        label_encoder=le,
        class_names=list(map(str, le.classes_)),
        n_classes=len(le.classes_),
        n_train=len(X_train),
        n_test=len(X_test),
    )
