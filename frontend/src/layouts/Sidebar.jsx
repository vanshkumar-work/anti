import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Files,
  BarChart3,
  Cpu,
  Info,
  Shield,
} from "lucide-react";

const NAV_GROUPS = [
  {
    title: "Workspace",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/analyze", label: "Analyze Review", icon: Search },
      { to: "/batch", label: "Batch Analysis", icon: Files },
    ],
  },
  {
    title: "Evaluation & System",
    items: [
      { to: "/analytics", label: "Analytics & Curves", icon: BarChart3 },
      { to: "/model-info", label: "Model Architecture", icon: Cpu },
      { to: "/about", label: "About & Methodology", icon: Info },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div
        style={{
          padding: "18px 16px 16px 16px",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "var(--radius-xs)",
              backgroundColor: "var(--accent-primary)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Shield size={14} strokeWidth={2.5} />
          </div>
          <div>
            <div
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                letterSpacing: "-0.025em",
                lineHeight: 1.2,
              }}
            >
              ReviewGuard
            </div>
            <div
              style={{
                fontSize: "0.6875rem",
                color: "var(--text-secondary)",
                letterSpacing: "0.01em",
                fontWeight: 400,
              }}
            >
              NLP Spam Intelligence
            </div>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav
        style={{
          padding: "14px 10px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          flex: 1,
          overflowY: "auto",
        }}
      >
        {NAV_GROUPS.map((group, gIdx) => (
          <div key={gIdx}>
            <div
              style={{
                fontSize: "0.65625rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--text-tertiary)",
                padding: "0 8px 6px 8px",
              }}
            >
              {group.title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    style={({ isActive }) => ({
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      padding: "7px 10px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.8125rem",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                      backgroundColor: isActive ? "#FFFFFF" : "transparent",
                      border: isActive
                        ? "1px solid var(--border-color)"
                        : "1px solid transparent",
                      transition: "all 0.12s ease",
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={15}
                          strokeWidth={isActive ? 2 : 1.75}
                          color={isActive ? "var(--accent-primary)" : "var(--text-secondary)"}
                        />
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {isActive && (
                          <span
                            style={{
                              width: "4px",
                              height: "4px",
                              borderRadius: "50%",
                              backgroundColor: "var(--accent-primary)",
                            }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
