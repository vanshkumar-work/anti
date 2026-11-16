import React from "react";

export default function StatusBadge({ label, isDeceptive }) {
  const isDec = isDeceptive ?? (label && label.toLowerCase().includes("deceptive"));
  return (
    <span className={`badge ${isDec ? "badge-deceptive" : "badge-truthful"}`}>
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: isDec ? "var(--status-deceptive-text)" : "var(--status-truthful-text)",
          display: "inline-block",
        }}
      />
      {label || (isDec ? "Potentially Deceptive" : "More Similar to Truthful")}
    </span>
  );
}
