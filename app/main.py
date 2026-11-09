"""FastAPI backend application for the Stress Detection System.

This module provides the main application instance, manages model lifespan,
and exposes RESTful API endpoints for service health, model architecture introspection,
and real-time stress level prediction.
"""

from contextlib import asynccontextmanager
import logging
from typing import Any

from fastapi import FastAPI, HTTPException, status
import pandas as pd

from app.model_loader import (
    EXPECTED_FEATURES,
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
        # Eagerly load and validate model into cache to ensure zero-latency first request
        model = get_model()
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

    # 2. Extract feature dictionary and align with model feature schema
    feature_dict = request.to_feature_dict()
    feature_order = getattr(model, "feature_names_in_", EXPECTED_FEATURES)
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

    # 4. Return validated response payload
    return StressPredictionResponse(
        predicted_class=predicted_class,
        probabilities=probabilities,
    )
