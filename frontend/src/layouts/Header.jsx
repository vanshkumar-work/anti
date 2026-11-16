import React from "react";
import { useLocation } from "react-router-dom";

const ROUTE_CONTEXT = {
  "/": { title: "Dashboard", category: "Workspace" },
  "/analyze": { title: "Analyze Review", category: "Workspace" },
  "/batch": { title: "Batch Analysis", category: "Workspace" },
  "/analytics": { title: "Corpus & Model Analytics", category: "Evaluation" },
  "/model-info": { title: "Model Architecture & Methodology", category: "System" },
  "/about": { title: "About & Methodology", category: "System" },
};

export default function Header() {
  const location = useLocation();
  const current = ROUTE_CONTEXT[location.pathname] || {
    title: "ReviewGuard",
    category: "System",
  };

  return (
    <header
      style={{
        height: "48px",
        borderBottom: "1px solid var(--border-color)",
        backgroundColor: "var(--bg-main)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 36px",
        flexShrink: 0,
      }}
    >
      {/* Breadcrumb Context */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8125rem" }}>
        <span style={{ color: "var(--text-tertiary)", fontWeight: 500 }}>
          {current.category}
        </span>
        <span style={{ color: "var(--border-strong)", fontSize: "0.75rem" }}>/</span>
        <span style={{ color: "var(--text-primary)", fontWeight: 600, letterSpacing: "-0.01em" }}>
          {current.title}
        </span>
      </div>
    </header>
  );
}
