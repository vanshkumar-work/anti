"""Model evaluation and performance reporting module for ReviewGuard.

Calculates comprehensive metrics (Accuracy, Precision, Recall, F1, ROC-AUC)
and generates evaluation artifacts (confusion matrices, ROC/PR curves).
"""

import json
import os
from typing import Any, Dict, List, Optional
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for headless server execution
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    auc,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)

LABEL_NAMES = ["Truthful", "Deceptive"]


def compute_evaluation_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_proba: Optional[np.ndarray] = None,
    model_name: str = "Model",
) -> Dict[str, Any]:
    """Compute standard classification evaluation metrics.

    Args:
        y_true: Ground truth binary labels (0: truthful, 1: deceptive).
        y_pred: Predicted binary labels.
        y_proba: Predicted probabilities for class 1 (deceptive).
        model_name: Identifier for the model.

    Returns:
        Dictionary of computed metrics and reports.
    """
    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))
    f1_macro = float(f1_score(y_true, y_pred, average="macro", zero_division=0))

    roc_auc = None
    if y_proba is not None:
        try:
            roc_auc = float(roc_auc_score(y_true, y_proba))
        except Exception:
            roc_auc = None

    cm = confusion_matrix(y_true, y_pred).tolist()
    report_dict = classification_report(
        y_true, y_pred, target_names=LABEL_NAMES, output_dict=True, zero_division=0
    )
    report_text = classification_report(
        y_true, y_pred, target_names=LABEL_NAMES, zero_division=0
    )

    return {
        "model_name": model_name,
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "f1_macro": round(f1_macro, 4),
        "roc_auc": round(roc_auc, 4) if roc_auc is not None else None,
        "confusion_matrix": cm,
        "classification_report": report_dict,
        "classification_report_text": report_text,
    }


def plot_confusion_matrix(
    cm: List[List[int]],
    model_name: str,
    output_path: str,
    class_names: List[str] = LABEL_NAMES,
) -> str:
    """Render and save a styled confusion matrix heatmap."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    fig, ax = plt.subplots(figsize=(6, 5))
    cm_arr = np.array(cm)

    im = ax.imshow(cm_arr, interpolation="nearest", cmap="Blues")
    fig.colorbar(im, ax=ax)

    tick_marks = np.arange(len(class_names))
    ax.set_xticks(tick_marks)
    ax.set_yticks(tick_marks)
    ax.set_xticklabels(class_names, fontsize=11)
    ax.set_yticklabels(class_names, fontsize=11)

    thresh = cm_arr.max() / 2.0
    for i in range(cm_arr.shape[0]):
        for j in range(cm_arr.shape[1]):
            ax.text(
                j,
                i,
                f"{cm_arr[i, j]}",
                ha="center",
                va="center",
                color="white" if cm_arr[i, j] > thresh else "black",
                fontsize=13,
                fontweight="bold",
            )

    ax.set_ylabel("True Ground Truth Label", fontsize=12)
    ax.set_xlabel("Predicted Label", fontsize=12)
    ax.set_title(f"Confusion Matrix: {model_name}", fontsize=13, fontweight="bold", pad=12)
    plt.tight_layout()
    plt.savefig(output_path, dpi=200)
    plt.close(fig)
    return output_path


def plot_roc_curves(
    model_probas: Dict[str, Dict[str, Any]],
    y_test: np.ndarray,
    output_path: str,
) -> str:
    """Plot overlaid ROC curves for all models."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    fig, ax = plt.subplots(figsize=(7, 6))

    colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"]
    for idx, (name, data) in enumerate(model_probas.items()):
        proba = data.get("proba")
        if proba is None:
            continue
        fpr, tpr, _ = roc_curve(y_test, proba)
        roc_val = auc(fpr, tpr)
        color = colors[idx % len(colors)]
        ax.plot(
            fpr,
            tpr,
            label=f"{name} (AUC = {roc_val:.4f})",
            linewidth=2,
            color=color,
        )

    ax.plot([0, 1], [0, 1], "k--", linewidth=1.2, label="Random Guess (AUC = 0.5000)")
    ax.set_xlim([0.0, 1.0])
    ax.set_ylim([0.0, 1.05])
    ax.set_xlabel("False Positive Rate (1 - Specificity)", fontsize=11)
    ax.set_ylabel("True Positive Rate (Sensitivity / Recall)", fontsize=11)
    ax.set_title("Receiver Operating Characteristic (ROC) Comparison", fontsize=12, fontweight="bold")
    ax.legend(loc="lower right", frameon=True, fontsize=10)
    ax.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(output_path, dpi=200)
    plt.close(fig)
    return output_path


