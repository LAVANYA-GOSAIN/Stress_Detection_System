# MindScope – Stress Awareness Platform
### End-to-End MLOps College Project | Stress Detection System

[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Scikit--Learn](https://img.shields.io/badge/Scikit--Learn-1.6.1-F7931E?logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MLflow](https://img.shields.io/badge/MLflow-2.22-0194E2?logo=mlflow&logoColor=white)](https://mlflow.org/)

---

## 1. Project Overview & Dual-Layer Architecture

**MindScope** is an end-to-end Machine Learning Operations (MLOps) academic project designed to study student stress factors through two strictly decoupled, transparent layers:

1. **Student Well-being Self-Reflection Layer (Client-Side):**  
   An empathetic, 22-question interactive assessment across 5 life dimensions (*Mind & Emotions, Physical Well-being, Academics & Future, Environment & Support, Campus & Social Life*). It guides students through a conversational, one-question-at-a-time experience with auto-advancing cards, visual emoji ratings, and multi-select safeguards. Responses generate an **independent student reflection profile** for personal awareness and tailored wellness habits.
2. **ML Benchmark & Inference System (Backend & MLOps):**  
   An independent production serving pipeline powered by a tuned Scikit-learn `GradientBoostingClassifier` trained on the Kaggle [Student Stress Factors](https://www.kaggle.com/datasets/rxnach/student-stress-factors-a-comprehensive-analysis) dataset ($N=1,100$). The model evaluates a fixed 20-feature empirical vector and outputs calibrated class probabilities across discrete target identifiers (`0`, `1`, `2`).

> [!IMPORTANT]
> **MLOps Data Integrity & Privacy Boundary:**  
> Student questionnaire answers are **never converted into the 20 ML model features** and are **never submitted to the `/predict` endpoint**. Because the original Kaggle dataset publisher did not release the underlying survey questions or scoring keys, converting conversational responses into numerical scores would represent unvalidated, fabricated inputs. Technical evaluation uses a fixed, schema-compliant benchmark vector.

> **Educational Disclaimer:**  
> MindScope is developed strictly as an academic research and educational awareness platform. It does not provide medical diagnoses, clinical treatment, or psychiatric advice. Target classes are preserved as discrete mathematical identifiers (`0`, `1`, `2`) in accordance with empirical dataset documentation. We do not assign speculative labels (such as Low, Moderate, or High).

---

## 2. System Architecture

```mermaid
flowchart TD
    subgraph Data & Training Pipeline
        A["StressLevelDataset.csv\n(1,100 Rows, 20 Features)"] --> B["train.py\n(Baseline Models)"]
        B --> C["tune_models.py\n(GridSearchCV & StratifiedKFold)"]
        C --> D["MLflow Tracking\n(mlflow.db & mlruns/)"]
        C --> E["model/tuned_model.joblib\n(Gradient Boosting Pipeline)"]
        C --> F["model/tuning_metadata.json\n(Hyperparameters & Metrics)"]
    end

    subgraph Flow A: Student Self-Reflection (Frontend Client-Side)
        J["Navbar & Welcoming Hero"] --> K["22-Question Assessment\n(1 Q at a Time, 5 Sections)"]
        K --> L["AssessmentReview.jsx\n(Personal Reflection Summary)"]
        L --> M["Model Alignment Matrix\n(MLOps Transparency Tab)"]
        L --> N["Results.jsx\n(Personalized Habits & Reflection)"]
    end

    subgraph Flow B: Independent ML Benchmark & Inference
        P["Fixed Benchmark Vector\n(benchmarkDemoPayload / Schema Example)"] --> Q["FastAPI Service (:8000)\n(Pydantic v2 Strict Validation)"]
        E --> Q
        Q -->|Discrete Probabilities P(0), P(1), P(2)| R["Results.jsx\n(ML Classification Benchmark)"]
    end
```

---

## 3. Machine Learning Pipeline & Metrics

### Model Selection & Comparison
Baseline algorithms (Gaussian Naive Bayes, Decision Trees, Logistic Regression, Gradient Boosting) were benchmarked with 5-fold cross-validation. Hyperparameters were optimized using `GridSearchCV` on a `StratifiedKFold` split:

| Model | 5-Fold CV Macro F1 | Test Accuracy | Test Macro Precision | Test Macro Recall | Test Macro F1 | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Tuned Gradient Boosting** | **0.8887** | **90.00%** | **90.05%** | **90.04%** | **90.01%** | **Selected** |
| Gaussian Naive Bayes | 0.8852 | 87.73% | 88.94% | 87.74% | 87.92% | Baseline |
| Baseline Gradient Boosting | 0.8839 | 86.36% | 86.42% | 86.42% | 86.32% | Baseline |
| Decision Tree | 0.8786 | 85.91% | 86.02% | 85.93% | 85.88% | Baseline |

### Optimal Hyperparameters (`model/tuning_metadata.json`)
```json
{
    "classifier__learning_rate": 0.05,
    "classifier__max_depth": 2,
    "classifier__n_estimators": 200
}
```

---

## 4. Empirical Feature Schema (20 Model Features) & Provenance

Every feature is grounded strictly in observed boundaries from `data/StressLevelDataset.csv` (published on Kaggle by user `rxnach`):

| Feature Name | Observed Range | Domain Category | Description & Provenance Note |
| :--- | :---: | :--- | :--- |
| `anxiety_level` | $[0, 21]$ | Psychological | Reported anxiety assessment score *(Secondary literature notes structural match to GAD-7, but primary survey instrument is undocumented)* |
| `self_esteem` | $[0, 30]$ | Psychological | Reported self-esteem assessment score *(Secondary literature notes structural match to RSES, but primary survey instrument is undocumented)* |
| `mental_health_history` | $\{0, 1\}$ | Psychological | Binary indicator for recorded mental health history ($0 = \text{No}, 1 = \text{Yes}$) |
| `depression` | $[0, 27]$ | Psychological | Reported depression assessment score *(Secondary literature notes structural match to PHQ-9, but primary survey instrument is undocumented)* |
| `future_career_concerns` | $[0, 5]$ | Psychological | Concern rating regarding future career |
| `headache` | $[0, 5]$ | Physiological | Observed headache frequency rating |
| `blood_pressure` | $[1, 3]$ | Physiological | Blood pressure categorical rating *(min is 1, not 0; clinical thresholds undocumented)* |
| `sleep_quality` | $[0, 5]$ | Physiological | Reported sleep quality rating score ($r = -0.749$, higher = better sleep) |
| `breathing_problem` | $[0, 5]$ | Physiological | Observed breathing difficulty rating score |
| `extracurricular_activities` | $[0, 5]$ | Physiological | Participation rating in extracurriculars ($r = +0.693$, reflects academic burden) |
| `noise_level` | $[0, 5]$ | Environmental | Exposure rating to environmental noise |
| `living_conditions` | $[0, 5]$ | Environmental | Rating of living conditions quality |
| `safety` | $[0, 5]$ | Environmental | Perceived safety rating |
| `basic_needs` | $[0, 5]$ | Environmental | Rating of basic needs fulfillment |
| `social_support` | $[0, 3]$ | Environmental | Social support rating *(bounded at 3, not 5)* |
| `academic_performance` | $[0, 5]$ | Academic / Social | Self-reported academic performance |
| `study_load` | $[0, 5]$ | Academic / Social | Perceived study load rating |
| `teacher_student_relationship` | $[0, 5]$ | Academic / Social | Teacher-student relationship quality |
| `peer_pressure` | $[0, 5]$ | Academic / Social | Experienced peer pressure rating |
| `bullying` | $[0, 5]$ | Academic / Social | Experienced or observed bullying rating |

> [!NOTE]
> **Dataset Provenance & Benchmark Payload:**  
> The original Kaggle publisher provided raw numerical columns without an accompanying survey codebook or scoring rules. The benchmark payload (`benchmarkDemoPayload`) defined in `frontend/src/utils/featureMapping.js` contains fixed, schema-compliant example values (matching `app/schemas.py`) used strictly for technical validation and demonstration. It is **never calculated or derived from student assessment answers**.

---

## 5. Repository Structure

```
StressDetection/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI application (endpoints, lifespan, error masking)
│   ├── model_loader.py            # LRU cached singleton loader & model contract validator
│   └── schemas.py                 # Pydantic v2 strict schemas (StrictInt, extra="forbid")
├── data/
│   └── StressLevelDataset.csv     # Verified Kaggle student lifestyle dataset (1,100 records)
├── model/
│   ├── feature_importance.csv     # Permutation feature importance rankings
│   ├── feature_importance.png     # Feature importance visualization
│   ├── metadata.json              # Baseline model comparison metadata
│   ├── model.joblib               # Baseline model artifact
│   ├── tuned_model.joblib         # Serialized Scikit-learn Pipeline (Tuned Gradient Boosting)
│   ├── tuning_metadata.json       # Hyperparameters and validation metrics
│   └── verification_report.json   # Model contract verification output
├── frontend/
│   ├── index.html                 # HTML shell with Google Fonts
│   ├── vite.config.js             # Vite + React + Tailwind v4 config
│   ├── package.json               # React 19, React Router DOM 7, Lucide React, Oxlint
│   ├── README.md                  # Frontend development and build instructions
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx         # MindScope brand navigation
│       │   ├── Hero.jsx           # Welcoming, student-focused hero
│       │   ├── FeatureCards.jsx   # 3-step self-reflection cards
│       │   ├── Footer.jsx         # Project meta and educational disclaimer
│       │   └── assessment/
│       │       ├── QuestionCard.jsx         # Unified single-question interaction container
│       │       ├── OptionCards.jsx          # Standard single-select answer options
│       │       ├── VisualEmojiCards.jsx     # Visual scale options with emojis
│       │       ├── VisualScale.jsx          # Visual slider/rating component
│       │       ├── MultiSelectCards.jsx     # Multi-select options with safeguards
│       │       ├── YesNoCards.jsx           # Binary & sensitive choice options
│       │       ├── BloodPressureInput.jsx   # Blood pressure input component
│       │       ├── ChapterProgress.jsx      # Section progression indicator
│       │       ├── ChapterTransition.jsx    # Section completion transition screen
│       │       ├── AssessmentReview.jsx     # 22-Q summary & model transparency matrix
│       │       └── ResetConfirmModal.jsx    # Reset confirmation modal dialog
│       ├── pages/
│       │   ├── Home.jsx           # Main landing page
│       │   ├── Assessment.jsx     # 22-question interactive well-being check-in
│       │   └── Results.jsx        # Model probabilities & personalized wellness guidance
│       ├── data/
│       │   └── questionnaire.js   # 22-question assessment catalogue across 5 sections
│       ├── utils/
│       │   └── featureMapping.js  # MLOps documentation & transparency matrix
│       ├── services/
│       │   └── api.js             # Fetch client connecting to FastAPI /predict
│       ├── assets/                # Visual illustrations and vector icons
│       ├── App.jsx                # Router & layout wrapper
│       ├── index.css              # Tailwind CSS v4 entrypoint
│       └── main.jsx               # React 19 root mount
├── tests/
│   └── test_api.py                # 8 automated backend integration tests
├── requirements.txt               # Python 3.11 pinned dependencies
├── inspect_data.py                # Dataset inspection and statistical overview script
├── analyze_model.py               # Permutation importance and CV analysis script
├── train.py                       # Baseline model training & MLflow logging
├── tune_models.py                 # GridSearchCV hyperparameter search
├── verify_model.py                # Pre-deployment validation checks
├── mlflow.db                      # Local SQLite MLflow tracking database
├── mlruns/                        # MLflow experiment artifacts
└── README.md                      # Project documentation & viva defense guide
```

---

## 6. Installation & Execution Guide

### Prerequisites
- **Python:** 3.11+
- **Node.js:** v18+ & npm

### Backend Setup (Terminal 1)
```bash
# 1. Activate Python virtual environment
source venv/bin/activate

# 2. Run automated backend integration tests
PYTHONPATH=. pytest -v tests/test_api.py

# 3. Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
- API Root: `http://localhost:8000/`
- Interactive Swagger UI: `http://localhost:8000/docs`
- ReDoc Documentation: `http://localhost:8000/redoc`
- Health Probe: `http://localhost:8000/health`

### Frontend Setup (Terminal 2)
```bash
# 1. Navigate to frontend folder
cd frontend

# 2. Install dependencies (if not already installed)
npm install

# 3. Run linter and build check
npm run lint
npm run build

# 4. Start local development server
npm run dev
```
Open browser at: `http://localhost:5173`

---

## 7. College Viva Defense Q&A

### Q1: Why did you choose Gradient Boosting over Deep Learning for this project?
> **Answer:** Tabular datasets with structured numerical features and discrete target classes typically achieve superior sample efficiency, calibration, and interpretability with tree ensembles (Gradient Boosting / XGBoost) compared to Deep Neural Networks. Furthermore, 5-fold cross-validation demonstrated that Gradient Boosting achieved a Macro F1 score of **88.87%** and **90.00%** test accuracy with minimal compute overhead.

### Q2: Why are target classes labeled as 0, 1, and 2 rather than "Low", "Moderate", and "High"?
> **Answer:** In rigorous MLOps and scientific computing, assigning unverified semantic labels to numerical targets introduces subjective bias. Because the original research dataset documentation categorizes labels as discrete integer identifiers `[0, 1, 2]`, we preserved them exactly to avoid unsupported clinical claims.

### Q3: Why are the 22 student assessment answers kept independent from the ML inference endpoint?
> **Answer:** To prevent data fabrication and protect student privacy. The original Kaggle dataset publisher did not release the underlying questionnaire text or scoring codebook. Converting conversational answers (such as worry handling or distraction checklists) into numerical scores (such as multiplying Question 1 by 4.2 to fit a 0–21 scale) would produce statistically fabricated inputs. MindScope maintains a strict dual-layer architecture: student answers provide qualitative self-reflection, while ML inference runs on validated, schema-compliant benchmark vectors.

### Q4: How is the model loaded in FastAPI to ensure high throughput?
> **Answer:** We implemented a **thread-safe singleton pattern using Python's `functools.lru_cache(maxsize=1)`** in `app/model_loader.py`. Additionally, FastAPI's `@asynccontextmanager` lifespan pre-warms the model into memory during application boot. This eliminates disk I/O latency on every prediction request while preventing memory leaks.

### Q5: How does Pydantic v2 protect the inference endpoint?
> **Answer:** In `app/schemas.py`, we enforce `StrictInt` and `strict=True` to reject silent coercion of floats, booleans, and strings. We enforce `extra="forbid"` to reject extraneous keys, apply dataset-grounded `ge` and `le` bounds, and validate that predicted probabilities sum to approximately 1.0 within a $10^{-3}$ tolerance.

### Q6: How are internal server errors handled?
> **Answer:** To prevent exposing internal implementation details or server stack traces to end users, errors in `/predict` and `/model-info` are recorded with full tracebacks using `logger.exception()` on the server side, while returning sanitized, generic messages (`"An internal error occurred while generating the prediction."`) with appropriate HTTP status codes (500 or 503).

---

## 8. Authors & Academic Credits
- **Project:** MindScope – Student Stress Detection System
- **Context:** College MLOps End-Term Capstone Project
- **License:** Educational Academic Use
