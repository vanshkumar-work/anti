import React, { useState } from "react";
import DisclaimerBanner from "../components/DisclaimerBanner";

export default function ModelInfo() {
  const [activeTab, setActiveTab] = useState("dataset");

  const tabs = [
    { id: "dataset", label: "Dataset Corpus" },
    { id: "preprocessing", label: "NLP & Negation Handling" },
    { id: "tfidf", label: "TF-IDF Vectorization" },
    { id: "algorithms", label: "Candidate Algorithms" },
    { id: "selection", label: "Model Selection" },
    { id: "limitations", label: "Limitations & Caveats" },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ marginBottom: "6px" }}>Model Architecture & Methodology</h1>
        <p style={{ maxWidth: "760px", fontSize: "0.925rem" }}>
          In-depth technical foundations, mathematical formulations, and engineering principles
          governing ReviewGuard's natural language processing and machine learning architecture.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--border-color)",
          marginBottom: "24px",
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 16px",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === tab.id
                  ? "2px solid var(--accent-primary)"
                  : "2px solid transparent",
              color:
                activeTab === tab.id
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              fontWeight: activeTab === tab.id ? 600 : 500,
              fontSize: "0.85rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Dataset Corpus */}
      {activeTab === "dataset" && (
        <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h2 style={{ marginBottom: "8px" }}>Deceptive Opinion Spam Corpus (Ott et al., 2011)</h2>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>
              ReviewGuard is trained and evaluated on the benchmark corpus established by Myle Ott, Yejin Choi,
              Claire Cardie, and Jeffrey T. Hancock at the Association for Computational Linguistics (ACL 2011):
              <em> "Finding Deceptive Opinion Spam by Any Means Necessary"</em>.
            </p>
          </div>

          {/* Metric summary grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "14px",
            }}
          >
            <div
              style={{
                padding: "16px",
                backgroundColor: "var(--bg-subtle)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div className="section-label">RAW CORPUS SIZE</div>
              <div className="mono-num" style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                1,600 Reviews
              </div>
              <div style={{ fontSize: "0.71875rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                1,596 clean unique (4 duplicates pruned)
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                backgroundColor: "var(--bg-subtle)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div className="section-label">TRUTHFUL DATA SOURCE</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                TripAdvisor
              </div>
              <div style={{ fontSize: "0.71875rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                800 raw / 796 clean verified stays
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                backgroundColor: "var(--bg-subtle)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div className="section-label">DECEPTIVE DATA SOURCE</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                Mechanical Turk
              </div>
              <div style={{ fontSize: "0.71875rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                800 incentivized synthetic reviews
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                backgroundColor: "var(--bg-subtle)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div className="section-label">PARTITION SPLIT</div>
              <div className="mono-num" style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                80% / 20%
              </div>
              <div style={{ fontSize: "0.71875rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                1,276 Train / 320 Holdout Test
              </div>
            </div>
          </div>

          {/* Research findings callout */}
          <div
            style={{
              padding: "16px",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-subtle)",
            }}
          >
            <h3 style={{ fontSize: "0.9rem", marginBottom: "6px" }}>Empirical Baseline from Academic Literature</h3>
            <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--text-secondary)" }}>
              In controlled human evaluation trials reported by Ott et al., trained human judges reading reviews achieved
              an average accuracy of only <strong>57.3%</strong> (barely better than random 50% chance). Deceptive reviews
              are crafted explicitly to read believably. However, automated statistical NLP models exploiting n-gram feature spaces
              surpass <strong>89.6% accuracy</strong> by detecting subtle systemic differences in spatial grounding, pronoun usage,
              and sentiment inflation.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: NLP & Negations */}
      {activeTab === "preprocessing" && (
        <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h2 style={{ marginBottom: "8px" }}>Text Preprocessing Pipeline</h2>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>
              To ensure semantic fidelity, text normalisation avoids destructive transformations
              that invert sentence meaning or eliminate critical stylistic cues.
            </p>
          </div>

          {/* Processing Stages */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
            <div style={{ padding: "12px 16px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <strong>1. Contraction Expansion:</strong> Common conversational contractions are normalized prior to punctuation stripping
              (e.g., <code>didn't</code> to <code>did not</code>, <code>wasn't</code> to <code>was not</code>, <code>can't</code> to <code>cannot</code>).
            </div>
            <div style={{ padding: "12px 16px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <strong>2. Markup and URL Sanitization:</strong> Hyperlinks, HTML elements, and foreign non-alphanumeric noise are stripped while preserving word boundaries.
            </div>
            <div style={{ padding: "12px 16px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <strong>3. Negation Preservation (Core Requirement):</strong> Standard stop-word lists aggressively eliminate words like
              <em> not, no, never, cannot, without</em>. In sentiment and opinion analysis, stripping negations destroys semantic polarity.
              ReviewGuard explicitly retains all 15 key English negation terms.
            </div>
            <div style={{ padding: "12px 16px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <strong>4. Zero Data Leakage:</strong> All normalisation and vocabulary fitting are enclosed inside Scikit-learn Pipelines,
              fitted solely on training folds (<code>X_train</code>) during cross-validation and final training.
            </div>
          </div>

          {/* Side-by-side Negation Example Table */}
          <div>
            <h3 style={{ fontSize: "0.9rem", marginBottom: "8px" }}>Impact of Negation Preservation</h3>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "35%" }}>Raw Input Sentence</th>
                    <th style={{ width: "32%" }}>Standard Stop-Word Removal</th>
                    <th style={{ width: "33%" }}>ReviewGuard Filter</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontSize: "0.8rem", fontStyle: "italic" }}>
                      "The room was not clean and never quiet."
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--status-deceptive-text)" }}>
                      "room clean quiet"<br />
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        Meaning completely inverted to positive praise!
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--status-truthful-text)", fontWeight: 500 }}>
                      "room not clean never quiet"<br />
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        Critical dissatisfaction preserved accurately.
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontSize: "0.8rem", fontStyle: "italic" }}>
                      "We had no issues and will not hesitate to return."
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--status-deceptive-text)" }}>
                      "issues hesitate return"<br />
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        Distorted into negative complaint words.
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--status-truthful-text)", fontWeight: 500 }}>
                      "no issues not hesitate return"<br />
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        Genuine positive intent retained correctly.
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: TF-IDF */}
      {activeTab === "tfidf" && (
        <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h2 style={{ marginBottom: "8px" }}>TF-IDF Feature Representation</h2>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>
              Term Frequency-Inverse Document Frequency converts unstructured text into high-dimensional numerical vectors,
              penalizing words that appear indiscriminately across all documents while emphasizing distinctive terms.
            </p>
          </div>

          <div
            style={{
              padding: "16px",
              backgroundColor: "var(--bg-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "0.95rem", fontFamily: "monospace", fontWeight: 600 }}>
              TF-IDF(t, d) = TF(t, d) * [log((1 + N) / (1 + DF(t))) + 1]
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "6px" }}>
              Smooth IDF formulation with sublinear term-frequency scaling (1 + log(tf)) and L2 unit vector normalization
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            <div style={{ padding: "14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>N-GRAM RANGE</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "2px" }}>(1, 2) Unigrams & Bigrams</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Captures pairs such as "my husband", "look forward", and "not clean"
              </div>
            </div>

            <div style={{ padding: "14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>SUBLINEAR SCALING</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "2px" }}>1 + log(tf)</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Dampens the distortion caused by highly repetitive keyword stuffing
              </div>
            </div>

            <div style={{ padding: "14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>MINIMUM FREQUENCY</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "2px" }}>min_df = 2</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Prunes idiosyncratic typos and single-occurrence noise tokens
              </div>
            </div>

            <div style={{ padding: "14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>VOCABULARY SPACE</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "2px" }}>8,421 Features</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Optimal geometric sparsity for linear hyperplane separation
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Candidate Algorithms */}
      {activeTab === "algorithms" && (
        <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h2 style={{ marginBottom: "8px" }}>Benchmarked Machine Learning Algorithms</h2>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>
              Four diverse algorithms representing different statistical and geometric paradigms were trained and evaluated:
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            <div style={{ padding: "16px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <h3 style={{ fontSize: "0.95rem" }}>Multinomial Naive Bayes</h3>
                <span className="badge badge-neutral">Generative</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Based on Bayes' theorem with conditional word independence assumptions. Configured with Laplace smoothing (alpha = 0.1)
                for sparse n-gram spaces.
              </p>
              <div style={{ marginTop: "12px", fontSize: "0.75rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", paddingTop: "8px" }}>
                Accuracy: 86.56% | F1-Score: 86.93%
              </div>
            </div>

            <div style={{ padding: "16px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <h3 style={{ fontSize: "0.95rem" }}>Logistic Regression</h3>
                <span className="badge badge-neutral">Discriminative</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Directly models posterior probabilities using the logistic sigmoid function with L2 ridge penalty (C = 1.0). Solved via L-BFGS optimizer.
              </p>
              <div style={{ marginTop: "12px", fontSize: "0.75rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", paddingTop: "8px" }}>
                Accuracy: 88.75% | F1-Score: 88.96%
              </div>
            </div>

            <div
              style={{
                padding: "16px",
                border: "1.5px solid var(--accent-primary)",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--accent-subtle)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <h3 style={{ fontSize: "0.95rem", color: "var(--accent-primary)" }}>Linear SVM (Calibrated)</h3>
                <span className="badge badge-truthful">Selected Champion</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Maximizes margin between classes in high-dimensional TF-IDF space. Wrapped in CalibratedClassifierCV
                with 5-fold Platt sigmoid scaling to output authentic, reliable posterior probabilities.
              </p>
              <div style={{ marginTop: "12px", fontSize: "0.75rem", fontWeight: 600, color: "var(--accent-primary)", borderTop: "1px solid var(--border-color)", paddingTop: "8px" }}>
                Accuracy: 89.69% | F1-Score: 89.97% | AUC: 0.9478
              </div>
            </div>

            <div style={{ padding: "16px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <h3 style={{ fontSize: "0.95rem" }}>Random Forest</h3>
                <span className="badge badge-neutral">Ensemble</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Ensemble of 100 decorrelated decision trees using bootstrap aggregating and random feature subsets (max depth = 50).
              </p>
              <div style={{ marginTop: "12px", fontSize: "0.75rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", paddingTop: "8px" }}>
                Accuracy: 84.69% | F1-Score: 84.92%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Model Selection */}
      {activeTab === "selection" && (
        <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h2 style={{ marginBottom: "8px" }}>Model Selection Strategy</h2>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>
              In opinion spam detection, relying solely on raw classification accuracy can disguise high false positive
              or false negative rates. The champion model was chosen through a multi-metric evaluation strategy:
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
            <div style={{ padding: "14px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <strong>1. F1-Score as Primary Optimization Metric:</strong> F1-Score harmonic mean balances precision (avoiding wrongful accusations against honest customers)
              and recall (capturing deceptive spam). Calibrated Linear SVM achieved the highest test F1-score (89.97%).
            </div>
            <div style={{ padding: "14px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <strong>2. High Recall on Deceptive Class:</strong> Calibrated Linear SVM achieved 92.50% recall, minimizing missed fake reviews.
            </div>
            <div style={{ padding: "14px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <strong>3. High Discrimination (ROC-AUC 0.9478):</strong> Confirms consistent boundary separation across any operational threshold.
            </div>
            <div style={{ padding: "14px", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <strong>4. Platt Probability Calibration:</strong> Standard SVM margins are uncalibrated distances. Platt sigmoid calibration ensures that predicted probabilities match true empirical rates.
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Limitations */}
      {activeTab === "limitations" && (
        <div className="panel" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h2 style={{ marginBottom: "8px" }}>Assumptions, Limitations & Academic Caveats</h2>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>
              Honest awareness of model constraints is essential for academic evaluation and real-world system design:
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
            <div style={{ padding: "14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <strong>Domain Shift:</strong> The training dataset consists of Chicago hotel reviews. Transferring the model
              directly to e-commerce products (e.g., consumer electronics, fashion) without fine-tuning can lead to reduced performance
              due to vocabulary divergence.
            </div>
            <div style={{ padding: "14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <strong>Adversarial & LLM Deception:</strong> Contemporary opinion spam may be synthesized by Large Language Models
              prompted to maintain neutral, balanced prose that circumvents traditional n-gram indicators.
            </div>
            <div style={{ padding: "14px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <strong>Absence of Account Metadata:</strong> Real-world commercial fraud engines combine NLP with behavioral graph telemetry
              (IP address, account age, review velocity, verified purchase badge). ReviewGuard is deliberately scoped as an NLP text-only diagnostic system.
            </div>
          </div>
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
}
