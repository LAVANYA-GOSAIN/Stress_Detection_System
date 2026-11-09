"""Pydantic schemas for the Stress Detection FastAPI backend.

This module defines request and response data models conforming to Pydantic v2.
Feature ranges are strictly grounded in empirical minimum and maximum values
identified directly from `data/StressLevelDataset.csv`.
"""

import math
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, StrictInt, field_validator


# ---------------------------------------------------------------------------
# 1. Prediction Request Schema
# ---------------------------------------------------------------------------
class StressPredictionRequest(BaseModel):
    """Input payload containing the 20 numerical features required for prediction.

    Range constraints are strictly bounded by the minimum and maximum values
    observed in the training dataset (`data/StressLevelDataset.csv`).
    Unexpected fields are strictly forbidden, and strict integer type checking
    is enforced to prevent silent coercion of floats or booleans.
    """

    model_config = ConfigDict(
        extra="forbid",
        strict=True,
        json_schema_extra={
            "example": {
                "anxiety_level": 14,
                "self_esteem": 20,
                "mental_health_history": 0,
                "depression": 11,
                "headache": 2,
                "blood_pressure": 2,
                "sleep_quality": 2,
                "breathing_problem": 4,
                "noise_level": 2,
                "living_conditions": 3,
                "safety": 3,
                "basic_needs": 2,
                "academic_performance": 3,
                "study_load": 2,
                "teacher_student_relationship": 3,
                "future_career_concerns": 3,
                "social_support": 2,
                "peer_pressure": 3,
                "extracurricular_activities": 3,
                "bullying": 2,
            }
        },
    )

    # Features bounded strictly by empirical dataset inspection:
    anxiety_level: StrictInt = Field(
        ...,
        ge=0,
        le=21,
        description="Reported anxiety score on an integer scale from 0 to 21 (dataset observed range: [0, 21]).",
    )
    self_esteem: StrictInt = Field(
        ...,
        ge=0,
        le=30,
        description="Reported self-esteem score on an integer scale from 0 to 30 (dataset observed range: [0, 30]).",
    )
    mental_health_history: StrictInt = Field(
        ...,
        ge=0,
        le=1,
        description="Binary indicator for mental health history with observed integer values in {0, 1}.",
    )
    depression: StrictInt = Field(
        ...,
        ge=0,
        le=27,
        description="Reported depression score on an integer scale from 0 to 27 (dataset observed range: [0, 27]).",
    )
    headache: StrictInt = Field(
        ...,
        ge=0,
        le=5,
        description="Rating score for headache on an integer scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    blood_pressure: StrictInt = Field(
        ...,
        ge=1,
        le=3,
        description="Rating score for blood pressure on an integer scale from 1 to 3 (dataset observed range: [1, 3]).",
    )
    sleep_quality: StrictInt = Field(
        ...,
        ge=0,
        le=5,
        description="Rating score for sleep quality on an integer scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    breathing_problem: StrictInt = Field(
        ...,
        ge=0,
        le=5,
        description="Rating score for breathing problem on an integer scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    noise_level: StrictInt = Field(
        ...,
        ge=0,
        le=5,
        description="Rating score for noise level on an integer scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    living_conditions: StrictInt = Field(
        ...,
        ge=0,
        le=5,
        description="Rating score for living conditions on an integer scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    safety: StrictInt = Field(
        ...,
        ge=0,
        le=5,
        description="Rating score for safety on an integer scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    basic_needs: StrictInt = Field(
        ...,
        ge=0,
        le=5,
        description="Rating score for basic needs on an integer scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    academic_performance: StrictInt = Field(
        ...,
        ge=0,
        le=5,
        description="Rating score for academic performance on an integer scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    study_load: StrictInt = Field(
        ...,
        ge=0,
        le=5,
        description="Rating score for study load on an integer scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    teacher_student_relationship: StrictInt = Field(
        ...,
        ge=0,
        le=5,
        description="Rating score for teacher-student relationship on an integer scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    future_career_concerns: StrictInt = Field(
        ...,
        ge=0,
        le=5,
        description="Rating score for future career concerns on an integer scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    social_support: StrictInt = Field(
        ...,
        ge=0,
        le=3,
        description="Rating score for social support on an integer scale from 0 to 3 (dataset observed range: [0, 3]).",
    )
    peer_pressure: StrictInt = Field(
        ...,
        ge=0,
        le=5,
        description="Rating score for peer pressure on an integer scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    extracurricular_activities: StrictInt = Field(
        ...,
        ge=0,
        le=5,
        description="Rating score for extracurricular activities on an integer scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    bullying: StrictInt = Field(
        ...,
        ge=0,
        le=5,
        description="Rating score for bullying on an integer scale from 0 to 5 (dataset observed range: [0, 5]).",
    )

    def to_feature_dict(self) -> dict[str, int]:
        """Convert input data into a dictionary of features."""
        return self.model_dump()


# ---------------------------------------------------------------------------
# 2. Prediction Response Schema
# ---------------------------------------------------------------------------
class StressPredictionResponse(BaseModel):
    """Output payload returned by the prediction endpoint.

    Contains the predicted class identifier, probability distribution across
    all valid classes, and an educational, non-clinical disclaimer. Semantic
    interpretations (e.g., Low/Moderate/High) are omitted as they are unverified.
    """

    predicted_class: Literal[0, 1, 2] = Field(
        ...,
        description="Predicted discrete class identifier (constrained strictly to 0, 1, or 2).",
    )
    probabilities: dict[int, float] = Field(
        ...,
        description="Mapping of all discrete class identifiers (0, 1, 2) to their predicted model probabilities.",
    )
    disclaimer: str = Field(
        default="This prediction is generated by a machine learning model for educational purposes only and does not constitute a medical or clinical diagnosis.",
        description="Notice stating that the prediction is educational and not a clinical diagnosis.",
    )

    @field_validator("probabilities")
    @classmethod
    def validate_probabilities(cls, v: dict[int, float]) -> dict[int, float]:
        """Validate probability mapping structure, value ranges, and sum tolerance.

        Requirements:
            - Must contain exactly class keys {0, 1, 2}.
            - Every individual probability must be between 0.0 and 1.0.
            - Total sum of probabilities must equal approximately 1.0 within a tolerance of 1e-3.
        """
        required_classes = {0, 1, 2}
        if set(v.keys()) != required_classes:
            raise ValueError(
                f"Probabilities mapping must contain exactly class keys {sorted(required_classes)}, "
                f"found keys {sorted(v.keys())}."
            )

        for class_label, prob in v.items():
            if not (0.0 <= prob <= 1.0):
                raise ValueError(
                    f"Probability for class {class_label} must be between 0.0 and 1.0, got {prob}."
                )

        total_prob = sum(v.values())
        if not math.isclose(total_prob, 1.0, abs_tol=1e-3):
            raise ValueError(
                f"Sum of class probabilities must be approximately 1.0, got {total_prob}."
            )

        return v
