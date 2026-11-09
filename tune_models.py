
import json
import os

import joblib
import mlflow
import mlflow.sklearn
import pandas as pd

from sklearn.model_selection import (
    train_test_split,
    GridSearchCV,
    StratifiedKFold
)

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression

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
# 1. CONFIGURATION
# --------------------------------------------------

DATA_PATH = "data/StressLevelDataset.csv"
MODEL_DIR = "model"
TARGET = "stress_level"

RANDOM_STATE = 42

os.makedirs(MODEL_DIR, exist_ok=True)


# --------------------------------------------------
# 2. LOAD DATA
# --------------------------------------------------

df = pd.read_csv(DATA_PATH)

X = df.drop(columns=[TARGET])
y = df[TARGET]

print("Dataset shape:", df.shape)
print("Features:", X.shape[1])


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

print("Training records:", len(X_train))
print("Testing records:", len(X_test))


# --------------------------------------------------
# 4. DEFINE FOUR MODELS AND SEARCH SPACES
# --------------------------------------------------

searches = {

    "Gaussian Naive Bayes": {
        "pipeline": Pipeline([
            ("classifier", GaussianNB())
        ]),
        "params": {
            "classifier__var_smoothing": [
                1e-9, 1e-8, 1e-7, 1e-6, 1e-5
            ]
        }
    },

    "Gradient Boosting": {
        "pipeline": Pipeline([
            ("classifier", GradientBoostingClassifier(
                random_state=RANDOM_STATE
            ))
        ]),
        "params": {
            "classifier__n_estimators": [100, 150, 200],
            "classifier__learning_rate": [0.03, 0.05, 0.1],
            "classifier__max_depth": [2, 3, 4]
        }
    },

    "Decision Tree": {
        "pipeline": Pipeline([
            ("classifier", DecisionTreeClassifier(
                random_state=RANDOM_STATE
            ))
        ]),
        "params": {
            "classifier__max_depth": [None, 5, 10, 15],
            "classifier__min_samples_split": [2, 5, 10],
            "classifier__min_samples_leaf": [1, 2, 4]
        }
    },

    "Logistic Regression": {
        "pipeline": Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", LogisticRegression(
                max_iter=3000,
                random_state=RANDOM_STATE
            ))
        ]),
        "params": {
            "classifier__C": [0.01, 0.1, 1, 10],
            "classifier__solver": ["lbfgs", "newton-cg"]
        }
    }
}


# --------------------------------------------------
# 5. CROSS-VALIDATION
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
    "Stress Detection - Hyperparameter Tuning"
)


# --------------------------------------------------
# 7. TUNE EACH MODEL
# --------------------------------------------------

tuning_results = []
best_estimators = {}

for model_name, config in searches.items():

    print("\n" + "=" * 60)
    print("Tuning:", model_name)

    grid_search = GridSearchCV(
        estimator=config["pipeline"],
        param_grid=config["params"],
        scoring="f1_macro",
        cv=cv,
        n_jobs=-1,
        refit=True,
        return_train_score=True
    )

    grid_search.fit(X_train, y_train)

    best_model = grid_search.best_estimator_

    best_cv_f1 = grid_search.best_score_
    cv_std = grid_search.cv_results_[
        "std_test_score"
    ][grid_search.best_index_]

    # Evaluate only after tuning is complete
    y_pred = best_model.predict(X_test)

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

    test_f1 = f1_score(
        y_test,
        y_pred,
        average="macro",
        zero_division=0
    )

    print("Best parameters:", grid_search.best_params_)
    print(f"Best CV Macro F1: {best_cv_f1:.4f}")
    print(f"CV F1 Std: {cv_std:.4f}")
    print(f"Test Accuracy: {accuracy:.4f}")
    print(f"Test Macro F1: {test_f1:.4f}")

    tuning_results.append({
        "Model": model_name,
        "Best CV Macro F1": best_cv_f1,
        "CV F1 Std": cv_std,
        "Test Accuracy": accuracy,
        "Test Precision": precision,
        "Test Recall": recall,
        "Test Macro F1": test_f1,
        "Best Parameters": grid_search.best_params_
    })

    best_estimators[model_name] = best_model

    # Log this tuning result in MLflow
    with mlflow.start_run(run_name=f"{model_name} Tuned"):

        mlflow.log_param("model_name", model_name)
        mlflow.log_param("cv_folds", 5)
        mlflow.log_param("selection_metric", "f1_macro")

        for param_name, param_value in grid_search.best_params_.items():
            mlflow.log_param(
                param_name,
                str(param_value)
            )

        mlflow.log_metric("best_cv_macro_f1", best_cv_f1)
        mlflow.log_metric("cv_f1_std", cv_std)
        mlflow.log_metric("test_accuracy", accuracy)
        mlflow.log_metric("test_precision_macro", precision)
        mlflow.log_metric("test_recall_macro", recall)
        mlflow.log_metric("test_f1_macro", test_f1)

        # Use float input example to avoid integer schema warning
        input_example = X_train.head(5).astype("float64")

        signature = infer_signature(
            input_example,
            best_model.predict(input_example)
        )

        mlflow.sklearn.log_model(
            sk_model=best_model,
            artifact_path="model",
            signature=signature,
            input_example=input_example
        )


# --------------------------------------------------
# 8. COMPARE TUNED MODELS
# --------------------------------------------------

results_df = pd.DataFrame(tuning_results)

results_df = results_df.sort_values(
    by="Best CV Macro F1",
    ascending=False
).reset_index(drop=True)

print("\n" + "=" * 80)
print("HYPERPARAMETER TUNING RESULTS")
print("=" * 80)

print(
    results_df[
        [
            "Model",
            "Best CV Macro F1",
            "CV F1 Std",
            "Test Accuracy",
            "Test Macro F1"
        ]
    ].to_string(index=False)
)


# --------------------------------------------------
# 9. SELECT BEST TUNED MODEL
# --------------------------------------------------

best_model_name = results_df.iloc[0]["Model"]

final_model = best_estimators[best_model_name]

best_cv_f1 = results_df.iloc[0]["Best CV Macro F1"]

print("\nBest Tuned Model:", best_model_name)
print(f"Best CV Macro F1: {best_cv_f1:.4f}")


# --------------------------------------------------
# 10. FINAL EVALUATION
# --------------------------------------------------

y_pred = final_model.predict(X_test)

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
# 11. SAVE TUNED MODEL SEPARATELY
# --------------------------------------------------

tuned_model_path = os.path.join(
    MODEL_DIR,
    "tuned_model.joblib"
)

tuned_metadata_path = os.path.join(
    MODEL_DIR,
    "tuning_metadata.json"
)

joblib.dump(final_model, tuned_model_path)

metadata = {
    "model_name": best_model_name,
    "target": TARGET,
    "features": list(X.columns),
    "classes": [
        int(value) for value in final_model.classes_
    ],
    "selection_metric": "5-fold Cross Validation Macro F1",
    "cv_macro_f1": float(best_cv_f1),
    "best_parameters": results_df.iloc[0][
        "Best Parameters"
    ],
    "test_metrics": {
        "accuracy": float(
            accuracy_score(y_test, y_pred)
        ),
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
    }
}

with open(tuned_metadata_path, "w") as file:
    json.dump(metadata, file, indent=4)

print("\nTuned model saved successfully!")
print("Model:", tuned_model_path)
print("Metadata:", tuned_metadata_path)

print("\nHyperparameter tuning completed!")
