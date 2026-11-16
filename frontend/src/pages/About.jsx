import React from "react";
import { ArrowRight } from "lucide-react";
import DisclaimerBanner from "../components/DisclaimerBanner";

export default function About() {
  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ marginBottom: "6px" }}>About ReviewGuard</h1>
        <p style={{ maxWidth: "760px", fontSize: "0.925rem" }}>
          AI-Powered Fake Review Detection and Analysis System. Built as a B.Tech Computer Science
          and Engineering (AI & ML) capstone project.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Project Overview */}
        <div className="panel">
          <h2 style={{ marginBottom: "10px" }}>1. Project Overview & Motivation</h2>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "12px" }}>
            Online consumer choices depend heavily on digital reviews. However, commercial incentives
            frequently drive fraudulent entities to fabricate deceptive reviews. Controlled psychological
            studies have revealed that human evaluators average only <strong>57.3% accuracy</strong> when
            trying to identify deceptive text, barely surpassing random guessing.
          </p>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>
            ReviewGuard engineers an automated NLP pipeline that inspects stylistic features,
            lexical composition, and n-gram term frequencies to output calibrated probability estimates
            and interpretable diagnostic cues.
          </p>
        </div>

        {/* System Architecture Flow */}
        <div className="panel">
          <h2 style={{ marginBottom: "6px" }}>2. End-to-End System Architecture</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
            Clean modular separation between data preprocessing, model inference, REST API gateway, and SPA frontend.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "14px",
              marginBottom: "16px",
            }}
          >
            {/* Box 1 */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "var(--bg-subtle)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--accent-primary)", letterSpacing: "0.04em", marginBottom: "4px" }}>
                STAGE 1
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: "4px" }}>
                Corpus Data Layer
              </div>
              <div style={{ fontSize: "0.775rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                1,600 verified hotel reviews (Ott et al., 2011). Stratified 80/20 train/test partition.
              </div>
            </div>

            {/* Box 2 */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "var(--bg-subtle)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--accent-primary)", letterSpacing: "0.04em", marginBottom: "4px" }}>
                STAGE 2
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: "4px" }}>
                NLP Normalization
              </div>
              <div style={{ fontSize: "0.775rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                Contraction expansion, noise sanitization, and explicit preservation of 15 negation keywords.
              </div>
            </div>

            {/* Box 3 */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "var(--bg-subtle)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--accent-primary)", letterSpacing: "0.04em", marginBottom: "4px" }}>
                STAGE 3
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: "4px" }}>
                Feature Vectorization
              </div>
              <div style={{ fontSize: "0.775rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                TF-IDF with sublinear scaling, (1,2) n-grams, min_df = 2, yielding 8,421 sparse features.
              </div>
            </div>

            {/* Box 4 */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "var(--accent-subtle)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--accent-primary)",
              }}
            >
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--accent-primary)", letterSpacing: "0.04em", marginBottom: "4px" }}>
                STAGE 4
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--accent-primary)", marginBottom: "4px" }}>
                Inference & Calibration
              </div>
              <div style={{ fontSize: "0.775rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                Linear SVM with 5-fold Platt Sigmoid calibration delivering 89.69% accuracy & 0.9478 ROC-AUC.
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "var(--bg-subtle)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "8px",
              fontSize: "0.8rem",
            }}
          >
            <span style={{ color: "var(--text-secondary)" }}>
              Communication Architecture: <strong>FastAPI REST Gateway</strong> (Backend, Port 8000)
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-primary)", fontWeight: 500 }}>
              <ArrowRight size={14} /> React.js SPA (Vite + CSS3, Port 5173 / Static Dist)
            </span>
          </div>
        </div>

        {/* Technology Stack Table */}
        <div className="panel">
          <h2 style={{ marginBottom: "14px" }}>3. Technology Stack</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "25%" }}>Layer</th>
                  <th style={{ width: "35%" }}>Technology</th>
                  <th>Role in ReviewGuard</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Frontend SPA</td>
                  <td>React.js (JavaScript), Vite, CSS3</td>
                  <td>Single Page Application with custom minimal styling, zero shadows, and strict color hierarchy</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Routing & Visuals</td>
                  <td>React Router, Recharts, Lucide React</td>
                  <td>Client-side routing, interactive performance curves, clean iconography</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Backend REST API</td>
                  <td>Python, FastAPI, Uvicorn</td>
                  <td>High-throughput REST endpoints for single review inference, batch CSV auditing, and metrics</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Machine Learning</td>
                  <td>Scikit-learn, Joblib, NumPy, Pandas</td>
                  <td>Pipelines, TF-IDF vectorization, CalibratedClassifierCV, cross-validation</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Dataset Benchmark</td>
                  <td>Deceptive Opinion Spam Corpus (Ott et al.)</td>
                  <td>1,600 verified hotel reviews (800 truthful, 800 deceptive)</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Testing Suite</td>
                  <td>Pytest, HTTPX</td>
                  <td>27 automated unit and integration tests covering preprocessing, prediction, and API endpoints</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Academic Integrity & Research Scope */}
        <div className="panel">
          <h2 style={{ marginBottom: "8px" }}>4. Academic Rigor & Future Scope</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "12px",
              marginTop: "12px",
              fontSize: "0.85rem",
            }}
          >
            <div style={{ padding: "12px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                Contextual Transformer Embeddings
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                Investigating fine-tuning of modern Transformer models (e.g., DeBERTa-v3 or RoBERTa) to capture deeper syntactic dependencies.
              </div>
            </div>

            <div style={{ padding: "12px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                Cross-Domain Transfer Learning
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                Cross-domain adaptation across consumer electronics, e-commerce goods, dining, and mobile app stores.
              </div>
            </div>

            <div style={{ padding: "12px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                Multimodal Image Verification
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                Correlating textual review claims with customer-submitted photographs using computer vision and EXIF timestamp analysis.
              </div>
            </div>

            <div style={{ padding: "12px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
                Bipartite Graph Neural Networks
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                Modeling user-item bipartite graphs to identify coordinated fraudulent review rings and bot farm clusters.
              </div>
            </div>
          </div>
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
