# ReviewGuard: AI-Powered Fake Review Detection and Analysis System

[![Frontend: React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue.svg)](https://react.dev/)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python-green.svg)](https://fastapi.tiangolo.com/)
[![ML: Scikit-Learn](https://img.shields.io/badge/ML-Scikit--learn-orange.svg)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

An academic, full-stack Natural Language Processing (NLP) and Machine Learning system for identifying, analyzing, and explaining deceptive opinion spam in customer reviews.

Designed as a B.Tech CSE (Artificial Intelligence and Machine Learning) project, ReviewGuard features a custom **React (JavaScript) frontend** built with **Vite**, **CSS3**, **React Router**, **Recharts**, and **Lucide React**, communicating through REST APIs with a high-performance **Python FastAPI** backend powered by calibrated Scikit-learn pipelines.

---

## 1. System Architecture

```text
ReviewGuard/
│
├── frontend/                          # Custom React.js Single Page Application
│   ├── public/                        # Static public assets
│   ├── src/
│   │   ├── components/                # Reusable UI components
│   │   │   ├── MetricCard.jsx         # Clean KPI metric card (zero shadows)
│   │   │   ├── DisclaimerBanner.jsx   # Academic estimate notice banner
│   │   │   ├── StatusBadge.jsx        # Muted green / red status pills
│   │   │   └── FeatureCuesBar.jsx     # Directional feature attribution chips
│   │   ├── layouts/                   # App framing
│   │   │   ├── MainLayout.jsx         # App shell (Sidebar + Header + Outlet)
│   │   │   ├── Sidebar.jsx            # Sticky navigation sidebar
│   │   │   └── Header.jsx             # Top minimal breadcrumb bar
│   │   ├── pages/                     # Application views
│   │   │   ├── Dashboard.jsx          # KPI metrics, corpus balance & model comparison
│   │   │   ├── AnalyzeReview.jsx      # Single review diagnostics & explainability
│   │   │   ├── BatchAnalysis.jsx      # CSV upload, table filters & report export
│   │   │   ├── Analytics.jsx          # Confusion matrix, ROC/PR curves & linguistics
│   │   │   ├── ModelInfo.jsx          # TF-IDF, algorithms & methodology documentation
│   │   │   └── About.jsx              # Project background, architecture & viva notes
│   │   ├── services/
│   │   │   └── api.js                 # REST API client
│   │   ├── App.jsx                    # Route configuration
│   │   ├── main.jsx                   # React root entrypoint
│   │   └── index.css                  # Restrained design system (no shadows)
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/                           # REST API Server
│   └── app.py                         # FastAPI endpoints, CORS & SPA static mount
│
├── src/                               # Core Machine Learning & NLP Source
│   ├── __init__.py
│   ├── data_loader.py                 # Dataset downloader & verification
│   ├── preprocessing.py               # Text cleaning & negation preservation
│   ├── train.py                       # 5-fold CV, model training & model selection
│   ├── evaluate.py                    # Evaluation metrics, ROC & PR curves
│   ├── predict.py                     # Single & batch inference engine
│   └── explainability.py              # Term-level feature contribution extraction
│
├── data/
│   ├── raw/
│   │   └── deceptive_opinion.csv      # downloaded locally; not included in this repository
│   ├── processed/
│   │   └── cleaned_reviews.csv        # generated locally; not included in this repository
│   └── sample_test_batch.csv          # Sample batch CSV for 1-click testing
│
├── models/
│   ├── reviewguard_pipeline.joblib    # Serialized champion pipeline (Linear SVM)
│   ├── all_candidate_pipelines.joblib # All 4 fitted candidate models
│   └── model_metadata.json            # Model parameters & evaluation scores
│
├── notebooks/
│   └── exploratory_analysis.ipynb     # Jupyter EDA notebook
│
├── reports/
│   └── evaluation/
│       ├── metrics_summary.json       # Structured evaluation metrics
│       ├── model_comparison.csv       # Candidate model benchmarks
│       ├── confusion_matrix.png       # Confusion matrix visualization
│       ├── model_comparison.png       # Grouped performance bar chart
│       ├── roc_curves.png             # Multi-model ROC curves
│       └── pr_curves.png              # Precision-Recall curves
│
├── tests/
│   ├── __init__.py
│   ├── test_api.py                    # 9 API integration tests
│   ├── test_prediction.py             # 10 inference and edge-case unit tests
│   └── test_preprocessing.py          # 8 NLP cleaning & vectorization tests
│
├── requirements.txt                   # Python backend dependencies
├── README.md
└── .gitignore
```

The raw Ott et al. review corpus and its cleaned copy are excluded from this public repository. The dataset loader downloads the raw corpus locally when needed; training generates the processed file.

---

## 2. UI Design Philosophy

ReviewGuard uses a bespoke, understated design system:
- **Zero Shadows:** Strict `box-shadow: none !important;` rule across all components. Depth and visual hierarchy are created purely through clean 1px borders, subtle tone shifts, typographic scale, and whitespace.
- **No Neon, No Flashy Gradients:** Muted, natural palette:
  - Main background: `#F7F7F5` (warm off-white)
  - Sidebar background: `#F0F0ED`
  - Card background: `#FFFFFF`
  - Borders: `#E5E5E0`
  - Primary accent: `#2D4A3E` (deep forest olive)
  - Truthful status: `#2E694D` (text), `#EDF5F0` (background), `#CBE4D3` (border)
  - Deceptive status: `#962E2E` (text), `#FAEDED` (background), `#F1CDCD` (border)
- **Typography:** Inter with careful tracking and comfortable line heights.
- **Restrained Visual Elements:** Subtle status indicators, clean Recharts data visualizations without cluttered grids, and diagnostic term chips.

---

## 3. Technology Stack

### Frontend
- **Framework:** React.js 18 (JavaScript ONLY, no TypeScript/TSX)
- **Build Tool:** Vite 5
- **Routing:** React Router v6
- **Charts:** Recharts (responsive SVG charts with custom tooltips)
- **Icons:** Lucide React
- **Styling:** CSS3 variables and component-scoped styling

### Backend
- **Framework:** FastAPI with Uvicorn (ASGI)
- **Machine Learning:** Scikit-learn (Pipelines, CalibratedClassifierCV)
- **Data Handling:** Pandas, NumPy, Joblib
- **Validation:** Pydantic v2
- **Testing:** Pytest, HTTPX

---

## 4. REST API Specifications

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status, pipeline availability, champion model name |
| `GET` | `/api/dashboard` | Corpus statistics, champion metrics, benchmark comparison table |
| `POST` | `/api/analyze` | Single review inference, confidence, text diagnostics & explainability cues |
| `POST` | `/api/analyze/batch` | Bulk CSV analysis, missing row handling, statistics & annotated records |
| `GET` | `/api/sample-batch` | 1-Click built-in test dataset for batch testing |
| `GET` | `/api/analytics` | Word count distribution, confusion matrix, interactive ROC and PR curve points |
| `GET` | `/api/model-info` | Dataset metadata, preprocessing rationale, algorithm specifications |

---

## 5. Machine Learning Pipeline & Empirical Results

The system is trained on the **Deceptive Opinion Spam Corpus (Ott et al., ACL 2011)** comprising 1,600 reviews across 20 Chicago hotels (800 truthful, 800 deceptive).

### Zero Data Leakage & Semantic Negation Preservation
- **Pipeline Integration:** Text normalisation, contraction expansion (e.g. `didn't` -> `did not`), and TF-IDF feature extraction are enclosed inside a Scikit-learn Pipeline. Fitting occurs exclusively on the training split (`X_train`).
- **Negations Retained:** Crucial negation modifiers (*not, no, never, cannot, without, against*) are excluded from stop-word filtering, preventing valence inversion (`"not clean"` staying distinct from `"clean"`).
- **Probability Calibration:** Linear SVM margin scores are calibrated using Platt scaling (`CalibratedClassifierCV(cv=5, method="sigmoid")`) to yield legitimate posterior probabilities.

### Empirical Holdout Test Results (320 Unseen Reviews):

| Algorithm | Test Accuracy | Test Precision | Test Recall | Test F1-Score | Test ROC-AUC | 5-Fold CV F1 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Linear SVM (Calibrated)** | **0.8969** | **0.8757** | **0.9250** | **0.8997** | **0.9478** | **0.8732** |
| **Logistic Regression** | 0.8875 | 0.8735 | 0.9062 | 0.8896 | 0.9452 | 0.8738 |
| **Multinomial Naive Bayes** | 0.8656 | 0.8462 | 0.8938 | 0.8693 | 0.9275 | 0.8727 |
| **Random Forest** | 0.8469 | 0.8364 | 0.8625 | 0.8492 | 0.9208 | 0.8392 |

**Champion Model:** Linear SVM (Calibrated) was selected for its top balanced F1-score (`0.8997`), high recall on fraudulent text (`92.50%`), and superior separation capability (`0.9478 ROC-AUC`).

---

## 6. Installation and Setup Instructions (Windows)

### Prerequisites
- Python 3.10+ (installed in virtual environment `.venv`)
- Node.js v18+ and npm

### Step 1: Open PowerShell
```powershell
cd c:\Users\hp\Desktop\anti
```

### Step 2: Set Up Python Backend
Activate the virtual environment:
```powershell
.\.venv\Scripts\Activate.ps1
```
Install backend dependencies:
```powershell
pip install -r requirements.txt
```

### Step 3: Set Up React Frontend
```powershell
cd frontend
npm install
cd ..
```

---

## 7. Execution Commands

You can run ReviewGuard in two modes:

### Mode A: Unified Production Mode (Fastest - Single Terminal)
Build the frontend and run the unified FastAPI server. The backend serves both the REST API and the React Single Page Application on port 8000:

```powershell
# 1. Build React frontend (creates frontend/dist)
cd frontend
npm run build
cd ..

# 2. Launch unified FastAPI server
python -m backend.app
```
Open your browser at:
`http://localhost:8000`

---

### Mode B: Dual Development Mode (Live Hot-Reload)
Run the backend and frontend separately in two terminals:

#### Terminal 1: Backend API Server
```powershell
cd c:\Users\hp\Desktop\anti
.\.venv\Scripts\Activate.ps1
uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
```
API runs on `http://127.0.0.1:8000`. Swagger documentation is available at `http://127.0.0.1:8000/docs`.

#### Terminal 2: React Vite Development Server
```powershell
cd c:\Users\hp\Desktop\anti\frontend
npm run dev
```
Vite runs on `http://localhost:5173` with automatic API proxying to port 8000. Open `http://localhost:5173` in your browser.

---

## 8. Model Training Execution
To re-train all 4 models from scratch, run 5-fold cross-validation, and generate report plots:
```powershell
python -m src.train
```

---

## 9. Running Automated Test Suite
To run all 27 automated tests (8 preprocessing unit tests, 10 prediction unit tests, and 9 API integration tests):
```powershell
pytest -v
```
All 27 tests pass:
- Preprocessing: cleaning, empty input, contraction expansion, negations retained, tokenization, text diagnostics, dataframe cleaning, TF-IDF vectorization.
- Prediction: missing model errors, single review inference, empty review rejection, short review warning, long review support, batch CSV processing, column validation, prediction determinism.
- API Endpoints: `/api/health`, `/api/dashboard`, `/api/analyze`, `/api/analyze/batch`, `/api/sample-batch`, `/api/analytics`, `/api/model-info`.

---

## 10. Assumptions & Limitations

1. **Domain Dependence:** Trained on hotel reviews; performance on cross-domain consumer electronics or apparel may require fine-tuning.
2. **Adversarial LLM Deception:** AI-synthesized reviews crafted to mimic neutral, restrained styles may evade surface n-grams.
3. **Text-Only Scope:** The application models text linguistics only; real-world production fraud engines also incorporate reviewer telemetry (IP, account age, review velocity).
4. **Statistical Diagnostic:** Predictions represent empirical model estimates, not conclusive legal proof of dishonesty.

---

## License
MIT License. Developed for academic B.Tech CSE (AI & ML) capstone demonstration.
