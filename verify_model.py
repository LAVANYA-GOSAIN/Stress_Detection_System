
import json
import joblib
import numpy as np
import pandas as pd

from pathlib import Path


# --------------------------------------------------
# 1. Define project paths
# --------------------------------------------------

MODEL_PATH = Path("model/tuned_model.joblib")
METADATA_PATH = Path("model/tuning_metadata.json")
DATA_PATH = Path("data/StressLevelDataset.csv")
REPORT_PATH = Path("model/verification_report.json")


# --------------------------------------------------
# 2. Load dataset and identify expected features
# --------------------------------------------------

print("\nStarting Model Verification...\n")

df = pd.read_csv(DATA_PATH)

expected_features = [
    column for column in df.columns
    if column != "stress_level"
]

print("Dataset loaded successfully!")
print("Expected number of features:", len(expected_features))


# --------------------------------------------------
# 3. Verify model and metadata files exist
# --------------------------------------------------

assert MODEL_PATH.exists(), "Tuned model file not found!"
assert METADATA_PATH.exists(), "Model metadata file not found!"

print("Model file exists.")
print("Metadata file exists.")


# --------------------------------------------------
# 4. Load the trained model
# --------------------------------------------------

model = joblib.load(MODEL_PATH)

print("Tuned model loaded successfully!")


# --------------------------------------------------
# 5. Load metadata
# --------------------------------------------------

with open(METADATA_PATH, "r") as file:
    metadata = json.load(file)

print("Model metadata loaded successfully!")


# --------------------------------------------------
# 6. Verify feature count and order
# --------------------------------------------------

model_features = list(model.feature_names_in_)

assert len(model_features) == 20, (
    f"Expected 20 model features, found {len(model_features)}"
)

assert model_features == expected_features, (
    "Feature names or order do not match the dataset!"
)

print("All 20 features are present in the correct order.")


# --------------------------------------------------
# 7. Prepare a sample input
# --------------------------------------------------

X = df[expected_features]

sample_input = X.iloc[[0]]

print("Sample input prepared successfully.")


# --------------------------------------------------
# 8. Generate prediction
# --------------------------------------------------

prediction = model.predict(sample_input)

predicted_class = int(prediction[0])

assert predicted_class in [0, 1, 2], (
    f"Unexpected prediction class: {predicted_class}"
)

print("Prediction generated successfully!")
print("Predicted class:", predicted_class)


# --------------------------------------------------
# 9. Verify prediction probabilities
# --------------------------------------------------

probabilities = model.predict_proba(sample_input)[0]

assert np.all(np.isfinite(probabilities)), (
    "Prediction probabilities contain invalid values!"
)

assert np.all(probabilities >= 0) and np.all(probabilities <= 1), (
    "Probabilities must be between 0 and 1!"
)

assert np.isclose(probabilities.sum(), 1.0, atol=1e-6), (
    "Prediction probabilities do not sum to 1!"
)

print("\nPrediction Probabilities:")

for class_label, probability in zip(model.classes_, probabilities):
    print(f"Class {class_label}: {probability:.4f}")


# --------------------------------------------------
# 10. Verify prediction consistency
# --------------------------------------------------

second_prediction = model.predict(sample_input)

assert np.array_equal(prediction, second_prediction), (
    "Repeated predictions are inconsistent!"
)

print("\nPrediction consistency verified.")


# --------------------------------------------------
# 11. Generate verification report
# --------------------------------------------------

report = {
    "model": "Tuned Gradient Boosting",
    "model_file": str(MODEL_PATH),
    "metadata_file": str(METADATA_PATH),
    "feature_count": len(model_features),
    "feature_order_verified": True,
    "model_loaded": True,
    "metadata_loaded": True,
    "prediction": predicted_class,
    "valid_prediction_class": True,
    "probabilities": {
        str(class_label): float(probability)
        for class_label, probability in zip(model.classes_, probabilities)
    },
    "probabilities_sum": float(probabilities.sum()),
    "prediction_consistent": True,
    "verification_status": "PASSED"
}

with open(REPORT_PATH, "w") as file:
    json.dump(report, file, indent=4)

print("\nVerification Report saved successfully!")
print("Location:", REPORT_PATH)

print("\nALL MODEL VERIFICATION CHECKS PASSED!")
