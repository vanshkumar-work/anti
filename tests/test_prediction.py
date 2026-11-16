"""Unit tests for ReviewGuard model prediction, batch processing, and edge cases."""

import os
import numpy as np
import pandas as pd
import pytest

from src.predict import (
    CLASS_LABELS,
    load_pipeline,
    predict_batch_reviews,
    predict_single_review,
)


@pytest.fixture(scope="module")
def trained_pipeline():
    """Load the trained champion pipeline fixture."""
    model_path = os.path.join("models", "reviewguard_pipeline.joblib")
    assert os.path.exists(model_path), "Model file must exist before running prediction tests."
    return load_pipeline(model_path)


def test_missing_model_file_error():
    """Verify that attempting to load a non-existent model raises a helpful FileNotFoundError."""
    with pytest.raises(FileNotFoundError) as exc_info:
        load_pipeline("models/non_existent_model_12345.joblib")
    assert "Trained model not found" in str(exc_info.value)
    assert "python -m src.train" in str(exc_info.value)


def test_predict_single_normal_review(trained_pipeline):
    """Test normal review classification."""
    text = (
        "We checked into the hotel on a Friday afternoon. The room on the 8th floor was clean, "
        "the AC worked well, and the bathroom had clean towels. Valet parking was slightly pricey."
    )
    result = predict_single_review(trained_pipeline, text)
    assert result["is_valid"] is True
    assert result["predicted_class"] in [0, 1]
    assert result["prediction_label"] in CLASS_LABELS.values()
    assert 50.0 <= result["confidence_pct"] <= 100.0
    assert "text_statistics" in result
    assert "explanation" in result
    assert "disclaimer" in result


def test_predict_empty_review(trained_pipeline):
    """Test that empty or whitespace-only input is rejected safely."""
    empty_res = predict_single_review(trained_pipeline, "")
    assert empty_res["is_valid"] is False
    assert "empty" in empty_res["error"].lower()

    whitespace_res = predict_single_review(trained_pipeline, "    \n\t  ")
    assert whitespace_res["is_valid"] is False


def test_predict_very_short_review(trained_pipeline):
    """Test that very short reviews are flagged but processed without crash."""
    short_text = "Good hotel."
    res = predict_single_review(trained_pipeline, short_text)
    assert res["is_valid"] is True
    assert res["is_very_short"] is True
    assert "brief" in res["summary_message"] or "short" in str(res["text_statistics"])


def test_predict_long_review(trained_pipeline):
    """Test that long reviews (multiple paragraphs) process smoothly."""
    long_text = (
        "We spent our summer vacation at this downtown Chicago establishment. "
        "The lobby was well maintained and the concierge was informative about local attractions. "
        "Our double queen room was spacious with high ceilings and adequate lighting. "
        "The bathroom shower pressure was consistent and hot water was immediate. "
    ) * 10
    res = predict_single_review(trained_pipeline, long_text)
    assert res["is_valid"] is True
    assert res["text_statistics"]["word_count"] > 100


def test_predict_batch_reviews_normal(trained_pipeline):
    """Test batch processing on DataFrame with mixed truthful and deceptive content."""
    df = pd.DataFrame(
        {
            "id": [1, 2, 3],
            "review": [
                "The room was located near the elevator. Bed was comfortable, bathroom was clean.",
                "Pure absolute perfection! The most magnificent hotel on earth! We felt like royalty!",
                "Standard business stay. Fast Wi-Fi, desk in room was suitable for laptop work.",
            ],
        }
    )
    annotated_df, summary = predict_batch_reviews(trained_pipeline, df, text_column="review")
    assert "Predicted_Class" in annotated_df.columns
    assert "Confidence_Pct" in annotated_df.columns
    assert summary["valid_reviews_analyzed"] == 3
    assert summary["total_rows"] == 3
    assert summary["deceptive_count"] + summary["truthful_count"] == 3


def test_predict_batch_reviews_missing_column(trained_pipeline):
    """Test that providing an invalid column name raises a clear descriptive ValueError."""
    df = pd.DataFrame({"incorrect_column": ["Review text here"]})
    with pytest.raises(ValueError) as exc_info:
        predict_batch_reviews(trained_pipeline, df, text_column="review_content")
    assert "was not found" in str(exc_info.value)


def test_predict_batch_reviews_with_empty_rows(trained_pipeline):
    """Test that batch analysis handles empty rows without crashing."""
    df = pd.DataFrame(
        {
            "review": [
                "Clean room with comfortable bedding.",
                "",
                None,
                "Another genuine review of the facilities.",
            ]
        }
    )
    annotated_df, summary = predict_batch_reviews(trained_pipeline, df, text_column="review")
    assert summary["valid_reviews_analyzed"] == 2
    assert summary["invalid_or_empty_rows"] == 2
    assert len(annotated_df) == 4


def test_prediction_determinism(trained_pipeline):
    """Ensure identical review input produces identical prediction outputs across repeated calls."""
    sample = "The hotel had convenient underground parking and a quiet courtyard."
    res1 = predict_single_review(trained_pipeline, sample)
    res2 = predict_single_review(trained_pipeline, sample)
    assert res1["predicted_class"] == res2["predicted_class"]
    assert res1["confidence_pct"] == res2["confidence_pct"]