def plot_precision_recall_curves(
    model_probas: Dict[str, Dict[str, Any]],
    y_test: np.ndarray,
    output_path: str,
) -> str:
    """Plot overlaid Precision-Recall curves for all models."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    fig, ax = plt.subplots(figsize=(7, 6))

    colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"]
    for idx, (name, data) in enumerate(model_probas.items()):
        proba = data.get("proba")
        if proba is None:
            continue
        precision, recall, _ = precision_recall_curve(y_test, proba)
        pr_auc = auc(recall, precision)
        color = colors[idx % len(colors)]
        ax.plot(
            recall,
            precision,
            label=f"{name} (PR-AUC = {pr_auc:.4f})",
            linewidth=2,
            color=color,
        )

    ax.set_xlim([0.0, 1.0])
    ax.set_ylim([0.0, 1.05])
    ax.set_xlabel("Recall", fontsize=11)
    ax.set_ylabel("Precision", fontsize=11)
    ax.set_title("Precision-Recall Curves Comparison", fontsize=12, fontweight="bold")
    ax.legend(loc="lower left", frameon=True, fontsize=10)
    ax.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(output_path, dpi=200)
    plt.close(fig)
    return output_path


def plot_model_comparison_bars(
    comparison_df: pd.DataFrame,
    output_path: str,
) -> str:
    """Plot comparative grouped bar chart for all models across core evaluation metrics."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    fig, ax = plt.subplots(figsize=(10, 5.5))

    metrics = ["Accuracy", "Precision", "Recall", "F1 Score", "ROC-AUC"]
    col_mapping = {
        "Accuracy": "accuracy",
        "Precision": "precision",
        "Recall": "recall",
        "F1 Score": "f1_score",
        "ROC-AUC": "roc_auc",
    }

    models = comparison_df["model_name"].tolist()
    x = np.arange(len(models))
    width = 0.15

    for idx, metric in enumerate(metrics):
        col = col_mapping[metric]
        values = comparison_df[col].tolist()
        rects = ax.bar(x + idx * width - width * 2, values, width, label=metric)

    ax.set_ylabel("Metric Score (0.0 to 1.0)", fontsize=11)
    ax.set_title("Comprehensive Machine Learning Model Comparison", fontsize=13, fontweight="bold")
    ax.set_xticks(x)
    ax.set_xticklabels(models, fontsize=10)
    ax.set_ylim(0.5, 1.05)
    ax.legend(loc="upper left", bbox_to_anchor=(1, 1), frameon=True)
    ax.grid(axis="y", alpha=0.3)
    plt.tight_layout()
    plt.savefig(output_path, dpi=200)
    plt.close(fig)
    return output_path


def save_evaluation_results(
    results: Dict[str, Any],
    comparison_df: pd.DataFrame,
    output_dir: str = os.path.join("reports", "evaluation"),
) -> None:
    """Save evaluation metrics in structured JSON and CSV formats."""
    os.makedirs(output_dir, exist_ok=True)
    json_path = os.path.join(output_dir, "metrics_summary.json")
    csv_path = os.path.join(output_dir, "model_comparison.csv")

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4)

    comparison_df.to_csv(csv_path, index=False)
