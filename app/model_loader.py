"""Model loader module for the Stress Detection FastAPI backend.

This module provides cached, thread-safe access to the trained machine learning
model pipeline and its associated training metadata. It verifies model contracts
(expected input features, class labels, and callable inference methods) upon loading
to ensure production reliability.
"""

from functools import lru_cache
import json
import logging
from pathlib import Path
from typing import Any

import joblib
from sklearn.pipeline import Pipeline

# ---------------------------------------------------------------------------
# Path Configuration
# ---------------------------------------------------------------------------
# Project root resolved relative to this module: <PROJECT_ROOT>/app/model_loader.py
PROJECT_ROOT: Path = Path(__file__).resolve().parent.parent

DEFAULT_MODEL_PATH: Path = PROJECT_ROOT / "model" / "tuned_model.joblib"
DEFAULT_METADATA_PATH: Path = PROJECT_ROOT / "model" / "tuning_metadata.json"

# ---------------------------------------------------------------------------
# Model Contract Specification
# ---------------------------------------------------------------------------
EXPECTED_FEATURE_COUNT: int = 20

EXPECTED_CLASSES: tuple[int, ...] = (0, 1, 2)

EXPECTED_FEATURES: tuple[str, ...] = (
    "anxiety_level",
    "self_esteem",
    "mental_health_history",
    "depression",
    "headache",
    "blood_pressure",
    "sleep_quality",
    "breathing_problem",
    "noise_level",
    "living_conditions",
    "safety",
    "basic_needs",
    "academic_performance",
    "study_load",
    "teacher_student_relationship",
    "future_career_concerns",
    "social_support",
    "peer_pressure",
    "extracurricular_activities",
    "bullying",
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Custom Exceptions
# ---------------------------------------------------------------------------
class ModelLoaderError(Exception):
    """Base exception for all model loading and validation errors."""


class ModelNotFoundError(ModelLoaderError, FileNotFoundError):
    """Raised when the model artifact file does not exist."""


class ModelValidationError(ModelLoaderError, ValueError):
    """Raised when the loaded model fails contract or structure validation."""


class ModelMetadataError(ModelLoaderError):
    """Raised when model metadata is missing, unreadable, or invalid."""


# ---------------------------------------------------------------------------
# Validation Logic
# ---------------------------------------------------------------------------
def _validate_model(model: Any) -> None:
    """Validate that the loaded model conforms to expected interface and contract.

    Args:
        model: The deserialized model or pipeline object.

    Raises:
        ModelValidationError: If the model lacks required methods, features, or classes.
    """
    # 1. Verify required inference methods
    for method_name in ("predict", "predict_proba"):
        method = getattr(model, method_name, None)
        if not callable(method):
            raise ModelValidationError(
                f"Model validation failed: '{method_name}' is not callable on {type(model).__name__}."
            )

    # 2. Verify feature names and dimensionality
    if not hasattr(model, "feature_names_in_"):
        raise ModelValidationError(
            "Model validation failed: artifact is missing required 'feature_names_in_' attribute."
        )

    raw_features = model.feature_names_in_
    if not hasattr(raw_features, "__iter__"):
        raise ModelValidationError(
            "Model validation failed: 'feature_names_in_' is not an iterable collection."
        )

    feature_names = [str(f) for f in raw_features]

    if len(feature_names) != EXPECTED_FEATURE_COUNT:
        raise ModelValidationError(
            f"Model validation failed: expected {EXPECTED_FEATURE_COUNT} features, "
            f"found {len(feature_names)}."
        )

    if hasattr(model, "n_features_in_") and model.n_features_in_ != EXPECTED_FEATURE_COUNT:
        raise ModelValidationError(
            f"Model validation failed: 'n_features_in_' is {model.n_features_in_}, "
            f"expected {EXPECTED_FEATURE_COUNT}."
        )

    if tuple(feature_names) != EXPECTED_FEATURES:
        raise ModelValidationError(
            f"Model validation failed: feature names or ordering do not match expected schema.\n"
            f"Expected: {list(EXPECTED_FEATURES)}\n"
            f"Found: {feature_names}"
        )

    # 3. Verify class labels
    if not hasattr(model, "classes_"):
        raise ModelValidationError(
            "Model validation failed: artifact is missing required 'classes_' attribute."
        )

    raw_classes = model.classes_
    if not hasattr(raw_classes, "__iter__"):
        raise ModelValidationError(
            "Model validation failed: 'classes_' is not an iterable collection."
        )

    try:
        model_classes = [int(c) for c in raw_classes]
    except (ValueError, TypeError) as err:
        raise ModelValidationError(
            f"Model validation failed: class labels cannot be converted to integers: {err}"
        ) from err

    if tuple(model_classes) != EXPECTED_CLASSES:
        raise ModelValidationError(
            f"Model validation failed: expected classes {list(EXPECTED_CLASSES)}, "
            f"found {model_classes}."
        )


# ---------------------------------------------------------------------------
# Internal Cached Loaders
# ---------------------------------------------------------------------------
@lru_cache(maxsize=1)
def _load_and_validate_model(resolved_path: Path) -> Pipeline:
    """Internal helper to load, validate, and cache the model pipeline.

    Args:
        resolved_path: Absolute resolved Path to the model file.

    Returns:
        The validated model Pipeline instance.
    """
    logger.info("Loading model artifact from: %s", resolved_path)

    if not resolved_path.is_file():
        raise ModelNotFoundError(f"Model artifact not found at: {resolved_path}")

    try:
        model = joblib.load(resolved_path)
    except Exception as err:
        raise ModelLoaderError(
            f"Failed to deserialize model artifact from '{resolved_path}': {err}"
        ) from err

    _validate_model(model)
    logger.info("Model artifact successfully loaded and validated.")
    return model


@lru_cache(maxsize=1)
def _load_metadata(resolved_path: Path) -> dict[str, Any]:
    """Internal helper to load, parse, and cache the model metadata.

    Args:
        resolved_path: Absolute resolved Path to the metadata JSON file.

    Returns:
        dict[str, Any]: Parsed metadata dictionary.
    """
    logger.info("Loading model metadata from: %s", resolved_path)

    if not resolved_path.is_file():
        raise ModelMetadataError(f"Model metadata file not found at: {resolved_path}")

    try:
        with open(resolved_path, "r", encoding="utf-8") as f:
            metadata = json.load(f)
    except (json.JSONDecodeError, OSError) as err:
        raise ModelMetadataError(
            f"Failed to read or parse metadata JSON from '{resolved_path}': {err}"
        ) from err

    if not isinstance(metadata, dict):
        raise ModelMetadataError(
            f"Metadata root must be a JSON object (dict), found {type(metadata).__name__}."
        )

    logger.info("Model metadata successfully loaded.")
    return metadata


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def get_model(model_path: Path | str | None = None) -> Pipeline:
    """Retrieve the cached, validated machine learning model pipeline.

    The model is loaded and validated on first invocation and subsequently
    served from memory without re-reading the disk.

    Args:
        model_path: Optional path to the model artifact. Defaults to
            PROJECT_ROOT / "model" / "tuned_model.joblib".

    Returns:
        Pipeline: The cached and validated scikit-learn pipeline.

    Raises:
        ModelNotFoundError: If the model artifact does not exist.
        ModelValidationError: If the model fails validation checks.
        ModelLoaderError: If loading or deserialization fails.
    """
    path = Path(model_path).resolve() if model_path is not None else DEFAULT_MODEL_PATH
    return _load_and_validate_model(path)


def get_model_metadata(metadata_path: Path | str | None = None) -> dict[str, Any]:
    """Retrieve the cached model training and tuning metadata.

    Args:
        metadata_path: Optional path to the metadata file. Defaults to
            PROJECT_ROOT / "model" / "tuning_metadata.json".

    Returns:
        dict[str, Any]: The loaded model metadata dictionary.

    Raises:
        ModelMetadataError: If the metadata file cannot be found, read, or parsed.
    """
    path = Path(metadata_path).resolve() if metadata_path is not None else DEFAULT_METADATA_PATH
    return _load_metadata(path)


def get_model_info(
    model_path: Path | str | None = None,
    metadata_path: Path | str | None = None,
) -> dict[str, Any]:
    """Return key operational information about the model and its metadata.

    Args:
        model_path: Optional path to model artifact.
        metadata_path: Optional path to metadata file.

    Returns:
        dict[str, Any]: Dictionary containing model type, pipeline type,
            feature count, feature names list, target classes, and metadata.
    """
    model = get_model(model_path)

    pipeline_type = type(model).__name__
    if hasattr(model, "named_steps") and "classifier" in model.named_steps:
        classifier_type = type(model.named_steps["classifier"]).__name__
    else:
        classifier_type = pipeline_type

    info: dict[str, Any] = {
        "model_type": classifier_type,
        "pipeline_type": pipeline_type,
        "feature_count": len(model.feature_names_in_),
        "feature_names": [str(name) for name in model.feature_names_in_],
        "classes": [int(cls_label) for cls_label in model.classes_],
    }

    try:
        info["metadata"] = get_model_metadata(metadata_path)
    except ModelMetadataError as err:
        logger.warning("Could not attach metadata to model info: %s", err)
        info["metadata"] = None

    return info


def clear_model_cache() -> None:
    """Clear cached model and metadata instances from memory."""
    _load_and_validate_model.cache_clear()
    _load_metadata.cache_clear()

