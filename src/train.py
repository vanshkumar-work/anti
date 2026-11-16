"""Machine Learning Model Training, Comparison, and Pipeline Packaging.

Trains, cross-validates, and evaluates four candidate algorithms:
1. Multinomial Naive Bayes
2. Logistic Regression
3. Calibrated Linear Support Vector Machine
4. Random Forest Classifier

Selects the best performing model based on test F1-score and ROC-AUC,
packaging the complete end-to-end NLP pipeline with Joblib.
"""

import json
import logging
import os
import time
from typing import Any, Dict, Tuple
import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

from src.data_loader import (
    DEFAULT_PROCESSED_PATH,
    DEFAULT_RAW_PATH,
    download_dataset,
    load_raw_dataset,
)
from src.evaluate import (
    compute_evaluation_metrics,
    plot_confusion_matrix,
    plot_model_comparison_bars,
    plot_precision_recall_curves,
    plot_roc_curves,
    save_evaluation_results,
)
from src.preprocessing import build_tfidf_vectorizer, clean_dataframe

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

RANDOM_STATE = 42
MODELS_DIR = "models"
REPORTS_DIR = os.path.join("reports", "evaluation")


def get_candidate_classifiers() -> Dict[str, Any]:
    """Define the 4 candidate machine learning algorithms for opinion spam detection."""
    return {
        "Multinomial Naive Bayes": MultinomialNB(alpha=0.1),
        "Logistic Regression": LogisticRegression(
            C=1.0, max_iter=1000, random_state=RANDOM_STATE, solver="lbfgs"
        ),
        "Linear SVM (Calibrated)": CalibratedClassifierCV(
            estimator=LinearSVC(C=1.0, random_state=RANDOM_STATE, dual=False),
            cv=5,
            method="sigmoid",
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=100,
            max_depth=50,
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),
    }


