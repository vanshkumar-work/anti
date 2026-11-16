"""Text preprocessing, tokenisation, and feature extraction pipeline for ReviewGuard.

Preserves crucial semantic structures such as negations and sentiment modifiers
to prevent loss of meaning in deceptive review detection.
"""

import re
import string
from typing import Any, Dict, List, Set
import pandas as pd
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS, TfidfVectorizer

# Words with strong semantic importance that must NEVER be stripped as stop words
NEGATION_WORDS: Set[str] = {
    "no",
    "not",
    "nor",
    "neither",
    "never",
    "nobody",
    "none",
    "nothing",
    "nowhere",
    "hardly",
    "scarcely",
    "barely",
    "cannot",
    "without",
    "against",
}

# English stop words with negations carefully preserved
FILTERED_STOP_WORDS: Set[str] = set(ENGLISH_STOP_WORDS) - NEGATION_WORDS

# Common English contraction mappings for robust normalisation
SPECIFIC_CONTRACTIONS = {
    r"\bcan't\b": "cannot",
    r"\bwon't\b": "will not",
    r"\bshan't\b": "shall not",
    r"\bain't\b": "is not",
    r"\bdon't\b": "do not",
    r"\bdoesn't\b": "does not",
    r"\bdidn't\b": "did not",
    r"\bisn't\b": "is not",
    r"\baren't\b": "are not",
    r"\bwasn't\b": "was not",
    r"\bweren't\b": "were not",
    r"\bhaven't\b": "have not",
    r"\bhasn't\b": "has not",
    r"\bhadn't\b": "had not",
    r"\bwouldn't\b": "would not",
    r"\bshouldn't\b": "should not",
    r"\bcouldn't\b": "could not",
    r"n\'t\b": " not",
    r"\'m\b": " am",
    r"\'s\b": " is",
    r"\'re\b": " are",
    r"\'ve\b": " have",
    r"\'ll\b": " will",
    r"\'d\b": " would",
}


def expand_contractions(text: str) -> str:
    """Expand conversational English contractions to preserve negation signals."""
    normalized = text
    for pattern, replacement in SPECIFIC_CONTRACTIONS.items():
        normalized = re.sub(pattern, replacement, normalized, flags=re.IGNORECASE)
    return normalized


def clean_text(text: Any) -> str:
    """Normalise and clean review text for NLP feature extraction.

    Steps:
    1. Handle missing/null input.
    2. Lowercase transformation.
    3. Expand standard English contractions (e.g. don't -> do not).
    4. Remove HTML tags and web URLs.
    5. Clean non-alphanumeric punctuation while retaining word boundaries.
    6. Normalise redundant whitespaces.

    Args:
        text: Input review string or non-string object.

    Returns:
        Cleaned text string.
    """
    if text is None or pd.isna(text):
        return ""

    text_str = str(text).lower()

    # Expand contractions before stripping punctuation
    text_str = expand_contractions(text_str)

    # Remove URLs and HTML tags
    text_str = re.sub(r"https?://\S+|www\.\S+", " ", text_str)
    text_str = re.sub(r"<.*?>", " ", text_str)

    # Replace punctuation characters with spaces, retaining letters and numbers
    text_str = re.sub(r"[^a-zA-Z0-9\s]", " ", text_str)

    # Collapse redundant whitespaces
    text_str = re.sub(r"\s+", " ", text_str).strip()

    return text_str


def tokenize_text(text: str) -> List[str]:
    """Tokenise text into words, filtering single-character tokens."""
    cleaned = clean_text(text)
    tokens = [tok for tok in cleaned.split() if len(tok) > 1]
    return tokens


