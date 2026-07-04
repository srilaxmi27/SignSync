"""
Model Evaluator
───────────────
Responsibility: measure and report classifier performance.
Pure functions — no side effects except printing.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import cross_val_score

from ml.preprocessor import PreparedData


# ─── Types ────────────────────────────────────────────────────────────────────

@dataclass
class EvaluationResult:
    train_accuracy:    float           # 0-100 %
    test_accuracy:     float           # 0-100 %
    cv_mean:           float           # cross-val mean accuracy 0-100 %
    cv_std:            float           # cross-val std
    n_classes:         int
    class_names:       list[str]
    n_train:           int
    n_test:            int
    report:            str             # full sklearn classification_report string
    top_features:      list[dict]      # top-10 most important features


# ─── Evaluator ────────────────────────────────────────────────────────────────

def evaluate(
    clf:  RandomForestClassifier,
    data: PreparedData,
    cv_folds: int = 5,
) -> EvaluationResult:
    """
    Evaluate the trained classifier on train, test, and cross-validation.

    Parameters
    ----------
    clf      : fitted RandomForestClassifier
    data     : PreparedData (contains splits + label encoder)
    cv_folds : number of cross-validation folds

    Returns
    -------
    EvaluationResult
    """
    # Training accuracy
    y_train_pred   = clf.predict(data.X_train)
    train_accuracy = (y_train_pred == data.y_train).mean() * 100

    # Test accuracy
    y_test_pred   = clf.predict(data.X_test)
    test_accuracy = (y_test_pred == data.y_test).mean() * 100

    # Classification report (per-class precision / recall / F1)
    report = classification_report(
        data.y_test,
        y_test_pred,
        target_names=data.class_names,
        zero_division=0,
    )

    # Cross-validation on full dataset
    n_splits = min(cv_folds, data.n_classes)
    cv_scores = cross_val_score(
        clf, data.X_full, data.y_full,
        cv=n_splits,
        scoring="accuracy",
        n_jobs=-1,
    )
    cv_mean = cv_scores.mean() * 100
    cv_std  = cv_scores.std()  * 100

    # Top-10 feature importances with human-readable labels
    importances = clf.feature_importances_
    top_idx     = np.argsort(importances)[::-1][:10]
    top_features = []
    for rank, idx in enumerate(top_idx, 1):
        hand  = "Left"  if idx < 63 else "Right"
        lm    = (idx % 63) // 3
        coord = ["x", "y", "z"][(idx % 63) % 3]
        top_features.append({
            "rank":       rank,
            "index":      int(idx),
            "hand":       hand,
            "landmark":   lm,
            "coord":      coord,
            "importance": float(importances[idx]),
        })

    return EvaluationResult(
        train_accuracy=round(train_accuracy, 2),
        test_accuracy=round(test_accuracy, 2),
        cv_mean=round(cv_mean, 2),
        cv_std=round(cv_std, 2),
        n_classes=data.n_classes,
        class_names=data.class_names,
        n_train=data.n_train,
        n_test=data.n_test,
        report=report,
        top_features=top_features,
    )


def print_results(result: EvaluationResult) -> None:
    """Pretty-print evaluation results to stdout."""
    w = 55
    print(f"\n{'='*w}")
    print(f"  EVALUATION RESULTS")
    print(f"{'='*w}")
    print(f"  Gesture classes  : {result.n_classes}  {result.class_names}")
    print(f"  Training samples : {result.n_train}")
    print(f"  Testing  samples : {result.n_test}")
    print(f"  Train accuracy   : {result.train_accuracy:.1f}%")
    print(f"  Test  accuracy   : {result.test_accuracy:.1f}%")
    print(f"  CV accuracy      : {result.cv_mean:.1f}% ± {result.cv_std:.1f}%")
    print(f"\n  Per-class report:")
    for line in result.report.splitlines():
        print(f"    {line}")
    print(f"\n  Top-10 most important features:")
    for f in result.top_features:
        print(
            f"    {f['rank']:2}. [{f['index']:3}] {f['hand']} LM{f['landmark']:2} "
            f"{f['coord']}  →  {f['importance']:.4f}"
        )
    print(f"{'='*w}\n")
