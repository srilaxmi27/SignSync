"""
Model Trainer
─────────────
Responsibility: train the Random Forest classifier.
Returns the fitted model — no side effects (no saving, no printing).
"""

from __future__ import annotations

from sklearn.ensemble import RandomForestClassifier

from ml.preprocessor import PreparedData


def train(
    data:       PreparedData,
    n_estimators: int = 300,
    seed:         int = 42,
) -> RandomForestClassifier:
    """
    Fit a RandomForestClassifier on the training split.

    Parameters
    ----------
    data         : PreparedData from preprocessor
    n_estimators : number of trees (default 300)
    seed         : random state

    Returns
    -------
    Fitted RandomForestClassifier
    """
    clf = RandomForestClassifier(
        n_estimators=n_estimators,
        criterion="entropy",
        max_depth=15,            # regularize tree depth to prevent overfitting
        min_samples_leaf=3,      # regularize leaf sizes for smoother decision boundaries
        class_weight="balanced", # handle imbalanced datasets if any
        n_jobs=-1,               # use all CPU cores
        random_state=seed,
    )
    clf.fit(data.X_train, data.y_train)
    return clf
