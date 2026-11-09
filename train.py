
import json
import os

import joblib
import mlflow
import mlflow.sklearn
import numpy as np
import pandas as pd

from sklearn.model_selection import (
    train_test_split,
    cross_val_score,
    StratifiedKFold
)

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

from mlflow.models import infer_signature


# --------------------------------------------------
# 1. PROJECT CONFIGURATION
# --------------------------------------------------

DATA_PATH = "data/StressLevelDataset.csv"
MODEL_DIR = "model"

TARGET = "stress_level"

RANDOM_STATE = 42

os.makedirs(MODEL_DIR, exist_ok=True)


# --------------------------------------------------
# 2. LOAD DATASET
# --------------------------------------------------

df = pd.read_csv(DATA_PATH)

print("\nDataset shape:", df.shape)

X = df.drop(columns=[TARGET])
y = df[TARGET]

print("Number of features:", X.shape[1])
print("Target classes:", sorted(y.unique()))


# --------------------------------------------------
# 3. TRAIN-TEST SPLIT
# --------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=RANDOM_STATE,
    stratify=y
)

print("\nTraining records:", len(X_train))
print("Testing records:", len(X_test))


# --------------------------------------------------
# 4. DEFINE MODELS
# --------------------------------------------------

models = {

    "Logistic Regression": Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression(
            max_iter=3000,
            random_state=RANDOM_STATE
        ))
    ]),

    "KNN": Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", KNeighborsClassifier(
            n_neighbors=5,
            weights="distance"
        ))
    ]),

    "Gaussian Naive Bayes": Pipeline([
        ("classifier", GaussianNB())
    ]),

    "SVM": Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", SVC(
            kernel="rbf",
            C=1.0,
            gamma="scale"
        ))
    ]),

    "Decision Tree": Pipeline([
        ("classifier", DecisionTreeClassifier(
            random_state=RANDOM_STATE
        ))
    ]),

    "Random Forest": Pipeline([
        ("classifier", RandomForestClassifier(
            n_estimators=300,
            random_state=RANDOM_STATE,
            n_jobs=-1
        ))
    ]),

    "Gradient Boosting": Pipeline([
        ("classifier", GradientBoostingClassifier(
            n_estimators=150,
            learning_rate=0.1,
            max_depth=3,
            random_state=RANDOM_STATE
        ))
    ])
}


# --------------------------------------------------
# 5. CROSS-VALIDATION CONFIGURATION
# --------------------------------------------------

cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=RANDOM_STATE
)


# --------------------------------------------------
# 6. MLFLOW CONFIGURATION
# --------------------------------------------------

mlflow.set_tracking_uri("sqlite:///mlflow.db")

mlflow.set_experiment(
    "Stress Detection - Seven Model Comparison"
)


# --------------------------------------------------
# 7. TRAIN AND EVALUATE ALL MODELS
# --------------------------------------------------

results = []

trained_models = {}

print("\nStarting model comparison...\n")

for model_name, model in models.items():

    print("=" * 55)
    print("Training:", model_name)

    # Cross-validation on training data only
    cv_scores = cross_val_score(
        model,
        X_train,
        y_train,
        cv=cv,
        scoring="f1_macro",
        n_jobs=-1
    )

    mean_cv_f1 = cv_scores.mean()
    std_cv_f1 = cv_scores.std()

    # Train model on the complete training set
    model.fit(X_train, y_train)

    # Predict on unseen test data
    y_pred = model.predict(X_test)

    # Evaluation metrics
    accuracy = accuracy_score(y_test, y_pred)

    precision = precision_score(
        y_test,
        y_pred,
        average="macro",
        zero_division=0
    )

    recall = recall_score(
        y_test,
        y_pred,
        average="macro",
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        y_pred,
        average="macro",
        zero_division=0
    )

    print(f"CV Macro F1: {mean_cv_f1:.4f}")
    print(f"CV F1 Std:   {std_cv_f1:.4f}")
    print(f"Test Accuracy: {accuracy:.4f}")
    print(f"Test Precision: {precision:.4f}")
    print(f"Test Recall: {recall:.4f}")
    print(f"Test Macro F1: {f1:.4f}")

    # Save metrics for comparison
    results.append({
        "Model": model_name,
        "CV Macro F1": mean_cv_f1,
        "CV F1 Std": std_cv_f1,
        "Test Accuracy": accuracy,
        "Test Precision": precision,
        "Test Recall": recall,
        "Test Macro F1": f1
    })

    trained_models[model_name] = model

    # MLflow logging
    with mlflow.start_run(run_name=model_name):

        mlflow.log_param("model_name", model_name)
        mlflow.log_param("random_state", RANDOM_STATE)
        mlflow.log_param("cv_folds", 5)
        mlflow.log_param("test_size", 0.20)

        # Log model-specific parameters
        params = model.get_params(deep=True)

        for param_name in [
            "classifier__n_neighbors",
            "classifier__weights",
            "classifier__kernel",
            "classifier__C",
            "classifier__gamma",
            "classifier__max_iter",
            "classifier__max_depth",
            "classifier__n_estimators",
            "classifier__learning_rate",
            "classifier__min_samples_split",
            "classifier__min_samples_leaf"
        ]:
            if param_name in params:
                mlflow.log_param(
                    param_name,
                    str(params[param_name])
                )

        mlflow.log_metric("cv_macro_f1", mean_cv_f1)
        mlflow.log_metric("cv_f1_std", std_cv_f1)
        mlflow.log_metric("test_accuracy", accuracy)
        mlflow.log_metric("test_precision_macro", precision)
        mlflow.log_metric("test_recall_macro", recall)
        mlflow.log_metric("test_f1_macro", f1)

        # Add model signature and sample input
        input_example = X_train.head(5)

        signature = infer_signature(
            input_example,
            model.predict(input_example)
        )

        mlflow.sklearn.log_model(
            sk_model=model,
            artifact_path="model",
            signature=signature,
            input_example=input_example
        )


