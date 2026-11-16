"""Data loading and dataset setup module for ReviewGuard.

Loads the Deceptive Opinion Spam Corpus by Ott et al. (2011).
Contains 1,600 hotel reviews (800 truthful, 800 deceptive).
"""

import os
import urllib.request
import logging
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

DATASET_URL = (
    "https://raw.githubusercontent.com/rajsiddarth/Text_Analytics/master/deceptive-opinion.csv"
)
DEFAULT_RAW_PATH = os.path.join("data", "raw", "deceptive_opinion.csv")
DEFAULT_PROCESSED_PATH = os.path.join("data", "processed", "cleaned_reviews.csv")
SAMPLE_BATCH_PATH = os.path.join("data", "sample_test_batch.csv")


def download_dataset(destination_path: str = DEFAULT_RAW_PATH) -> str:
    """Download the Ott et al. (2011) Deceptive Opinion Spam Corpus if not already present.

    Args:
        destination_path: Local path where the raw CSV should be saved.

    Returns:
        Absolute path to the downloaded dataset.
    """
    os.makedirs(os.path.dirname(destination_path), exist_ok=True)
    if os.path.exists(destination_path):
        logger.info(f"Dataset already exists at {destination_path}")
        return destination_path

    logger.info(f"Downloading Deceptive Opinion Spam Corpus from {DATASET_URL}...")
    try:
        urllib.request.urlretrieve(DATASET_URL, destination_path)
        logger.info(f"Dataset successfully downloaded to {destination_path}")
    except Exception as exc:
        logger.error(f"Failed to download dataset from {DATASET_URL}: {exc}")
        raise RuntimeError(
            f"Could not automatically download the dataset: {exc}. "
            f"Please place 'deceptive_opinion.csv' manually in '{os.path.abspath(destination_path)}'."
        ) from exc

    return destination_path


def load_raw_dataset(file_path: str = DEFAULT_RAW_PATH) -> pd.DataFrame:
    """Load and format the Deceptive Opinion Spam Corpus.

    The corpus has columns: ['deceptive', 'hotel', 'polarity', 'source', 'text'].
    Maps 'deceptive' to binary label (1: deceptive, 0: truthful).

    Args:
        file_path: Path to the raw CSV file.

    Returns:
        pd.DataFrame containing verified columns.
    """
    if not os.path.exists(file_path):
        download_dataset(file_path)

    df = pd.read_csv(file_path)
    required_cols = {"deceptive", "text"}
    if not required_cols.issubset(set(df.columns)):
        raise ValueError(
            f"Dataset at {file_path} is missing required columns {required_cols}. "
            f"Found: {list(df.columns)}"
        )

    # Standardize column names
    df = df.copy()
    df["label_str"] = df["deceptive"].astype(str).str.strip().str.lower()
    df["label"] = df["label_str"].map({"deceptive": 1, "truthful": 0})

    if df["label"].isnull().any():
        unmapped = df[df["label"].isnull()]["label_str"].unique()
        raise ValueError(f"Unrecognized labels found in dataset: {unmapped}")

    logger.info(
        f"Loaded dataset from {file_path}: {len(df)} total reviews "
        f"({(df['label'] == 1).sum()} deceptive, {(df['label'] == 0).sum()} truthful)"
    )
    return df


def create_sample_batch_csv(destination_path: str = SAMPLE_BATCH_PATH) -> str:
    """Generate a realistic test CSV for users to test Batch Review Analysis.

    Contains a diverse set of reviews (truthful, suspicious, short, long, edge-case).

    Args:
        destination_path: Path where the sample CSV should be saved.

    Returns:
        Path to the generated sample file.
    """
    sample_records = [
        {
            "review_id": "REV-001",
            "product_or_service": "Millennium Knickerbocker Hotel",
            "review_text": "I stayed here for three nights on a corporate trip. The location near Michigan Avenue is unbeatable. Check-in was fast, though the elevators were slightly slow during morning peak hours. The bathroom was clean and well stocked with towels.",
            "ground_truth_note": "Realistic truthful pattern with specific balanced details.",
        },
        {
            "review_id": "REV-002",
            "product_or_service": "Grand Luxury Suites",
            "review_text": "My husband and I recently spent our anniversary here and it was pure bliss! From the moment we stepped into the breathtaking lobby, the extraordinary staff pampered us like royalty. Every single thing was utterly sublime, perfection in every way! We will definitely return every year!",
            "ground_truth_note": "High superlatives, emotional hyperbole, lack of concrete spatial details.",
        },
        {
            "review_id": "REV-003",
            "product_or_service": "The James Hotel Chicago",
            "review_text": "We booked a king loft room. The bed was extremely comfortable and the shower pressure was decent. Room service arrived within 35 minutes on Saturday evening. Valet parking cost $65 per day, which felt steep, but expected for downtown.",
            "ground_truth_note": "Detailed concrete metrics and moderate balanced critique.",
        },
        {
            "review_id": "REV-004",
            "product_or_service": "Affinia Chicago",
            "review_text": "Hands down the most magnificent and best hotel experience in the entire world! Everything was breathtaking, magnificent, flawless, and wonderfully majestic. You will absolutely fall in love with this heavenly paradise!",
            "ground_truth_note": "Aggressive promotional sentiment without factual anchor.",
        },
        {
            "review_id": "REV-005",
            "product_or_service": "Hyatt Regency",
            "review_text": "Disappointing stay. The heating unit made a clicking sound throughout the night and the breakfast buffet was overcrowded. Front desk resolved the issue by offering a credit on the second day.",
            "ground_truth_note": "Negative truthful experience describing specific equipment flaw.",
        },
        {
            "review_id": "REV-006",
            "product_or_service": "Downtown Boutique Suites",
            "review_text": "This place is terrible do not go here the staff are evil and dishonest fraudsters worst place on planet earth complete disaster!",
            "ground_truth_note": "Extreme emotional outburst with sparse specific detail.",
        },
        {
            "review_id": "REV-007",
            "product_or_service": "Comfort Inn Downtown",
            "review_text": "Room was clean, breakfast was simple continental with toast and coffee. Good value for an overnight stay close to the train station.",
            "ground_truth_note": "Concise authentic traveler review.",
        },
        {
            "review_id": "REV-008",
            "product_or_service": "Luxury Oasis Chicago",
            "review_text": "My family and I had an unforgettable vacation! The breathtaking views from our room were magical. Every staff member treated us like beloved royalty. You MUST visit this extraordinary place!",
            "ground_truth_note": "Generic vacation narrative loaded with promotional markers.",
        },
    ]

    os.makedirs(os.path.dirname(destination_path), exist_ok=True)
    sample_df = pd.DataFrame(sample_records)
    sample_df.to_csv(destination_path, index=False)
    logger.info(f"Sample test batch CSV created at {destination_path}")
    return destination_path


if __name__ == "__main__":
    download_dataset()
    df = load_raw_dataset()
    create_sample_batch_csv()
    print("Dataset verification complete:")
    print(df.info())
