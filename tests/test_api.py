"""Integration and unit tests for the Stress Detection FastAPI backend."""

import math

import pandas as pd
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import (
    EXPECTED_FEATURES,
    app,
    apply_deterministic_imputation,
    compute_training_imputation_statistics,
)
from app.model_loader import get_model
from app.schemas import StressPredictionRequest


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


def test_predict_accepts_unrounded_decimal_inputs(client, valid_payload):
    """Verify decimal values from 1-to-5 linear rescaling are accepted without rounding."""
    decimal_payload = valid_payload.copy()
    decimal_payload.update(
        {
            "anxiety_level": 5.25,
            "self_esteem": 22.5,
            "depression": 20.25,
            "headache": 1.25,
            "sleep_quality": 3.75,
            "social_support": 1.5,
            "bullying": 2.5,
        }
    )

    # Confirm schema preserves exact decimals without rounding
    req = StressPredictionRequest(**decimal_payload)
    assert req.anxiety_level == 5.25
    assert req.self_esteem == 22.5
    assert req.depression == 20.25
    assert req.social_support == 1.5

    res1 = client.post("/predict", json=decimal_payload)
    res2 = client.post("/predict", json=decimal_payload)
    assert res1.status_code == 200
    assert res2.status_code == 200

    data1 = res1.json()
    data2 = res2.json()
    assert data1 == data2
    assert data1["predicted_class"] in [0, 1, 2]
    assert data1["imputed_features"] == []
    assert data1["imputation_method"] == "none_required"
    assert data1["uses_proposed_questionnaire_encoding"] is True
    assert "not clinically validated" in data1["encoding_notice"].lower()
    assert "educational" in data1["disclaimer"].lower()


@pytest.mark.parametrize(
    "field,bad_value",
    [
        ("anxiety_level", True),
        ("self_esteem", False),
        ("mental_health_history", True),
        ("anxiety_level", "5"),
        ("bullying", "2.5"),
        ("sleep_quality", "good"),
    ],
)
def test_predict_rejects_booleans_and_strings(client, valid_payload, field, bad_value):
    """Verify booleans and strings are strictly rejected with 422."""
    payload = valid_payload.copy()
    payload[field] = bad_value
    response = client.post("/predict", json=payload)
    assert response.status_code == 422


@pytest.mark.parametrize("bad_num", [math.nan, math.inf, -math.inf])
def test_schema_rejects_nan_and_infinity(valid_payload, bad_num):
    """Verify NaN and +/- Infinity are rejected by strict Pydantic validation."""
    payload = valid_payload.copy()
    payload["anxiety_level"] = bad_num
    with pytest.raises(ValidationError):
        StressPredictionRequest(**payload)


def test_predict_rejects_decimal_out_of_range(client, valid_payload):
    """Verify decimal values outside dataset min/max bounds return 422."""
    payload_high = valid_payload.copy()
    payload_high["social_support"] = 3.01
    assert client.post("/predict", json=payload_high).status_code == 422

    payload_low = valid_payload.copy()
    payload_low["anxiety_level"] = -0.01
    assert client.post("/predict", json=payload_low).status_code == 422


@pytest.mark.parametrize("nullable_field", ["mental_health_history", "blood_pressure", "bullying"])
def test_predict_imputes_single_permitted_null_deterministically(client, valid_payload, nullable_field):
    """Verify each permitted optional null field is imputed cleanly and deterministically."""
    payload = valid_payload.copy()
    payload[nullable_field] = None

    res1 = client.post("/predict", json=payload)
    res2 = client.post("/predict", json=payload)
    assert res1.status_code == 200
    assert res2.status_code == 200

    data1 = res1.json()
    data2 = res2.json()
    assert data1 == data2
    assert data1["imputed_features"] == [nullable_field]
    assert "training_split_deterministic" in data1["imputation_method"]
    assert data1["uses_proposed_questionnaire_encoding"] is True


def test_predict_imputes_two_optional_nulls(client, valid_payload):
    """Verify up to two optional null fields are accepted and imputed in model order."""
    payload = valid_payload.copy()
    payload["mental_health_history"] = None
    payload["bullying"] = None

    res = client.post("/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["imputed_features"] == ["mental_health_history", "bullying"]


def test_predict_imputes_all_three_optional_nulls(client, valid_payload):
    """Verify requests with all three optional sensitive fields null succeed with deterministic imputation."""
    payload = valid_payload.copy()
    payload["mental_health_history"] = None
    payload["blood_pressure"] = None
    payload["bullying"] = None

    res = client.post("/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["predicted_class"] in [0, 1, 2]
    assert data["imputed_features"] == [
        "mental_health_history",
        "blood_pressure",
        "bullying",
    ]
    assert "training_split_deterministic" in data["imputation_method"]
    assert data["uses_proposed_questionnaire_encoding"] is True


def test_predict_rejects_required_null_and_over_three_missing(client, valid_payload):
    """Verify null on required fields and >3 missing features are both rejected."""
    payload_req_null = valid_payload.copy()
    payload_req_null["anxiety_level"] = None
    assert client.post("/predict", json=payload_req_null).status_code == 422

    # Required field null among optional fields still rejected
    payload_required_with_optionals = valid_payload.copy()
    payload_required_with_optionals["mental_health_history"] = None
    payload_required_with_optionals["anxiety_level"] = None
    assert client.post("/predict", json=payload_required_with_optionals).status_code == 422

    # 4 nulls (3 optional + 1 required) rejected by limit
    payload_four_nulls = valid_payload.copy()
    payload_four_nulls["mental_health_history"] = None
    payload_four_nulls["blood_pressure"] = None
    payload_four_nulls["bullying"] = None
    payload_four_nulls["anxiety_level"] = None
    assert client.post("/predict", json=payload_four_nulls).status_code == 422

    with pytest.raises(HTTPException) as exc_info:
        apply_deterministic_imputation(payload_four_nulls)
    assert exc_info.value.status_code == 422
    assert "more than 3 missing" in str(exc_info.value.detail).lower()


def test_training_imputation_statistics_and_feature_order(valid_payload):
    """Verify imputation stats come from 880-row training split without target & preserve order."""
    info = compute_training_imputation_statistics()
    assert info["training_rows"] == 880
    assert info["target_excluded"] == "stress_level"
    assert info["methods"]["mental_health_history"] == "training_split_mode"
    assert info["methods"]["blood_pressure"] == "training_split_mode"
    assert info["methods"]["bullying"] == "training_split_median"

    # Exact empirical training-split values (random_state=42, test_size=0.20, stratify=stress_level)
    stats = info["statistics"]
    assert stats["mental_health_history"] == 0
    assert stats["blood_pressure"] == 3
    assert stats["bullying"] == 3.0

    # Verify resolved feature dict preserves exact EXPECTED_FEATURES sequence
    partial = valid_payload.copy()
    partial["blood_pressure"] = None
    partial["bullying"] = None
    resolved, imputed, _ = apply_deterministic_imputation(partial, ordered_features=EXPECTED_FEATURES)
    assert tuple(resolved.keys()) == EXPECTED_FEATURES
    assert resolved["blood_pressure"] == 3
    assert resolved["bullying"] == 3.0
    assert imputed == ["blood_pressure", "bullying"]
