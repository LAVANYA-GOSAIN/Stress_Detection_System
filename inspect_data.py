
import pandas as pd
import numpy as np

# Load dataset
df = pd.read_csv("data/StressLevelDataset.csv")

print("\n========== DATASET OVERVIEW ==========")

# Dataset dimensions
print("\nShape:", df.shape)

# Column names
print("\nColumns:")
print(df.columns.tolist())

# First five records
print("\nFirst 5 rows:")
print(df.head())

# Data types
print("\nData types:")
print(df.dtypes)

# Missing values
print("\nMissing values:")
print(df.isnull().sum())

# Duplicate records
print("\nDuplicate rows:", df.duplicated().sum())

# Statistical summary
print("\nStatistical summary:")
print(df.describe())

# Target distribution
if "stress_level" in df.columns:
    print("\nStress level distribution:")
    print(df["stress_level"].value_counts().sort_index())

# Check unique values
print("\nUnique values in each column:")
for column in df.columns:
    print(column, ":", df[column].nunique())
