"""Integration and unit tests for the Stress Detection FastAPI backend."""

import pandas as pd
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.model_loader import EXPECTED_FEATURES, get_model


@pytest.fixture(scope="module")
def client():
    """Create a FastAPI TestClient instance."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="module")
def valid_payload():
    """Extract a known valid feature payload from row 0 of the dataset."""
    df = pd.read_csv("data/StressLevelDataset.csv")
    first_row = df.drop(columns=["stress_level"]).iloc[0].to_dict()
    return {k: int(v) for k, v in first_row.items()}


def test_root_endpoint(client):
    """Test the root endpoint returns metadata and documentation links."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "Stress Detection System API"
    assert data["status"] == "online"
    assert "/docs" in data["documentation"]


def test_health_endpoint(client):
    """Test that the health endpoint returns 200 and healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True


def test_model_info_endpoint(client):
    """Test that the model-info endpoint returns complete architecture details."""
    response = client.get("/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["feature_count"] == 20
    assert data["classes"] == [0, 1, 2]
    assert data["model_type"] == "GradientBoostingClassifier"
    assert len(data["feature_names"]) == 20
    assert data["metadata"] is not None


def test_predict_success(client, valid_payload):
    """Test successful prediction with a valid payload."""
    response = client.post("/predict", json=valid_payload)
    assert response.status_code == 200
    data = response.json()

    assert data["predicted_class"] in [0, 1, 2]
    assert "probabilities" in data
    assert len(data["probabilities"]) == 3

    # Check probabilities are between 0 and 1 and sum to ~1.0
    probs = data["probabilities"]
    total_prob = sum(probs.values())
    assert 0.99 <= total_prob <= 1.01
    for class_id, prob in probs.items():
        assert 0.0 <= prob <= 1.0

    # Ensure educational disclaimer is present
    assert "educational" in data["disclaimer"].lower()


def test_predict_extra_field_rejected(client, valid_payload):
    """Test that unexpected extra fields are rejected with 422."""
    payload = valid_payload.copy()
    payload["extra_unauthorized_field"] = 999
    response = client.post("/predict", json=payload)
    assert response.status_code == 422


def test_predict_out_of_bounds_rejected(client, valid_payload):
    """Test that out-of-bounds feature values are rejected with 422."""
    # Blood pressure observed max is 3; 4 should fail
    payload_bp = valid_payload.copy()
    payload_bp["blood_pressure"] = 4
    res_bp = client.post("/predict", json=payload_bp)
    assert res_bp.status_code == 422

    # Anxiety level observed max is 21; 25 should fail
    payload_anx = valid_payload.copy()
    payload_anx["anxiety_level"] = 25
    res_anx = client.post("/predict", json=payload_anx)
    assert res_anx.status_code == 422


def test_predict_missing_field_rejected(client, valid_payload):
    """Test that omitting a required field produces 422."""
    payload = valid_payload.copy()
    del payload["anxiety_level"]
    response = client.post("/predict", json=payload)
    assert response.status_code == 422


def test_model_caching():
    """Verify that get_model() returns the identical cached instance across calls."""
    m1 = get_model()
    m2 = get_model()
    assert m1 is m2

