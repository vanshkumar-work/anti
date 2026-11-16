import React, { useState } from "react";
import { Search, RotateCcw, Sparkles, ShieldAlert, ShieldCheck } from "lucide-react";
import { analyzeSingleReview } from "../services/api";
import { countWords } from "../utils/formatters";
import DisclaimerBanner from "../components/DisclaimerBanner";
import FeatureCuesBar from "../components/FeatureCuesBar";

const PRESET_EXAMPLES = [
  {
    label: "Authentic Guest Stay",
    tag: "Truthful",
    text: "We stayed at the hotel for two nights on a weekend getaway. Check-in on the 4th floor was quick, though the elevators were slow around 9 AM. The room was clean, bed was comfortable, and water pressure in the shower was adequate. Valet parking was $55 per night, which is typical for downtown Chicago. Good location close to Michigan Avenue.",
  },
  {
    label: "Incentivized Promotional",
    tag: "Deceptive",
    text: "My husband and I recently spent our wedding anniversary at this breathtaking paradise! From the moment we arrived, the phenomenal staff pampered us like absolute royalty. Every single detail was utterly magnificent, exquisite, and pure perfection! You will fall completely in love with this magical oasis. We will definitely be returning every single year!",
  },
  {
    label: "Balanced Critique",
    tag: "Truthful",
    text: "Decent business hotel with minor flaws. The room was spacious and the desk was good for working. However, the air conditioning unit was slightly noisy throughout the night, and the breakfast area was crowded on Monday morning. The front desk staff was polite and addressed our towel request promptly.",
  },
  {
    label: "Negation Dissatisfaction",
    tag: "Truthful",
    text: "The room was not clean upon arrival and never quiet during the evening hours. We had no hot water on Sunday morning and could not get assistance from the front desk. Will not stay here again.",
  },
];

