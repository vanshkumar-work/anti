import React from "react";

export default function MetricCard({ label, value, subtext, badge, badgeType = "neutral" }) {
  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-sm)",
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "6px",
        }}
      >
        <span className="section-label">{label}</span>
        {badge && (
          <span
            className={`badge ${
              badgeType === "truthful"
                ? "badge-truthful"
                : badgeType === "deceptive"
                ? "badge-deceptive"
                : "badge-neutral"
            }`}
            style={{ fontSize: "0.65625rem" }}
          >
            {badge}
          </span>
        )}
      </div>

      <div>
        <div
          className="mono-num"
          style={{
            fontSize: "1.45rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.2,
            marginBottom: "3px",
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </div>
        {subtext && (
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}
