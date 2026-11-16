"""Explainability module for ReviewGuard.

Provides local and global feature importance analysis for NLP classification models.
Identifies influential words and phrases contributing to deceptive or truthful predictions.
"""

from typing import Any, Dict, Optional
import numpy as np
from sklearn.pipeline import Pipeline


def get_model_weights(pipeline: Pipeline) -> Optional[np.ndarray]:
    """Extract feature weights or log-odds ratios from the trained classifier.

    Supports:
    - LogisticRegression (coef_[0])
    - CalibratedClassifierCV with LinearSVC (mean of base estimators' coef_[0])
    - MultinomialNB (log-odds ratio: feature_log_prob_[1] - feature_log_prob_[0])

    Args:
        pipeline: Fitted scikit-learn Pipeline with 'tfidf' and 'classifier'.

    Returns:
        1D numpy array of weights corresponding to TF-IDF feature vocabulary, or None.
    """
    classifier = pipeline.named_steps.get("classifier")
    if classifier is None:
        return None

    # Case 1: Logistic Regression
    if hasattr(classifier, "coef_"):
        coef = classifier.coef_
        if coef.ndim == 2 and coef.shape[0] == 1:
            return coef[0]
        return coef

    # Case 2: CalibratedClassifierCV
    if hasattr(classifier, "calibrated_classifiers_"):
        weights_list = []
        for cal_clf in classifier.calibrated_classifiers_:
            base_est = getattr(cal_clf, "estimator", None)
            if base_est is not None and hasattr(base_est, "coef_"):
                weights_list.append(base_est.coef_[0])
        if weights_list:
            return np.mean(weights_list, axis=0)

    # Case 3: Multinomial Naive Bayes (log-odds ratio for class 1 vs class 0)
    if hasattr(classifier, "feature_log_prob_"):
        log_prob_deceptive = classifier.feature_log_prob_[1]
        log_prob_truthful = classifier.feature_log_prob_[0]
        return log_prob_deceptive - log_prob_truthful

    # Case 4: Random Forest (feature importances are non-negative, don't show direction)
    if hasattr(classifier, "feature_importances_"):
        return classifier.feature_importances_

    return None


def explain_single_prediction(
    pipeline: Pipeline,
    review_text: str,
    top_k: int = 6,
) -> Dict[str, Any]:
    """Generate local term-level explanations for an individual review prediction.

    Calculates feature contribution as: TF-IDF weight * model coefficient.

    Args:
        pipeline: Fitted ReviewGuard pipeline.
        review_text: Input text string.
        top_k: Number of positive and negative influential terms to retrieve.

    Returns:
        Dictionary containing deceptive cues, truthful cues, and academic disclaimer.
    """
    disclaimer = (
        "Notice: Feature importance indicates statistical model association within "
        "the training corpus, not definitive proof of deception."
    )

    tfidf = pipeline.named_steps.get("tfidf")
    if tfidf is None:
        return {"deceptive_cues": [], "truthful_cues": [], "disclaimer": disclaimer}

    weights = get_model_weights(pipeline)
    if weights is None:
        return {
            "deceptive_cues": [],
            "truthful_cues": [],
            "disclaimer": disclaimer,
            "note": "Explainability not available for this model type.",
        }

    # Vectorize input review
    feature_names = tfidf.get_feature_names_out()
    tfidf_vector = tfidf.transform([review_text]).toarray()[0]

    # Find non-zero features present in the review
    non_zero_indices = np.nonzero(tfidf_vector)[0]

    if len(non_zero_indices) == 0:
        return {
            "deceptive_cues": [],
            "truthful_cues": [],
            "disclaimer": disclaimer,
            "note": "No vocabulary terms matched the trained model's feature space.",
        }

    contributions = []
    for idx in non_zero_indices:
        term = feature_names[idx]
        val = tfidf_vector[idx]
        w = weights[idx]
        score = float(val * w)
        contributions.append({"term": term, "score": score, "tfidf": float(val), "weight": float(w)})

    # Sort contributions: positive = deceptive, negative = truthful
    sorted_by_score = sorted(contributions, key=lambda x: x["score"], reverse=True)

    deceptive_cues = [
        {"term": item["term"], "score": round(item["score"], 4)}
        for item in sorted_by_score
        if item["score"] > 0
    ][:top_k]

    truthful_cues = [
        {"term": item["term"], "score": round(abs(item["score"]), 4)}
        for item in reversed(sorted_by_score)
        if item["score"] < 0
    ][:top_k]

    return {
        "deceptive_cues": deceptive_cues,
        "truthful_cues": truthful_cues,
        "total_active_features": len(non_zero_indices),
        "disclaimer": disclaimer,
    }