export default function AnalyzeReview() {
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const charCount = reviewText.length;
  const wordCount = countWords(reviewText);

  async function handleAnalyze(textToUse) {
    const text = textToUse || reviewText;
    if (!text.trim()) {
      setError("Please provide review text to analyze.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await analyzeSingleReview(text);
      setResult(res);
    } catch (err) {
      setError(err.message || "Review analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectExample(exampleText) {
    setReviewText(exampleText);
    setError(null);
    handleAnalyze(exampleText);
  }

  function handleClear() {
    setReviewText("");
    setResult(null);
    setError(null);
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ marginBottom: "6px" }}>Analyze Review</h1>
        <p style={{ maxWidth: "760px", fontSize: "0.875rem" }}>
          Inspect individual customer review text to extract linguistic indicators,
          calculate calibrated posterior probabilities, and inspect influential n-gram cues.
        </p>
      </div>

      {/* Preset Example Selector */}
      <div style={{ marginBottom: "16px" }}>
        <div className="section-label" style={{ marginBottom: "8px" }}>
          Reference Test Presets:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {PRESET_EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              className="btn-secondary"
              style={{
                fontSize: "0.78125rem",
                padding: "6px 12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
              onClick={() => handleSelectExample(ex.text)}
            >
              <Sparkles size={13} color="var(--accent-primary)" />
              <span>{ex.label}</span>
              <span
                style={{
                  fontSize: "0.6875rem",
                  color: "var(--text-tertiary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                [{ex.tag}]
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Input Panel */}
      <div className="panel" style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <label
            htmlFor="review-input"
            className="section-label"
            style={{ color: "var(--text-primary)" }}
          >
            Review Text Input
          </label>
          <span style={{ fontSize: "0.71875rem", color: "var(--text-tertiary)" }}>
            Supports raw or normalized prose
          </span>
        </div>

        <textarea
          id="review-input"
          rows={6}
          style={{
            width: "100%",
            lineHeight: 1.6,
            marginBottom: "12px",
            fontSize: "0.875rem",
            padding: "12px 14px",
          }}
          placeholder="Paste or write customer review text here..."
          value={reviewText}
          onChange={(e) => {
            setReviewText(e.target.value);
            if (error) setError(null);
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span className="mono-num">{wordCount} words</span>
            <span style={{ color: "var(--border-strong)" }}>•</span>
            <span className="mono-num">{charCount} characters</span>
            {wordCount > 0 && wordCount < 6 && (
              <span style={{ color: "var(--status-warning-text)" }}>
                (Notice: very brief inputs have limited n-gram evidence)
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={handleClear}
              disabled={loading || (!reviewText && !result)}
              style={{ fontSize: "0.8125rem" }}
            >
              <RotateCcw size={13} />
              <span>Clear</span>
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={() => handleAnalyze()}
              disabled={loading || !reviewText.trim()}
              style={{ minWidth: "160px" }}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Search size={14} />
                  <span>Analyze Review</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginTop: "14px",
              padding: "10px 14px",
              backgroundColor: "var(--status-deceptive-bg)",
              border: "1px solid var(--status-deceptive-border)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8125rem",
              color: "var(--status-deceptive-text)",
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Analytical Diagnostic Report (Refined Software Product Report) */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Main Assessment Card */}
          <div className="panel">
            {/* Report Header Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                paddingBottom: "14px",
                borderBottom: "1px solid var(--border-color)",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="section-label">Diagnostic Assessment</span>
                <span className="badge badge-neutral">Calibrated Inference</span>
              </div>
              <span
                style={{
                  fontSize: "0.71875rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-tertiary)",
                }}
              >
                Model: Linear SVM (Platt Scaling)
              </span>
            </div>

            {/* Core Outcome & Confidence Split */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px",
                marginBottom: "20px",
              }}
            >
              {/* Verdict Column */}
              <div>
                <div className="section-label" style={{ marginBottom: "6px" }}>
                  Estimated Classification
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    marginBottom: "8px",
                  }}
                >
                  {result.is_deceptive ? (
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "var(--radius-xs)",
                        backgroundColor: "var(--status-deceptive-bg)",
                        border: "1px solid var(--status-deceptive-border)",
                        color: "var(--status-deceptive-text)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <ShieldAlert size={16} />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "var(--radius-xs)",
                        backgroundColor: "var(--status-truthful-bg)",
                        border: "1px solid var(--status-truthful-border)",
                        color: "var(--status-truthful-text)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <ShieldCheck size={16} />
                    </div>
                  )}

                  <div>
                    <div
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {result.prediction_label}
                    </div>
                    <span
                      className={`badge ${
                        result.is_deceptive ? "badge-deceptive" : "badge-truthful"
                      }`}
                      style={{ marginTop: "2px" }}
                    >
                      {result.is_deceptive
                        ? "Opinion Spam Characteristics"
                        : "Authentic Experience Characteristics"}
                    </span>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: "0.84375rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.55,
                    marginTop: "8px",
                  }}
                >
                  {result.summary_message}
                </p>
              </div>

              {/* Confidence & Posterior Probability Column */}
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "var(--bg-subtle)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
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
                      marginBottom: "4px",
                    }}
                  >
                    <span className="section-label">Calibrated Confidence</span>
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      Sigmoid Posterior
                    </span>
                  </div>

                  <div
                    className="mono-num"
                    style={{
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      color: result.is_deceptive
                        ? "var(--status-deceptive-text)"
                        : "var(--status-truthful-text)",
                      letterSpacing: "-0.02em",
                      marginBottom: "6px",
                    }}
                  >
                    {result.confidence_pct}%
                  </div>
                </div>

                {/* Subdued Progress Split Bar */}
                <div>
                  <div
                    style={{
                      height: "8px",
                      borderRadius: "var(--radius-xs)",
                      backgroundColor: "var(--border-color)",
                      overflow: "hidden",
                      display: "flex",
                    }}
                  >
                    <div
                      style={{
                        width: `${result.truthful_prob_pct}%`,
                        backgroundColor: "var(--status-truthful-text)",
                      }}
                      title={`Truthful: ${result.truthful_prob_pct}%`}
                    />
                    <div
                      style={{
                        width: `${result.deceptive_prob_pct}%`,
                        backgroundColor: "var(--status-deceptive-text)",
                      }}
                      title={`Deceptive: ${result.deceptive_prob_pct}%`}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.6875rem",
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                      marginTop: "6px",
                    }}
                  >
                    <span>Truthful: {result.truthful_prob_pct}%</span>
                    <span>Deceptive: {result.deceptive_prob_pct}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Panels Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Feature Attribution & Linguistic Cues Panel */}
            <div className="panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ marginBottom: "14px" }}>
                  <h3 style={{ marginBottom: "2px" }}>Influential Linguistic Cues</h3>
                  <p style={{ fontSize: "0.78125rem", color: "var(--text-secondary)" }}>
                    N-Gram token attributions driving model hyperplane displacement
                  </p>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <div className="section-label" style={{ color: "var(--status-deceptive-text)", marginBottom: "4px" }}>
                    Deceptive Associated Cues (+):
                  </div>
                  <FeatureCuesBar
                    cues={result.explanation ? result.explanation.deceptive_cues : []}
                    type="deceptive"
                  />
                </div>

                <div>
                  <div className="section-label" style={{ color: "var(--status-truthful-text)", marginBottom: "4px" }}>
                    Truthful Associated Cues (-):
                  </div>
                  <FeatureCuesBar
                    cues={result.explanation ? result.explanation.truthful_cues : []}
                    type="truthful"
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  paddingTop: "10px",
                  borderTop: "1px solid var(--border-color)",
                  fontSize: "0.71875rem",
                  color: "var(--text-tertiary)",
                  lineHeight: 1.4,
                }}
              >
                Calculated via TF-IDF feature weights: positive weights tilt toward deceptive spam, negative weights tilt toward authentic stay.
              </div>
            </div>

            {/* Quantitative Text Structural Diagnostics */}
            <div className="panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ marginBottom: "14px" }}>
                  <h3 style={{ marginBottom: "2px" }}>Text Structural Diagnostics</h3>
                  <p style={{ fontSize: "0.78125rem", color: "var(--text-secondary)" }}>
                    Linguistic composition and syntactic markers extracted from input
                  </p>
                </div>

                {result.text_statistics && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "10px",
                      fontSize: "0.8125rem",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 12px",
                        backgroundColor: "var(--bg-subtle)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <div className="section-label" style={{ marginBottom: "2px" }}>Word Count</div>
                      <div className="mono-num" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                        {result.text_statistics.word_count}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "10px 12px",
                        backgroundColor: "var(--bg-subtle)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <div className="section-label" style={{ marginBottom: "2px" }}>Sentence Count</div>
                      <div className="mono-num" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                        {result.text_statistics.sentence_count}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "10px 12px",
                        backgroundColor: "var(--bg-subtle)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <div className="section-label" style={{ marginBottom: "2px" }}>Lexical Diversity</div>
                      <div className="mono-num" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                        {result.text_statistics.lexical_diversity}
                      </div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)" }}>
                        Unique / Total tokens
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "10px 12px",
                        backgroundColor: "var(--bg-subtle)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <div className="section-label" style={{ marginBottom: "2px" }}>Negations Preserved</div>
                      <div className="mono-num" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                        {result.text_statistics.negation_count}
                      </div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)" }}>
                        Polarity modifiers
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "10px 12px",
                        backgroundColor: "var(--bg-subtle)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <div className="section-label" style={{ marginBottom: "2px" }}>1st-Person Pronouns</div>
                      <div className="mono-num" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                        {result.text_statistics.first_person_pronouns}
                      </div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)" }}>
                        I, me, my, we, us
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "10px 12px",
                        backgroundColor: "var(--bg-subtle)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <div className="section-label" style={{ marginBottom: "2px" }}>Exclamations</div>
                      <div className="mono-num" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                        {result.text_statistics.exclamation_count}
                      </div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)" }}>
                        Hyperbolic density
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: "16px",
                  paddingTop: "10px",
                  borderTop: "1px solid var(--border-color)",
                  fontSize: "0.71875rem",
                  color: "var(--text-tertiary)",
                  lineHeight: 1.4,
                }}
              >
                Deceptive reviews historically exhibit higher exclamation counts and pronoun density, compensating for lack of spatial memory.
              </div>
            </div>
          </div>
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
}
