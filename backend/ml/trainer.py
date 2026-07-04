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
    n_estimators: int = 200,
    seed:         int = 42,
) -> RandomForestClassifier:
    """
    Fit a RandomForestClassifier on the training split.

    Parameters
    ----------
    data         : PreparedData from preprocessor
    n_estimators : number of trees (default 200)
    seed         : random state

    Returns
    -------
    Fitted RandomForestClassifier
    """
    clf = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=None,          # grow fully — RF handles overfitting via averaging
        min_samples_leaf=1,
        n_jobs=-1,               # use all CPU cores
        random_state=seed,
    )
    clf.fit(data.X_train, data.y_train)
    return clf
