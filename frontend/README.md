# MindScope Frontend

Modern student-centered frontend for the MindScope Student Stress Awareness Platform, built with React 19, Vite, Tailwind CSS v4, and Lucide React icons.

---

## Tech Stack

- **Framework:** React 19 (`react`, `react-dom`)
- **Build Tool:** Vite 8 (`@vitejs/plugin-react`)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`, `tailwindcss`)
- **Routing:** React Router DOM v7 (`react-router-dom`)
- **Icons:** Lucide React (`lucide-react`)
- **Linter:** Oxlint (`oxlint`)

---

## Architectural Role in MindScope

The frontend delivers an empathetic, client-side student self-reflection experience:
- **22 Conversational Questions:** Grouped into 5 wellness sections (*Mind & Emotions, Physical Well-being, Academics & Future, Environment & Support, Campus & Social Life*).
- **Single Question Card Interaction:** Focused, distraction-free view with auto-advance on single-choice answers and manual continue for multi-select checklists.
- **Model Transparency Matrix:** A dedicated MLOps transparency section in the assessment review explaining the 20 features required by the Kaggle-trained ML model.
- **Independent Reflection Profile:** Student responses are kept client-side for personal awareness and wellness habit suggestions. Student answers are **not converted into model features** and are **never submitted to the ML prediction endpoint**.

---

## Development & Build Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The local development server runs at `http://127.0.0.1:5173/`.

### 3. Run Code Quality Checks (Oxlint)
```bash
npm run lint
```
Fast Rust-powered linting across all components and pages.

### 4. Build for Production
```bash
npm run build
```
Generates an optimized client bundle in `dist/`.

### 5. Preview Production Build
```bash
npm run preview
```

---

## Backend Connectivity

The FastAPI backend runs as an independent service on port `8000`:
- **API Base URL:** `http://127.0.0.1:8000` (configurable via `VITE_API_URL`)
- **Swagger Documentation:** `http://127.0.0.1:8000/docs`
- **Health Check:** `http://127.0.0.1:8000/health`
- **Model Architecture:** `http://127.0.0.1:8000/model-info`
- **Benchmark Prediction:** `http://127.0.0.1:8000/predict`
