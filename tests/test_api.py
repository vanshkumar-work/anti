"""Integration tests for ReviewGuard FastAPI REST API."""

import io
from fastapi.testclient import TestClient

from backend.app import app

client = TestClient(app)


def test_api_health():
    """Verify health endpoint returns 200 with service information."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["pipeline_ready"] is True
    assert "Linear SVM" in data["champion_model"]


def test_api_dashboard():
    """Verify dashboard endpoint returns complete metrics and benchmark comparison."""
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["total_reviews"] in [1596, 1600]
    assert data["accuracy"] > 0.85
    assert data["f1_score"] > 0.85
    assert len(data["model_comparison"]) >= 4


def test_api_analyze_single_review_truthful():
    """Verify single review prediction for an authentic review."""
    sample = (
        "We checked into the hotel on Michigan Avenue. The room was clean, "
        "the shower pressure was good, and valet parking was 55 dollars per night."
    )
    response = client.post("/api/analyze", json={"text": sample})
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["predicted_class"] in [0, 1]
    assert 50.0 <= data["confidence_pct"] <= 100.0
    assert "text_statistics" in data
    assert "explanation" in data


def test_api_analyze_single_review_empty():
    """Verify empty input returns 400 error response with descriptive message."""
    response = client.post("/api/analyze", json={"text": "   "})
    assert response.status_code == 400
    assert "cannot be empty" in response.json()["detail"].lower()


def test_api_sample_batch():
    """Verify sample batch dataset retrieval."""
    response = client.get("/api/sample-batch")
    assert response.status_code == 200
    data = response.json()
    assert "rows" in data
    assert len(data["rows"]) >= 5


def test_api_batch_analyze_csv():
    """Verify batch review analysis using multipart form CSV upload."""
    csv_content = (
        "review_id,text\n"
        "1,\"We stayed two nights and found the location great.\"\n"
        "2,\"Breathtaking paradise! Pure absolute perfection in every way!\"\n"
        "3,\"Room was basic but clean. Elevators were a bit slow.\"\n"
    )
    file_bytes = io.BytesIO(csv_content.encode("utf-8"))
    response = client.post(
        "/api/analyze/batch",
        files={"file": ("test.csv", file_bytes, "text/csv")},
        data={"text_column": "text"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["summary"]["valid_reviews_analyzed"] == 3
    assert len(data["results"]) == 3
    assert "Predicted_Class" in data["columns"]


def test_api_batch_analyze_invalid_extension():
    """Verify that non-CSV file uploads are rejected with 400."""
    response = client.post(
        "/api/analyze/batch",
        files={"file": ("test.txt", io.BytesIO(b"hello world"), "text/plain")},
    )
    assert response.status_code == 400
    assert "only csv" in response.json()["detail"].lower()


def test_api_analytics():
    """Verify analytics endpoint returns confusion matrix, ROC curves, and linguistics."""
    response = client.get("/api/analytics")
    assert response.status_code == 200
    data = response.json()
    assert "confusion_matrix" in data
    assert "model_comparison" in data
    assert "linguistics" in data
    assert "roc_curves" in data
    assert len(data["roc_curves"]) >= 1


def test_api_model_info():
    """Verify model information endpoint returns academic documentation."""
    response = client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "dataset" in data
    assert "preprocessing" in data
    assert "feature_extraction" in data
    assert "algorithms" in data
    assert len(data["algorithms"]) == 4