def train_and_evaluate_all(
    raw_data_path: str = DEFAULT_RAW_PATH,
    models_dir: str = MODELS_DIR,
    reports_dir: str = REPORTS_DIR,
) -> Tuple[Pipeline, Dict[str, Any]]:
    """Complete workflow for model training, cross-validation, evaluation, and selection.

    Args:
        raw_data_path: Path to raw dataset CSV.
        models_dir: Directory where the best pipeline and metadata are saved.
        reports_dir: Directory where evaluation artifacts are stored.

    Returns:
        Tuple of (champion_pipeline, metadata_dictionary).
    """
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(reports_dir, exist_ok=True)

    # 1. Load and clean raw dataset
    logger.info("Step 1: Loading raw dataset...")
    df_raw = load_raw_dataset(raw_data_path)
    df_clean = clean_dataframe(df_raw, text_column="text")

    # Save processed dataset
    os.makedirs(os.path.dirname(DEFAULT_PROCESSED_PATH), exist_ok=True)
    df_clean.to_csv(DEFAULT_PROCESSED_PATH, index=False)
    logger.info(f"Cleaned dataset saved to {DEFAULT_PROCESSED_PATH} ({len(df_clean)} records).")

    # Use standard numpy object array to ensure compatibility across pandas/pyarrow versions
    X = np.array(df_clean["text"].tolist(), dtype=object)
    y = np.array(df_clean["label"].tolist(), dtype=int)

    # 2. Stratified train/test split (Zero data leakage: vectorizer fitted only on X_train)
    logger.info("Step 2: Splitting dataset (80% train, 20% test, stratified)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
    )

    logger.info(
        f"Training set: {len(X_train)} samples (Deceptive: {(y_train == 1).sum()}, Truthful: {(y_train == 0).sum()})"
    )
    logger.info(
        f"Testing set:  {len(X_test)} samples (Deceptive: {(y_test == 1).sum()}, Truthful: {(y_test == 0).sum()})"
    )

    candidate_classifiers = get_candidate_classifiers()
    model_results = {}
    model_probas = {}
    pipelines = {}
    comparison_records = []

    # 3. Train, Cross-Validate, and Evaluate each model
    logger.info("Step 3: Training and cross-validating candidate algorithms...")
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

    for name, clf in candidate_classifiers.items():
        logger.info(f"--- Training algorithm: {name} ---")
        start_time = time.time()

        # Build pipeline containing TF-IDF Vectorizer and the Classifier
        pipeline = Pipeline(
            [
                ("tfidf", build_tfidf_vectorizer()),
                ("classifier", clf),
            ]
        )

        # 5-fold cross-validation on training split only
        cv_scores = cross_validate(
            pipeline,
            X_train,
            y_train,
            cv=skf,
            scoring=["accuracy", "precision", "recall", "f1", "roc_auc"],
            n_jobs=-1,
        )

        # Fit pipeline on entire training split
        pipeline.fit(X_train, y_train)
        fit_time = round(time.time() - start_time, 2)

        # Evaluate on held-out test split
        y_pred = pipeline.predict(X_test)
        y_proba = None
        if hasattr(pipeline, "predict_proba"):
            y_proba = pipeline.predict_proba(X_test)[:, 1]

        metrics = compute_evaluation_metrics(y_test, y_pred, y_proba, model_name=name)
        metrics["fit_time_seconds"] = fit_time
        metrics["cv_accuracy_mean"] = round(float(np.mean(cv_scores["test_accuracy"])), 4)
        metrics["cv_accuracy_std"] = round(float(np.std(cv_scores["test_accuracy"])), 4)
        metrics["cv_f1_mean"] = round(float(np.mean(cv_scores["test_f1"])), 4)
        metrics["cv_f1_std"] = round(float(np.std(cv_scores["test_f1"])), 4)
        metrics["cv_roc_auc_mean"] = round(float(np.mean(cv_scores["test_roc_auc"])), 4)

        model_results[name] = metrics
        model_probas[name] = {"pred": y_pred, "proba": y_proba}
        pipelines[name] = pipeline

        comparison_records.append(
            {
                "model_name": name,
                "accuracy": metrics["accuracy"],
                "precision": metrics["precision"],
                "recall": metrics["recall"],
                "f1_score": metrics["f1_score"],
                "roc_auc": metrics["roc_auc"],
                "cv_f1_mean": metrics["cv_f1_mean"],
                "cv_accuracy_mean": metrics["cv_accuracy_mean"],
                "fit_time_seconds": fit_time,
            }
        )

        logger.info(
            f"Finished {name}: Test Acc={metrics['accuracy']:.4f}, Test F1={metrics['f1_score']:.4f}, "
            f"Test ROC-AUC={metrics['roc_auc']:.4f}, CV F1 Mean={metrics['cv_f1_mean']:.4f}"
        )

    comparison_df = pd.DataFrame(comparison_records).sort_values(
        by=["f1_score", "roc_auc"], ascending=False
    )

    # 4. Model Selection Strategy
    # Select best model based on highest Test F1-score (harmonic mean of Precision & Recall)
    # and secondary tie-breaker of ROC-AUC.
    best_model_name = comparison_df.iloc[0]["model_name"]
    best_pipeline = pipelines[best_model_name]
    best_metrics = model_results[best_model_name]

    logger.info(f"Step 4: Selected champion model: {best_model_name}")
    logger.info(
        f"Justification: Ranked highest in balanced F1-score ({best_metrics['f1_score']:.4f}) "
        f"and ROC-AUC ({best_metrics['roc_auc']:.4f}) on unseen test data."
    )

    # 5. Save champion pipeline
    pipeline_save_path = os.path.join(models_dir, "reviewguard_pipeline.joblib")
    joblib.dump(best_pipeline, pipeline_save_path)
    logger.info(f"Champion pipeline successfully saved to {pipeline_save_path}")

    # Also save individual fitted models for optional comparison inside UI
    all_pipelines_path = os.path.join(models_dir, "all_candidate_pipelines.joblib")
    joblib.dump(pipelines, all_pipelines_path)

    # 6. Generate and save evaluation visualizations
    logger.info("Step 5: Generating evaluation plots and structured reports...")
    cm_plot_path = os.path.join(reports_dir, "confusion_matrix.png")
    plot_confusion_matrix(
        best_metrics["confusion_matrix"],
        best_model_name,
        cm_plot_path,
    )

    roc_plot_path = os.path.join(reports_dir, "roc_curves.png")
    plot_roc_curves(model_probas, y_test, roc_plot_path)

    pr_plot_path = os.path.join(reports_dir, "pr_curves.png")
    plot_precision_recall_curves(model_probas, y_test, pr_plot_path)

    bars_plot_path = os.path.join(reports_dir, "model_comparison.png")
    plot_model_comparison_bars(comparison_df, bars_plot_path)

    # 7. Save metadata and reports
    metadata = {
        "project": "ReviewGuard",
        "description": "AI-Powered Fake Review Detection and Analysis System",
        "champion_model": best_model_name,
        "selection_criteria": "Highest Test F1-score and ROC-AUC on stratified holdout test split",
        "trained_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "dataset": {
            "name": "Deceptive Opinion Spam Corpus (Ott et al., 2011)",
            "total_samples": len(df_clean),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "class_distribution": {
                "truthful": int((df_clean["label"] == 0).sum()),
                "deceptive": int((df_clean["label"] == 1).sum()),
            },
        },
        "vocabulary_size": len(best_pipeline.named_steps["tfidf"].vocabulary_),
        "champion_metrics": best_metrics,
        "all_models_metrics": model_results,
    }

    metadata_path = os.path.join(models_dir, "model_metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=4)

    save_evaluation_results(metadata, comparison_df, reports_dir)
    logger.info(f"Model metadata saved to {metadata_path}")
    logger.info("Training and evaluation workflow completed successfully!")

    return best_pipeline, metadata


if __name__ == "__main__":
    download_dataset()
    pipeline, meta = train_and_evaluate_all()
    print("\n--- Model Training Summary ---")
    print(f"Champion Model: {meta['champion_model']}")
    print(f"Accuracy:  {meta['champion_metrics']['accuracy']:.4f}")
    print(f"Precision: {meta['champion_metrics']['precision']:.4f}")
    print(f"Recall:    {meta['champion_metrics']['recall']:.4f}")
    print(f"F1-score:  {meta['champion_metrics']['f1_score']:.4f}")
    print(f"ROC-AUC:   {meta['champion_metrics']['roc_auc']:.4f}")