# --------------------------------------------------
# 8. COMPARE ALL MODELS
# --------------------------------------------------

results_df = pd.DataFrame(results)

results_df = results_df.sort_values(
    by="CV Macro F1",
    ascending=False
).reset_index(drop=True)

print("\n\n")
print("=" * 75)
print("FINAL MODEL COMPARISON")
print("=" * 75)

print(results_df.to_string(index=False))


# --------------------------------------------------
# 9. SELECT BEST MODEL USING CV MACRO F1
# --------------------------------------------------

best_model_name = results_df.iloc[0]["Model"]

best_model = trained_models[best_model_name]

best_cv_f1 = results_df.iloc[0]["CV Macro F1"]

print("\nBest Model:", best_model_name)
print(f"Best CV Macro F1: {best_cv_f1:.4f}")


# --------------------------------------------------
# 10. FINAL MODEL EVALUATION
# --------------------------------------------------

y_pred = best_model.predict(X_test)

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred,
        zero_division=0
    )
)

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))


# --------------------------------------------------
# 11. SAVE BEST MODEL
# --------------------------------------------------

model_path = os.path.join(
    MODEL_DIR,
    "model.joblib"
)

metadata_path = os.path.join(
    MODEL_DIR,
    "metadata.json"
)

joblib.dump(best_model, model_path)

metadata = {
    "model_name": best_model_name,
    "target": TARGET,
    "features": list(X.columns),
    "classes": [int(value) for value in best_model.classes_],
    "selection_metric": "5-fold Cross Validation Macro F1",
    "cv_macro_f1": float(best_cv_f1),
    "test_metrics": {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision_macro": float(
            precision_score(
                y_test, y_pred,
                average="macro",
                zero_division=0
            )
        ),
        "recall_macro": float(
            recall_score(
                y_test, y_pred,
                average="macro",
                zero_division=0
            )
        ),
        "f1_macro": float(
            f1_score(
                y_test, y_pred,
                average="macro",
                zero_division=0
            )
        )
    },
    "model_comparison": results_df.to_dict(orient="records")
}

with open(metadata_path, "w") as file:
    json.dump(metadata, file, indent=4)

print("\nBest model saved successfully!")
print("Model path:", model_path)
print("Metadata path:", metadata_path)

print("\nModel comparison completed!")









# import json
# from pathlib import Path

# import joblib
# import mlflow
# import mlflow.sklearn
# import pandas as pd

# from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
# from sklearn.linear_model import LogisticRegression
# from sklearn.metrics import (
#     accuracy_score,
#     precision_score,
#     recall_score,
#     f1_score,
#     classification_report,
# )
# from sklearn.model_selection import train_test_split, cross_val_score
# from sklearn.pipeline import Pipeline
# from sklearn.preprocessing import StandardScaler


# # --------------------------------------------------
# # 1. Project paths and configuration
# # --------------------------------------------------

# DATA_PATH = Path("data/StressLevelDataset.csv")
# MODEL_DIR = Path("model")
# MODEL_PATH = MODEL_DIR / "model.joblib"
# METADATA_PATH = MODEL_DIR / "metadata.json"

# TARGET_COLUMN = "stress_level"
# RANDOM_STATE = 42

# MODEL_DIR.mkdir(parents=True, exist_ok=True)


# # --------------------------------------------------
# # 2. Load and prepare the dataset
# # --------------------------------------------------

# print("\nLoading dataset...")

# df = pd.read_csv(DATA_PATH)

# X = df.drop(columns=[TARGET_COLUMN])
# y = df[TARGET_COLUMN]

# feature_names = X.columns.tolist()

# print("Dataset shape:", df.shape)
# print("Number of features:", len(feature_names))
# print("Target classes:", sorted(y.unique().tolist()))


# # --------------------------------------------------
# # 3. Split the dataset
# # --------------------------------------------------

# X_train, X_test, y_train, y_test = train_test_split(
#     X,
#     y,
#     test_size=0.20,
#     random_state=RANDOM_STATE,
#     stratify=y,
# )

# print("\nTraining records:", len(X_train))
# print("Testing records:", len(X_test))


# # --------------------------------------------------
# # 4. Define the models
# # --------------------------------------------------

# models = {
#     "Logistic Regression": Pipeline([
#         ("scaler", StandardScaler()),
#         ("classifier", LogisticRegression(max_iter=2000)),
#     ]),

