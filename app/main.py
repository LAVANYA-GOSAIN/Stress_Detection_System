"""FastAPI backend application for the Stress Detection System.

This module provides the main application instance, manages model lifespan,
and exposes RESTful API endpoints for service health, model architecture introspection,
and real-time stress level prediction.
"""

from contextlib import asynccontextmanager
from functools import lru_cache
import logging
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, status
import pandas as pd
from sklearn.model_selection import train_test_split

from app.model_loader import (
    EXPECTED_FEATURES,
    PROJECT_ROOT,
    ModelLoaderError,
    get_model,
    get_model_info,
)
from app.schemas import (
    StressPredictionRequest,
    StressPredictionResponse,
)

# ---------------------------------------------------------------------------
# Logging Configuration
# ---------------------------------------------------------------------------
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


# ---------------------------------------------------------------------------
# Application Lifespan
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan: pre-load and validate model at startup."""
    logger.info("Starting up Stress Detection API service...")
    try:
        # Eagerly load model & training-split imputation statistics into cache at startup
        model = get_model()
        compute_training_imputation_statistics()
        logger.info(
            "Trained model pre-loaded successfully on startup: %s (classes=%s, features=%d)",
            type(model).__name__,
            list(getattr(model, "classes_", [])),
            len(getattr(model, "feature_names_in_", [])),
        )
    except ModelLoaderError as err:
        logger.error("Failed to pre-load model artifact during startup: %s", err)
        # Allow startup to continue so monitoring systems can query /health for diagnostics

    yield

    logger.info("Shutting down Stress Detection API service.")


OPTIONAL_NULLABLE_FEATURES: tuple[str, ...] = (
    "mental_health_history",
    "blood_pressure",
    "bullying",
)
CATEGORICAL_OR_BINARY_FEATURES: frozenset[str] = frozenset(
    {"mental_health_history", "blood_pressure"}
)
DATASET_PATH: Path = PROJECT_ROOT / "data" / "StressLevelDataset.csv"
TRAIN_SPLIT_RANDOM_STATE: int = 42
TRAIN_SPLIT_TEST_SIZE: float = 0.20


@lru_cache(maxsize=1)
def compute_training_imputation_statistics() -> dict[str, Any]:
    """Derive deterministic imputation statistics strictly from the training split.

    Reproduces the exact 80/20 stratified training split used by `train.py` and
    `tune_models.py` (`random_state=42`, excluding target column `stress_level`):
    - Categorical / binary features: mode of training split
    - Numerical features: median of training split
    """
    df = pd.read_csv(DATASET_PATH)
    X = df.drop(columns=["stress_level"])
    y = df["stress_level"]

    X_train, _, _, _ = train_test_split(
        X,
        y,
        test_size=TRAIN_SPLIT_TEST_SIZE,
        random_state=TRAIN_SPLIT_RANDOM_STATE,
        stratify=y,
    )

    statistics: dict[str, int | float] = {}
    methods: dict[str, str] = {}
    for feature_name in EXPECTED_FEATURES:
        if feature_name in CATEGORICAL_OR_BINARY_FEATURES:
            statistics[feature_name] = int(X_train[feature_name].mode().iloc[0])
            methods[feature_name] = "training_split_mode"
        else:
            statistics[feature_name] = float(X_train[feature_name].median())
            methods[feature_name] = "training_split_median"

    return {
        "statistics": statistics,
        "methods": methods,
        "training_rows": int(len(X_train)),
        "dataset_path": "data/StressLevelDataset.csv",
        "target_excluded": "stress_level",
        "split_random_state": TRAIN_SPLIT_RANDOM_STATE,
        "split_test_size": TRAIN_SPLIT_TEST_SIZE,
    }


def apply_deterministic_imputation(
    feature_dict: dict[str, int | float | None],
    ordered_features: tuple[str, ...] | list[str] = EXPECTED_FEATURES,
) -> tuple[dict[str, int | float], list[str], str]:
    """Validate missing-value limits and impute permitted nulls using training-split statistics."""
    missing_fields = [
        name for name in ordered_features if feature_dict.get(name) is None
    ]

    if len(missing_fields) > 3:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Too many missing features ({len(missing_fields)}): at most 3 optional features may be null; requests with more than 3 missing features are rejected."
            ),
        )

    imputation_info = compute_training_imputation_statistics()
    train_stats: dict[str, int | float] = imputation_info["statistics"]

    resolved: dict[str, int | float] = {}
    imputed_fields: list[str] = []

    for feature_name in ordered_features:
        value = feature_dict.get(feature_name)
        if value is None:
            if feature_name not in OPTIONAL_NULLABLE_FEATURES:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Missing value is not supported for required feature '{feature_name}'.",
                )
            resolved[feature_name] = train_stats[feature_name]
            imputed_fields.append(feature_name)
        else:
            resolved[feature_name] = value

    imputation_method = (
        "training_split_deterministic (mode for categorical/binary, median for numerical)"
        if imputed_fields
        else "none_required"
    )
    return resolved, imputed_fields, imputation_method


# ---------------------------------------------------------------------------
# FastAPI Application Instance
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Stress Detection System API",
    description=(
        "Production-ready FastAPI service for student stress level classification. "
        "Accepts 20 empirical physiological and psychological features and provides "
        "class predictions with estimated probability distributions using a tuned "
        "Gradient Boosting Classifier pipeline."
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get(
    "/",
    tags=["General"],
    summary="API root information",
)
def root() -> dict[str, Any]:
    """Return API metadata, service description, and documentation endpoints."""
    return {
        "service": "Stress Detection System API",
        "name": "Stress Detection System API",
        "version": "1.0.0",
        "description": "Student Stress Level Classification API powered by Scikit-learn and FastAPI.",
        "status": "online",
        "documentation": "/docs",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "health_check": "/health",
        "model_info": "/model-info",
        "prediction_endpoint": "/predict",
    }


@app.get(
    "/health",
    tags=["Monitoring"],
    summary="Service and model health check",
)
def health() -> dict[str, Any]:
    """Check whether the service is running and the trained model is loaded and ready.

    Returns:
        dict[str, Any]: Service health status and model availability.

    Raises:
        HTTPException: 503 Service Unavailable if the model cannot be loaded.
    """
    try:
        model = get_model()
        model_ready = model is not None
    except ModelLoaderError as err:
        logger.warning("Health check failed due to ModelLoaderError: %s", err)
        model_ready = False
    except Exception as err:
        logger.error("Unexpected error occurred during health check: %s", err)
        model_ready = False

    if not model_ready:
        logger.error("Health check reporting service degraded (model unavailable).")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "unhealthy",
                "model_loaded": False,
                "message": "Trained model artifact is currently unavailable or invalid.",
            },
        )

    return {
        "status": "healthy",
        "model_loaded": True,
        "version": "1.0.0",
    }


@app.get(
    "/model-info",
    tags=["Model"],
    summary="Get model architecture and metadata",
)
def model_info() -> dict[str, Any]:
    """Retrieve detailed information about the model architecture, features, and training metadata.

    Returns:
        dict[str, Any]: Model details including classifier type, feature count,
            ordered feature names list, class identifiers, and tuning metadata.

    Raises:
        HTTPException: 503 Service Unavailable if model metadata cannot be loaded.
    """
    try:
        return get_model_info()
    except ModelLoaderError as err:
        logger.exception("Failed to load model information: %s", err)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model information is currently unavailable.",
        ) from err
    except Exception as err:
        logger.exception("Unexpected error retrieving model information: %s", err)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model information is currently unavailable.",
        ) from err


@app.post(
    "/predict",
    response_model=StressPredictionResponse,
    tags=["Inference"],
    summary="Predict stress level class for a feature vector",
)
def predict(request: StressPredictionRequest) -> StressPredictionResponse:
    """Generate a stress level prediction for a single subject.

    Workflow:
        1. Retrieve the cached, validated machine learning model pipeline.
        2. Convert the Pydantic request payload into a feature dictionary.
        3. Construct a pandas DataFrame preserving the exact feature ordering of the model.
        4. Execute `model.predict()` to obtain the discrete predicted class.
        5. Execute `model.predict_proba()` to compute probability distribution.
        6. Explicitly verify class-probability dimensions match.
        7. Return `StressPredictionResponse` with validated probabilities and educational disclaimer.

    Args:
        request: Validated `StressPredictionRequest` containing 20 features.

    Returns:
        StressPredictionResponse: Predicted class (0, 1, or 2), probabilities mapping,
            and educational disclaimer.

    Raises:
        HTTPException: 503 if the model is unavailable.
        HTTPException: 500 if inference computation fails.
    """
    # 1. Retrieve cached model
    try:
        model = get_model()
    except ModelLoaderError as err:
        logger.error("Model access failed during /predict: %s", err)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Trained model artifact is currently unavailable for inference.",
        ) from err

    # 2. Extract feature dictionary, validate limits, impute optional nulls, and align schema order
    raw_feature_dict = request.to_feature_dict()
    feature_order = tuple(str(name) for name in getattr(model, "feature_names_in_", EXPECTED_FEATURES))
    feature_dict, imputed_fields, imputation_method = apply_deterministic_imputation(
        raw_feature_dict,
        ordered_features=feature_order,
    )
    if imputed_fields:
        logger.info("Applied %s for: %s", imputation_method, imputed_fields)

    input_df = pd.DataFrame([feature_dict])[list(feature_order)]

    # 3. Perform inference
    try:
        raw_prediction = model.predict(input_df)
        predicted_class = int(raw_prediction[0])

        raw_probabilities = model.predict_proba(input_df)[0]
        classes = getattr(model, "classes_", [0, 1, 2])

        # Defensive dimension check
        if len(classes) != len(raw_probabilities):
            raise ValueError("Model classes and probability outputs do not match.")

        probabilities: dict[int, float] = {
            int(cls_label): float(prob)
            for cls_label, prob in zip(classes, raw_probabilities)
        }
    except Exception as err:
        logger.exception("Unexpected error during model inference")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred while generating the prediction.",
        ) from err

    logger.info(
        "Successfully predicted class %d (probability: %.4f)",
        predicted_class,
        probabilities.get(predicted_class, 0.0),
    )

    # 4. Return validated response payload with transparency metadata
    return StressPredictionResponse(
        predicted_class=predicted_class,
        probabilities=probabilities,
        imputed_features=imputed_fields,
        imputation_method=imputation_method,
        uses_proposed_questionnaire_encoding=True,
    )
