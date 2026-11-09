
import joblib
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.base import clone
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split, StratifiedKFold


# 1. Load dataset
df = pd.read_csv("data/StressLevelDataset.csv")

X = df.drop(columns=["stress_level"])
y = df["stress_level"]

print("Dataset loaded successfully!")
print("Number of features:", X.shape[1])


# 2. Recreate the original train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Training samples:", len(X_train))
print("Held-out test samples:", len(X_test))


# 3. Load tuned model
model = joblib.load("model/tuned_model.joblib")

print("Tuned model loaded successfully!")


# 4. Perform 5-fold CV only on training data
cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

importance_scores = []

for train_index, validation_index in cv.split(X_train, y_train):

    X_fold_train = X_train.iloc[train_index]
    X_fold_validation = X_train.iloc[validation_index]

    y_fold_train = y_train.iloc[train_index]
    y_fold_validation = y_train.iloc[validation_index]

    fold_model = clone(model)
    fold_model.fit(X_fold_train, y_fold_train)

    result = permutation_importance(
        fold_model,
        X_fold_validation,
        y_fold_validation,
        scoring="f1_macro",
        n_repeats=10,
        random_state=42,
        n_jobs=-1
    )

    importance_scores.append(result.importances_mean)


# 5. Calculate average importance
scores_df = pd.DataFrame(
    importance_scores,
    columns=X.columns
)

importance_df = pd.DataFrame({
    "feature": X.columns,
    "importance_mean": scores_df.mean(axis=0).values,
    "importance_std": scores_df.std(axis=0).values
})

importance_df = importance_df.sort_values(
    by="importance_mean",
    ascending=False
).reset_index(drop=True)


# 6. Save CSV
importance_df.to_csv(
    "model/feature_importance.csv",
    index=False
)

print("\nFeature Importance Results:")
print(importance_df.to_string(index=False))


# 7. Plot top 10 features
top_features = importance_df.head(10).sort_values(
    by="importance_mean",
    ascending=True
)

plt.figure(figsize=(10, 6))

plt.barh(
    top_features["feature"],
    top_features["importance_mean"],
    xerr=top_features["importance_std"]
)

plt.xlabel("Mean decrease in Macro F1")
plt.ylabel("Features")
plt.title("Top 10 Feature Importance - Gradient Boosting")
plt.tight_layout()

plt.savefig(
    "model/feature_importance.png",
    dpi=300,
    bbox_inches="tight"
)

plt.show()

print("\nAnalysis completed successfully!")
print("Saved: model/feature_importance.csv")
print("Saved: model/feature_importance.png")