#     "Random Forest": Pipeline([
#         ("classifier", RandomForestClassifier(
#             n_estimators=300,
#             random_state=RANDOM_STATE,
#         )),
#     ]),

#     "Gradient Boosting": Pipeline([
#         ("classifier", GradientBoostingClassifier(
#             n_estimators=150,
#             learning_rate=0.1,
#             max_depth=3,
#             random_state=RANDOM_STATE,
#         )),
#     ]),
# }


# # --------------------------------------------------
# # 5. Configure MLflow
# # --------------------------------------------------

# mlflow.set_tracking_uri("sqlite:///mlflow.db")
# mlflow.set_experiment("Stress Detection Model Comparison")

# results = []
# best_cv_score = -1
# best_model = None
# best_model_name = None
# best_test_metrics = None


# # --------------------------------------------------
# # 6. Train, evaluate and track each model
# # --------------------------------------------------

# for model_name, model in models.items():

#     print(f"\n{'=' * 50}")
#     print("Training:", model_name)
#     print("=" * 50)

#     # Cross-validation happens only on training data.
#     cv_scores = cross_val_score(
#         model,
#         X_train,
#         y_train,
#         cv=5,
#         scoring="f1_macro",
#     )

#     mean_cv_f1 = cv_scores.mean()

#     # Fit the model on the complete training split.
#     model.fit(X_train, y_train)

#     # Evaluate on the untouched test split.
#     predictions = model.predict(X_test)

#     accuracy = accuracy_score(y_test, predictions)
#     precision = precision_score(
#         y_test, predictions, average="macro", zero_division=0
#     )
#     recall = recall_score(
#         y_test, predictions, average="macro", zero_division=0
#     )
#     macro_f1 = f1_score(
#         y_test, predictions, average="macro", zero_division=0
#     )

#     print(f"Cross-validation Macro F1: {mean_cv_f1:.4f}")
#     print(f"Test Accuracy:             {accuracy:.4f}")
#     print(f"Test Precision (Macro):    {precision:.4f}")
#     print(f"Test Recall (Macro):       {recall:.4f}")
#     print(f"Test F1 (Macro):           {macro_f1:.4f}")

#     # Create a separate MLflow run for each algorithm.
#     with mlflow.start_run(run_name=model_name):

#         mlflow.log_param("model_name", model_name)
#         mlflow.log_param("random_state", RANDOM_STATE)
#         mlflow.log_param("test_size", 0.20)
#         mlflow.log_param("cross_validation_folds", 5)
#         mlflow.log_param("feature_count", len(feature_names))
#         mlflow.log_param("training_rows", len(X_train))

#         mlflow.log_metric("cv_f1_macro", float(mean_cv_f1))
#         mlflow.log_metric("test_accuracy", float(accuracy))
#         mlflow.log_metric("test_precision_macro", float(precision))
#         mlflow.log_metric("test_recall_macro", float(recall))
#         mlflow.log_metric("test_f1_macro", float(macro_f1))

#         mlflow.sklearn.log_model(
#             model,
#             artifact_path="model",
#         )

#     results.append({
#         "model": model_name,
#         "cv_f1_macro": float(mean_cv_f1),
#         "test_accuracy": float(accuracy),
#         "test_f1_macro": float(macro_f1),
#     })

#     # Select the model using training cross-validation,
#     # not by repeatedly choosing based on test performance.
#     if mean_cv_f1 > best_cv_score:
#         best_cv_score = mean_cv_f1
#         best_model = model
#         best_model_name = model_name

#         best_test_metrics = {
#             "accuracy": float(accuracy),
#             "precision_macro": float(precision),
#             "recall_macro": float(recall),
#             "f1_macro": float(macro_f1),
#         }


# # --------------------------------------------------
# # 7. Save the best model
# # --------------------------------------------------

# joblib.dump(best_model, MODEL_PATH)

# metadata = {
#     "model_name": best_model_name,
#     "target_column": TARGET_COLUMN,
#     "feature_names": feature_names,
#     "classes": [int(value) for value in sorted(y.unique())],
#     "selection_metric": "5-fold cross-validation macro F1",
#     "cross_validation_f1_macro": float(best_cv_score),
#     "test_metrics": best_test_metrics,
# }

# with open(METADATA_PATH, "w") as file:
#     json.dump(metadata, file, indent=4)


# # --------------------------------------------------
# # 8. Display final comparison
# # --------------------------------------------------

# results_df = pd.DataFrame(results)

# print("\n\nMODEL COMPARISON")
# print(results_df.to_string(index=False))

# print("\nBest model:", best_model_name)
# print(f"Best cross-validation Macro F1: {best_cv_score:.4f}")

# print("\nClassification Report for the selected model:")
# print(classification_report(
#     y_test,
#     best_model.predict(X_test),
#     zero_division=0,
# ))

# print("\nSaved model to:", MODEL_PATH)
# print("Saved metadata to:", METADATA_PATH)
# print("\nMLflow experiment tracking is available.")
# print("Run: mlflow ui --backend-store-uri sqlite:///mlflow.db")
