import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  ArrowRight,
  Search,
  Files,
  BarChart3,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { getDashboardData } from "../services/api";
import { formatNumber, formatPercent } from "../utils/formatters";
import DisclaimerBanner from "../components/DisclaimerBanner";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metricView, setMetricView] = useState("all");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getDashboardData();
        setData(res);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const comparisonData = useMemo(() => {
    if (!data?.model_comparison) return [];
    return data.model_comparison.map((m) => ({
      name: m.model_name.replace(" (Calibrated)", ""),
      fullName: m.model_name,
      Accuracy: Number((m.accuracy * 100).toFixed(1)),
      F1: Number((m.f1_score * 100).toFixed(1)),
      ROCAUC: Number((m.roc_auc * 100).toFixed(1)),
      isChampion: m.model_name.includes("Linear SVM"),
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="page-container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "var(--text-secondary)",
            padding: "80px 0",
            fontSize: "0.875rem",
          }}
        >
          <div className="spinner spinner-dark" />
          <span>Loading ReviewGuard platform...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-container">
        <div
          className="panel"
          style={{
            borderColor: "var(--status-deceptive-border)",
            maxWidth: "520px",
            marginTop: "32px",
          }}
        >
          <h2 style={{ color: "var(--status-deceptive-text)", marginBottom: "8px" }}>
            Service Notice
          </h2>
          <p style={{ marginBottom: "16px", fontSize: "0.84375rem" }}>
            {error || "Unable to establish connection with the ReviewGuard API."}
          </p>
          <button className="btn-secondary" onClick={() => window.location.reload()}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const rawTotal = data.raw_total || 1600;
  const cleanTotal = data.clean_total || data.total_reviews || 1596;
  const truthfulCount = data.truthful_reviews || 796;
  const deceptiveCount = data.deceptive_reviews || 800;
  const championName = data.champion_model || "Linear SVM (Calibrated)";

  return (
    <div className="page-container" style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
      {/* SECTION 1: REVIEWGUARD BRAND INTRODUCTION */}
      <section
        style={{
          padding: "36px 40px",
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "32px",
          alignItems: "center",
        }}
      >
        {/* Brand Typography & Direct Actions */}
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--accent-primary)",
              backgroundColor: "var(--accent-subtle)",
              padding: "4px 10px",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.71875rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            <ShieldCheck size={14} strokeWidth={2.4} />
            <span>NLP Text Intelligence Platform</span>
          </div>

          <h1
            style={{
              fontSize: "2.65rem",
              fontWeight: 700,
              color: "#202421",
              letterSpacing: "-0.035em",
              lineHeight: 1.1,
              marginBottom: "8px",
            }}
          >
            ReviewGuard
          </h1>

          <div
            style={{
              fontSize: "1.125rem",
              fontWeight: 500,
              color: "var(--accent-primary)",
              letterSpacing: "-0.015em",
              marginBottom: "14px",
            }}
          >
            Intelligent Review Analysis
          </div>

          <p
            style={{
              fontSize: "0.9375rem",
              color: "#565D57",
              lineHeight: 1.6,
              maxWidth: "540px",
              marginBottom: "24px",
            }}
          >
            An NLP-powered platform that analyses customer reviews to identify deceptive opinion spam
            using machine learning and linguistic analysis.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              to="/analyze"
              className="btn-primary"
              style={{ padding: "9px 18px", fontSize: "0.84375rem" }}
            >
              <Search size={14} />
              <span>Analyze a Review</span>
            </Link>
            <Link
              to="/batch"
              className="btn-secondary"
              style={{ padding: "9px 18px", fontSize: "0.84375rem" }}
            >
              <Files size={14} />
              <span>Batch CSV Audit</span>
            </Link>
          </div>
        </div>

        {/* Brand Visual: Diagnostic Text Intelligence Stream */}
        <div
          style={{
            backgroundColor: "#FAF9F6",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-sm)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.71875rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <span>Linguistic Analysis Capabilities</span>
            <span style={{ color: "var(--accent-primary)" }}>Active Pipeline</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-xs)",
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.8125rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={15} color="var(--status-truthful-text)" />
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  Spatial Grounding Detection
                </span>
              </div>
              <span className="badge badge-truthful" style={{ fontSize: "0.6875rem" }}>
                Authentic Cue
              </span>
            </div>

            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-xs)",
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.8125rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertCircle size={15} color="var(--status-deceptive-text)" />
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  Hyperbolic Sentiment Inflation
                </span>
              </div>
              <span className="badge badge-deceptive" style={{ fontSize: "0.6875rem" }}>
                Deceptive Cue
              </span>
            </div>

            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-xs)",
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.8125rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={15} color="var(--accent-primary)" />
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  Negation Polarity Preservation
                </span>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: "0.6875rem" }}>
                15 Negation Terms
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROJECT OVERVIEW (EDITORIAL FOUNDATIONS) */}
      <section>
        <div
          className="section-label"
          style={{ marginBottom: "14px", color: "var(--text-secondary)" }}
        >
          System Foundations
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Foundation 1: Selected Model */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid var(--accent-primary)",
              borderRadius: "var(--radius-md)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span className="section-label" style={{ color: "var(--accent-primary)" }}>
                  Selected Model
                </span>
                <span className="badge badge-champion" style={{ fontSize: "0.6875rem" }}>
                  Active
                </span>
              </div>

              <div
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  color: "#202421",
                  letterSpacing: "-0.02em",
                  marginBottom: "6px",
                }}
              >
                {championName}
              </div>

              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                High-dimensional linear hyperplane classifier wrapped in 5-fold Platt Sigmoid
                calibration to yield authentic posterior confidence estimates.
              </p>
            </div>

            <div
              style={{
                marginTop: "18px",
                paddingTop: "12px",
                borderTop: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
              }}
            >
              <span>L2 Regularized</span>
              <span style={{ fontWeight: 600, color: "var(--accent-primary)" }}>8,421 N-Grams</span>
            </div>
          </div>

          {/* Foundation 2: Benchmark Dataset */}
          <div
            style={{
              backgroundColor: "#FAF9F5",
              border: "1px solid #E5E1D8",
              borderRadius: "var(--radius-md)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span className="section-label" style={{ color: "#8F784D" }}>
                  Dataset Volume
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "#8F784D",
                    backgroundColor: "#EDE9DF",
                    padding: "2px 7px",
                    borderRadius: "var(--radius-xs)",
                  }}
                >
                  ACL 2011 Corpus
                </span>
              </div>

              <div
                className="mono-num"
                style={{
                  fontSize: "1.65rem",
                  fontWeight: 700,
                  color: "#202421",
                  letterSpacing: "-0.02em",
                  marginBottom: "6px",
                }}
              >
                {formatNumber(cleanTotal)} Reviews
              </div>

              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Deceptive Opinion Spam Corpus (Ott et al., 2011). Exactly 800 truthful customer reviews
                and 800 crowdsourced deceptive reviews across 20 Chicago hotels.
              </p>
            </div>

            <div
              style={{
                marginTop: "18px",
                paddingTop: "12px",
                borderTop: "1px solid #E5E1D8",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
              }}
            >
              <span>1,276 Train (80%)</span>
              <span style={{ fontWeight: 600, color: "#202421" }}>320 Test Holdout (20%)</span>
            </div>
          </div>

          {/* Foundation 3: Evaluated Architectures */}
          <div
            style={{
              backgroundColor: "#F4F7F9",
              border: "1px solid #DCE4E8",
              borderRadius: "var(--radius-md)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span className="section-label" style={{ color: "#5D7382" }}>
                  Candidate Models
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "#5D7382",
                    backgroundColor: "#E2E9ED",
                    padding: "2px 7px",
                    borderRadius: "var(--radius-xs)",
                  }}
                >
                  Benchmarked
                </span>
              </div>

              <div
                className="mono-num"
                style={{
                  fontSize: "1.65rem",
                  fontWeight: 700,
                  color: "#202421",
                  letterSpacing: "-0.02em",
                  marginBottom: "6px",
                }}
              >
                4 Evaluated
              </div>

              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Four diverse statistical paradigms benchmarked: Multinomial Naive Bayes (Generative),
                Logistic Regression (Discriminative), Linear SVM (Max-Margin), and Random Forest (Ensemble).
              </p>
            </div>

            <div
              style={{
                marginTop: "18px",
                paddingTop: "12px",
                borderTop: "1px solid #DCE4E8",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
              }}
            >
              <span>5-Fold Stratified CV</span>
              <span style={{ fontWeight: 600, color: "#202421" }}>TF-IDF (1,2) N-Grams</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 & 4: MODEL PERFORMANCE & DATASET OVERVIEW */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: "24px",
        }}
      >
        {/* SECTION 3: CANDIDATE MODEL PERFORMANCE */}
        <div className="panel" style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.1rem", marginBottom: "2px" }}>Candidate Model Performance</h2>
              <p style={{ fontSize: "0.78125rem", color: "var(--text-secondary)", margin: 0 }}>
                Comparative evaluation across 320 unseen test reviews (%)
              </p>
            </div>

            <div style={{ display: "flex", gap: "4px" }}>
              <button
                type="button"
                className={metricView === "all" ? "btn-primary" : "btn-secondary"}
                style={{ fontSize: "0.71875rem", padding: "4px 8px" }}
                onClick={() => setMetricView("all")}
              >
                All Metrics
              </button>
              <button
                type="button"
                className={metricView === "f1" ? "btn-primary" : "btn-secondary"}
                style={{ fontSize: "0.71875rem", padding: "4px 8px" }}
                onClick={() => setMetricView("f1")}
              >
                F1-Score
              </button>
              <button
                type="button"
                className={metricView === "accuracy" ? "btn-primary" : "btn-secondary"}
                style={{ fontSize: "0.71875rem", padding: "4px 8px" }}
                onClick={() => setMetricView("accuracy")}
              >
                Accuracy
              </button>
            </div>
          </div>

          <div style={{ height: "240px", width: "100%", flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{ top: 8, right: 10, left: -18, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10.5, fill: "var(--text-secondary)" }}
                  axisLine={{ stroke: "var(--border-color)" }}
                />
                <YAxis
                  domain={[75, 100]}
                  tick={{ fontSize: 10.5, fill: "var(--text-secondary)" }}
                  axisLine={{ stroke: "var(--border-color)" }}
                />
                <Tooltip
                  formatter={(val, name) => [`${val}%`, name]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-xs)",
                    fontSize: "11px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                {(metricView === "all" || metricView === "accuracy") && (
                  <Bar dataKey="Accuracy" name="Accuracy" fill="#315C49" radius={[2, 2, 0, 0]} />
                )}
                {(metricView === "all" || metricView === "f1") && (
                  <Bar dataKey="F1" name="F1-Score" fill="#6E8A78" radius={[2, 2, 0, 0]} />
                )}
                {metricView === "all" && (
                  <Bar dataKey="ROCAUC" name="ROC-AUC" fill="#AAB8C2" radius={[2, 2, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              fontSize: "0.75rem",
            }}
          >
            {comparisonData.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "4px 8px",
                  borderRadius: "var(--radius-xs)",
                  backgroundColor: m.isChampion ? "var(--accent-subtle)" : "transparent",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6875rem",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    #{idx + 1}
                  </span>
                  <span style={{ fontWeight: m.isChampion ? 600 : 500, color: "var(--text-primary)" }}>
                    {m.name}
                  </span>
                  {m.isChampion && (
                    <span className="badge badge-champion" style={{ fontSize: "0.625rem", padding: "1px 5px" }}>
                      Selected
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: "12px", fontFamily: "var(--font-mono)" }}>
                  <span>Acc: {m.Accuracy}%</span>
                  <span style={{ fontWeight: 600, color: m.isChampion ? "var(--accent-primary)" : "inherit" }}>
                    F1: {m.F1}%
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>AUC: {m.ROCAUC}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: DATASET CLASS OVERVIEW */}
        <div className="panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px",
              }}
            >
              <div>
                <h2 style={{ fontSize: "1.1rem", marginBottom: "2px" }}>Dataset Class Balance</h2>
                <p style={{ fontSize: "0.78125rem", color: "var(--text-secondary)", margin: 0 }}>
                  Ground-truth split of the Ott et al. corpus
                </p>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  backgroundColor: "var(--bg-subtle)",
                  padding: "3px 8px",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid var(--border-color)",
                }}
              >
                {rawTotal} Raw / {formatNumber(cleanTotal)} Clean
              </span>
            </div>

            {/* Bilateral Proportional Spectrum */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  height: "14px",
                  borderRadius: "var(--radius-xs)",
                  overflow: "hidden",
                  display: "flex",
                  marginBottom: "8px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div
                  style={{
                    width: `${((truthfulCount / cleanTotal) * 100).toFixed(1)}%`,
                    backgroundColor: "#315C49",
                  }}
                  title={`Truthful: ${truthfulCount} reviews`}
                />
                <div
                  style={{
                    width: `${((deceptiveCount / cleanTotal) * 100).toFixed(1)}%`,
                    backgroundColor: "#B66B66",
                  }}
                  title={`Deceptive: ${deceptiveCount} reviews`}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.71875rem",
                  color: "var(--text-secondary)",
                }}
              >
                <span style={{ color: "#315C49", fontWeight: 600 }}>
                  Truthful: {((truthfulCount / cleanTotal) * 100).toFixed(1)}% ({truthfulCount} reviews)
                </span>
                <span style={{ color: "var(--text-tertiary)" }}>Balanced 50/50 Prior</span>
                <span style={{ color: "#B66B66", fontWeight: 600 }}>
                  Deceptive: {((deceptiveCount / cleanTotal) * 100).toFixed(1)}% ({deceptiveCount} reviews)
                </span>
              </div>
            </div>

            {/* Bilateral Characteristic Profiles */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  padding: "14px",
                  backgroundColor: "#F3F7F4",
                  border: "1px solid #D2E2D6",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.78125rem", fontWeight: 600, color: "#315C49" }}>
                    Truthful Reviews
                  </span>
                  <span className="mono-num" style={{ fontSize: "0.875rem", fontWeight: 700, color: "#315C49" }}>
                    {truthfulCount}
                  </span>
                </div>
                <div style={{ fontSize: "0.71875rem", color: "#3D624F", lineHeight: 1.45 }}>
                  TripAdvisor verified guest stays across 20 Chicago hotels. Characterized by specific
                  spatial details, price mentions, and concrete room descriptions.
                </div>
              </div>

              <div
                style={{
                  padding: "14px",
                  backgroundColor: "#FBF3F3",
                  border: "1px solid #EED4D4",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.78125rem", fontWeight: 600, color: "#B66B66" }}>
                    Deceptive Reviews
                  </span>
                  <span className="mono-num" style={{ fontSize: "0.875rem", fontWeight: 700, color: "#B66B66" }}>
                    {deceptiveCount}
                  </span>
                </div>
                <div style={{ fontSize: "0.71875rem", color: "#8E4646", lineHeight: 1.45 }}>
                  Mechanical Turk crowd-incentivized synthetic reviews. Characterized by elevated exclamation
                  frequency, generalized superlative adjectives, and sentiment inflation.
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              paddingTop: "12px",
              borderTop: "1px solid var(--border-color)",
              fontSize: "0.71875rem",
              color: "var(--text-tertiary)",
              lineHeight: 1.4,
            }}
          >
            Human baseline accuracy on this benchmark corpus is only 57.3%, demonstrating that deceptive
            intent in customer opinions is difficult for humans to detect without NLP assistance.
          </div>
        </div>
      </div>

      {/* SECTION 5: QUICK ACTIONS (INTENTIONAL WORKSPACE TILES) */}
      <section>
        <div
          className="section-label"
          style={{ marginBottom: "14px", color: "var(--text-secondary)" }}
        >
          Product Workspaces
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Action 1: Analyze a Review */}
          <Link
            to="/analyze"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "border-color 0.15s ease, background-color 0.15s ease",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-primary)";
              e.currentTarget.style.backgroundColor = "#FAFBF9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.backgroundColor = "#FFFFFF";
            }}
          >
            <div>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--accent-subtle)",
                  color: "var(--accent-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                }}
              >
                <Search size={18} strokeWidth={2.2} />
              </div>

              <h3 style={{ fontSize: "1rem", color: "#202421", marginBottom: "6px" }}>
                Analyze a Review
              </h3>

              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Evaluate single review text to calculate calibrated confidence, identify deceptive linguistic
                cues, and extract word-level feature attributions.
              </p>
            </div>

            <div
              style={{
                marginTop: "18px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.78125rem",
                fontWeight: 600,
                color: "var(--accent-primary)",
              }}
            >
              <span>Launch Analyzer</span>
              <ArrowRight size={13} />
            </div>
          </Link>

          {/* Action 2: Batch Analysis */}
          <Link
            to="/batch"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "border-color 0.15s ease, background-color 0.15s ease",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#C6A36A";
              e.currentTarget.style.backgroundColor = "#FAF8F2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.backgroundColor = "#FFFFFF";
            }}
          >
            <div>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "#FAF4E8",
                  color: "#966E2E",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                }}
              >
                <Files size={18} strokeWidth={2.2} />
              </div>

              <h3 style={{ fontSize: "1rem", color: "#202421", marginBottom: "6px" }}>
                Batch Analysis
              </h3>

              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Upload CSV files to run bulk calibrated inference across hundreds of customer reviews,
                filter records, and export audited compliance reports.
              </p>
            </div>

            <div
              style={{
                marginTop: "18px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.78125rem",
                fontWeight: 600,
                color: "#966E2E",
              }}
            >
              <span>Upload CSV Dataset</span>
              <ArrowRight size={13} />
            </div>
          </Link>

          {/* Action 3: Explore Analytics */}
          <Link
            to="/analytics"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "border-color 0.15s ease, background-color 0.15s ease",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#8DA2AF";
              e.currentTarget.style.backgroundColor = "#F4F7F9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.backgroundColor = "#FFFFFF";
            }}
          >
            <div>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "#EBF1F5",
                  color: "#4F6E80",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                }}
              >
                <BarChart3 size={18} strokeWidth={2.2} />
              </div>

              <h3 style={{ fontSize: "1rem", color: "#202421", marginBottom: "6px" }}>
                Explore Analytics
              </h3>

              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Inspect empirical ROC curves, Precision-Recall trade-offs, confusion matrix diagnostic
                derivations, and word count distributions.
              </p>
            </div>

            <div
              style={{
                marginTop: "18px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.78125rem",
                fontWeight: 600,
                color: "#4F6E80",
              }}
            >
              <span>View Analytical Curves</span>
              <ArrowRight size={13} />
            </div>
          </Link>
        </div>
      </section>

      {/* Academic Disclaimer Notice */}
      <DisclaimerBanner />
    </div>
  );
}
