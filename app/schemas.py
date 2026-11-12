"""Pydantic schemas for the Stress Detection FastAPI backend.

This module defines request and response data models conforming to Pydantic v2.
Feature ranges are strictly grounded in empirical minimum and maximum values
identified directly from `data/StressLevelDataset.csv`.
"""

import math
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    StrictFloat,
    StrictInt,
    field_validator,
    model_validator,
)


# ---------------------------------------------------------------------------
# 1. Prediction Request Schema
# ---------------------------------------------------------------------------
class StressPredictionRequest(BaseModel):
    """Input payload containing the 20 numerical features required for prediction.

    Range constraints are strictly bounded by the minimum and maximum values
    observed in the training dataset (`data/StressLevelDataset.csv`).
    Unexpected fields are strictly forbidden, booleans/strings/NaN/Inf are rejected
    via strict typing (`StrictInt | StrictFloat`, `allow_inf_nan=False`), and
    optional sensitive fields (`mental_health_history`, `blood_pressure`, `bullying`)
    accept explicit `None` (`null`) for backend median imputation.
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
    anxiety_level: StrictInt | StrictFloat = Field(
        ...,
        ge=0,
        le=21,
        allow_inf_nan=False,
        description="Reported anxiety score on a scale from 0 to 21 (dataset observed range: [0, 21]).",
    )
    self_esteem: StrictInt | StrictFloat = Field(
        ...,
        ge=0,
        le=30,
        allow_inf_nan=False,
        description="Reported self-esteem score on a scale from 0 to 30 (dataset observed range: [0, 30]).",
    )
    mental_health_history: StrictInt | StrictFloat | None = Field(
        ...,
        ge=0,
        le=1,
        allow_inf_nan=False,
        description="Binary indicator for mental health history in {0, 1}, or null if undisclosed (imputed in backend).",
    )
    depression: StrictInt | StrictFloat = Field(
        ...,
        ge=0,
        le=27,
        allow_inf_nan=False,
        description="Reported depression score on a scale from 0 to 27 (dataset observed range: [0, 27]).",
    )
    headache: StrictInt | StrictFloat = Field(
        ...,
        ge=0,
        le=5,
        allow_inf_nan=False,
        description="Rating score for headache on a scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    blood_pressure: StrictInt | StrictFloat | None = Field(
        ...,
        ge=1,
        le=3,
        allow_inf_nan=False,
        description="Categorical score for blood pressure in {1, 2, 3}, or null if undisclosed (imputed in backend).",
    )
    sleep_quality: StrictInt | StrictFloat = Field(
        ...,
        ge=0,
        le=5,
        allow_inf_nan=False,
        description="Rating score for sleep quality on a scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    breathing_problem: StrictInt | StrictFloat = Field(
        ...,
        ge=0,
        le=5,
        allow_inf_nan=False,
        description="Rating score for breathing problem on a scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    noise_level: StrictInt | StrictFloat = Field(
        ...,
        ge=0,
        le=5,
        allow_inf_nan=False,
        description="Rating score for noise level on a scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    living_conditions: StrictInt | StrictFloat = Field(
        ...,
        ge=0,
        le=5,
        allow_inf_nan=False,
        description="Rating score for living conditions on a scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    safety: StrictInt | StrictFloat = Field(
        ...,
        ge=0,
        le=5,
        allow_inf_nan=False,
        description="Rating score for safety on a scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    basic_needs: StrictInt | StrictFloat = Field(
        ...,
        ge=0,
        le=5,
        allow_inf_nan=False,
        description="Rating score for basic needs on a scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    academic_performance: StrictInt | StrictFloat = Field(
        ...,
        ge=0,
        le=5,
        allow_inf_nan=False,
        description="Rating score for academic performance on a scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    study_load: StrictInt | StrictFloat = Field(
        ...,
        ge=0,
        le=5,
        allow_inf_nan=False,
        description="Rating score for study load on a scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    teacher_student_relationship: StrictInt | StrictFloat = Field(
        ...,
        ge=0,
        le=5,
        allow_inf_nan=False,
        description="Rating score for teacher-student relationship on a scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    future_career_concerns: StrictInt | StrictFloat = Field(
        ...,
        ge=0,
        le=5,
        allow_inf_nan=False,
        description="Rating score for future career concerns on a scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    social_support: StrictInt | StrictFloat = Field(
        ...,
        ge=0,
        le=3,
        allow_inf_nan=False,
        description="Rating score for social support on a scale from 0 to 3 (dataset observed range: [0, 3]).",
    )
    peer_pressure: StrictInt | StrictFloat = Field(
        ...,
        ge=0,
        le=5,
        allow_inf_nan=False,
        description="Rating score for peer pressure on a scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    extracurricular_activities: StrictInt | StrictFloat = Field(
        ...,
        ge=0,
        le=5,
        allow_inf_nan=False,
        description="Rating score for extracurricular activities on a scale from 0 to 5 (dataset observed range: [0, 5]).",
    )
    bullying: StrictInt | StrictFloat | None = Field(
        ...,
        ge=0,
        le=5,
        allow_inf_nan=False,
        description="Rating score for bullying on a scale from 0 to 5, or null if undisclosed (imputed in backend).",
    )

    @model_validator(mode="after")
    def validate_missing_limits(self) -> "StressPredictionRequest":
        """Enforce missing-value guardrails on optional features."""
        values = self.model_dump()
        missing_fields = [name for name, val in values.items() if val is None]
        optional_fields = {"mental_health_history", "blood_pressure", "bullying"}

        disallowed = [name for name in missing_fields if name not in optional_fields]
        if disallowed:
            raise ValueError(f"Missing value is not supported for required feature(s): {disallowed}.")

        if len(missing_fields) > 3:
            raise ValueError(
                f"Too many missing features ({len(missing_fields)}): at most 3 optional features may be null."
            )

        return self

    def to_feature_dict(self) -> dict[str, int | float | None]:
        """Convert input data into a dictionary of features."""
        return self.model_dump()


# ---------------------------------------------------------------------------
# 2. Prediction Response Schema
# ---------------------------------------------------------------------------
class StressPredictionResponse(BaseModel):
    """Output payload returned by the prediction endpoint.

    Contains the predicted class identifier, probability distribution across
    all valid classes, educational non-clinical disclaimer, and transparency
    metadata covering proposed encoding and deterministic imputation.
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
    imputed_features: list[str] = Field(
        default_factory=list,
        description="Ordered list of optional feature names whose null inputs were filled via deterministic training-split imputation.",
    )
    imputation_method: str = Field(
        default="none_required",
        description="Method used for missing-value handling (e.g., training-split mode/median imputation or none_required).",
    )
    uses_proposed_questionnaire_encoding: bool = Field(
        default=True,
        description="Indicates the endpoint accepts inputs compatible with MindScope's proposed, unvalidated 20-question encoding.",
    )
    encoding_notice: str = Field(
        default=(
            "Model inference accepts proposed questionnaire-mapped numeric values and optional "
            "deterministic imputation; proposed encodings are not clinically validated."
        ),
        description="Non-clinical transparency notice regarding proposed questionnaire encoding.",
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