def extract_text_statistics(text: str) -> Dict[str, Any]:
    """Calculate rich quantitative text properties for analytical inspection.

    Args:
        text: Raw or cleaned review text.

    Returns:
        Dictionary of text properties (word count, char count, negation count, etc.).
    """
    if not text or pd.isna(text) or not str(text).strip():
        return {
            "char_count": 0,
            "word_count": 0,
            "sentence_count": 0,
            "avg_word_length": 0.0,
            "lexical_diversity": 0.0,
            "exclamation_count": 0,
            "question_count": 0,
            "negation_count": 0,
            "first_person_pronouns": 0,
            "is_short": True,
        }

    raw_str = str(text)
    char_count = len(raw_str)
    exclamation_count = raw_str.count("!")
    question_count = raw_str.count("?")

    # Count sentences based on punctuation markers
    sentences = re.split(r"[.!?]+", raw_str)
    sentence_count = len([s for s in sentences if s.strip()]) or 1

    tokens = tokenize_text(raw_str)
    word_count = len(tokens)

    if word_count > 0:
        avg_word_length = round(sum(len(w) for w in tokens) / word_count, 2)
        unique_tokens = set(tokens)
        lexical_diversity = round(len(unique_tokens) / word_count, 3)
    else:
        avg_word_length = 0.0
        lexical_diversity = 0.0

    negation_count = sum(1 for w in tokens if w in NEGATION_WORDS)

    # First-person pronouns (I, me, my, we, us, our) often correlate with deceptive narratives
    first_person_set = {"i", "me", "my", "myself", "we", "us", "our", "ours", "ourselves"}
    first_person_pronouns = sum(1 for w in tokens if w in first_person_set)

    return {
        "char_count": char_count,
        "word_count": word_count,
        "sentence_count": sentence_count,
        "avg_word_length": avg_word_length,
        "lexical_diversity": lexical_diversity,
        "exclamation_count": exclamation_count,
        "question_count": question_count,
        "negation_count": negation_count,
        "first_person_pronouns": first_person_pronouns,
        "is_short": word_count < 8,
    }


def clean_dataframe(df: pd.DataFrame, text_column: str = "text") -> pd.DataFrame:
    """Preprocess a full dataframe: removes missing values, duplicates, and empty strings.

    Args:
        df: Input pandas DataFrame.
        text_column: Column name containing review text.

    Returns:
        Cleaned pandas DataFrame with new 'cleaned_text' column.
    """
    df_clean = df.copy()

    # Drop null rows in text column
    initial_count = len(df_clean)
    df_clean = df_clean.dropna(subset=[text_column])

    # Clean text
    df_clean["cleaned_text"] = df_clean[text_column].apply(clean_text)

    # Filter out empty or whitespace-only rows
    df_clean = df_clean[df_clean["cleaned_text"].str.strip().str.len() > 0]

    # Deduplicate based on cleaned review text
    df_clean = df_clean.drop_duplicates(subset=["cleaned_text"])

    final_count = len(df_clean)
    dropped = initial_count - final_count
    if dropped > 0:
        logger_msg = f"Dataframe cleaning removed {dropped} rows (nulls, duplicates, empty text)."
    else:
        logger_msg = "Dataframe cleaning complete: no missing or duplicate rows found."

    return df_clean


def build_tfidf_vectorizer(
    ngram_range: tuple = (1, 2),
    min_df: int = 2,
    max_features: int = 10000,
    sublinear_tf: bool = True,
    use_stopwords: bool = True,
) -> TfidfVectorizer:
    """Construct a TF-IDF vectorizer configured for sentiment and opinion spam analysis.

    Uses preprocessor=clean_text and preserves negations within filtered stopwords.

    Args:
        ngram_range: Tuple of (min_n, max_n). Defaults to (1, 2) for unigrams and bigrams.
        min_df: Minimum document frequency threshold.
        max_features: Upper limit on vocabulary size.
        sublinear_tf: Apply sublinear tf scaling (1 + log(tf)).
        use_stopwords: Whether to remove non-negation English stop words.

    Returns:
        Configured scikit-learn TfidfVectorizer.
    """
    stop_words_list = list(FILTERED_STOP_WORDS) if use_stopwords else None

    return TfidfVectorizer(
        preprocessor=clean_text,
        ngram_range=ngram_range,
        min_df=min_df,
        max_features=max_features,
        sublinear_tf=sublinear_tf,
        stop_words=stop_words_list,
        token_pattern=r"\b[a-zA-Z]{2,}\b",
    )
