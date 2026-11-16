import React from "react";

export default function FeatureCuesBar({ cues = [], type = "deceptive" }) {
  if (!cues || cues.length === 0) {
    return (
      <div style={{ fontSize: "0.825rem", color: "var(--text-muted)", fontStyle: "italic", padding: "8px 0" }}>
        No prominent {type} cue terms observed.
      </div>
    );
  }

  const isDec = type === "deceptive";
  const textColor = isDec ? "var(--status-deceptive-text)" : "var(--status-truthful-text)";
  const bgColor = isDec ? "var(--status-deceptive-bg)" : "var(--status-truthful-bg)";
  const borderColor = isDec ? "var(--status-deceptive-border)" : "var(--status-truthful-border)";

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
      {cues.map((item, idx) => (
        <span
          key={idx}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: bgColor,
            color: textColor,
            border: `1px solid ${borderColor}`,
            borderRadius: "var(--radius-sm)",
            padding: "3px 8px",
            fontSize: "0.8rem",
            fontWeight: 500,
          }}
        >
          <span>{item.term}</span>
          <span style={{ fontSize: "0.7rem", opacity: 0.8, fontFamily: "monospace" }}>
            {item.score > 0 ? `+${item.score.toFixed(3)}` : item.score.toFixed(3)}
          </span>
        </span>
      ))}
    </div>
  );
}
