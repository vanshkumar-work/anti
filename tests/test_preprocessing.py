"""Unit tests for ReviewGuard preprocessing and text feature extraction."""

import pandas as pd

from src.preprocessing import (
    FILTERED_STOP_WORDS,
    NEGATION_WORDS,
    build_tfidf_vectorizer,
    clean_dataframe,
    clean_text,
    expand_contractions,
    extract_text_statistics,
    tokenize_text,
)


def test_clean_text_normal():
    raw = "The Hotel was AMAZING! Check-in took 5 minutes at http://hotel.com."
    cleaned = clean_text(raw)
    assert "amazing" in cleaned
    assert "http" not in cleaned
    assert "hotel.com" not in cleaned
    assert "5" in cleaned


def test_clean_text_null_and_empty():
    assert clean_text("") == ""
    assert clean_text(None) == ""
    assert clean_text("   \n\t  ") == ""
    assert clean_text(float("nan")) == ""


def test_contraction_expansion():
    text = "I didn't like the food and couldn't sleep because it wasn't quiet."
    expanded = expand_contractions(text.lower())
    assert "did not" in expanded
    assert "could not" in expanded
    assert "was not" in expanded


def test_negations_preserved_in_stopwords():
    # Verify crucial negation words are NOT in the active stopwords set
    for neg in ["not", "no", "never", "cannot", "hardly", "barely"]:
        assert neg in NEGATION_WORDS
        assert neg not in FILTERED_STOP_WORDS


def test_tokenize_text():
    sample = "The front desk staff greeted us warmly!"
    tokens = tokenize_text(sample)
    assert isinstance(tokens, list)
    assert len(tokens) >= 5
    assert "warmly" in tokens
    assert "!" not in tokens


def test_extract_text_statistics():
    sample = "We stayed for two nights. The room was wonderful! Did you try the pool?"
    stats = extract_text_statistics(sample)
    assert stats["word_count"] > 10
    assert stats["sentence_count"] == 3
    assert stats["exclamation_count"] == 1
    assert stats["question_count"] == 1
    assert stats["first_person_pronouns"] >= 1
    assert stats["is_short"] is False


def test_extract_text_statistics_empty():
    stats = extract_text_statistics("")
    assert stats["word_count"] == 0
    assert stats["sentence_count"] == 0
    assert stats["is_short"] is True


def test_clean_dataframe():
    data = {
        "text": [
            "Great stay at the hotel.",
            None,
            "   ",
            "Great stay at the hotel.",  # Duplicate
            "Another unique review with details.",
        ],
        "label": [0, 1, 0, 0, 1],
    }
    df = pd.DataFrame(data)
    cleaned_df = clean_dataframe(df, text_column="text")

    # Should drop row with None, empty whitespace, and duplicate
    assert len(cleaned_df) == 2
    assert "cleaned_text" in cleaned_df.columns


def test_tfidf_vectorizer_pipeline():
    corpus = [
        "The hotel was very clean and spacious.",
        "Terrible experience, would not recommend this place.",
        "Staff was friendly and welcoming to my family.",
    ]
    vectorizer = build_tfidf_vectorizer(ngram_range=(1, 2), min_df=1)
    X = vectorizer.fit_transform(corpus)
    feature_names = vectorizer.get_feature_names_out()
    assert X.shape[0] == 3
    assert len(feature_names) > 0
    # Negation 'not' must be retained in feature space
    assert any("not" in f for f in feature_names)
