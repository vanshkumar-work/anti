/**
 * Formatting and text utilities for ReviewGuard.
 */

export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  const num = Number(value);
  const normalized = num <= 1.0 && num > 0.0 ? num * 100 : num;
  return `${normalized.toFixed(decimals)}%`;
}

export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return "0";
  return Number(value).toLocaleString();
}

export function truncateText(text, maxChars = 80) {
  if (!text) return "";
  const str = String(text).trim();
  if (str.length <= maxChars) return str;
  return `${str.slice(0, maxChars)}...`;
}

export function countWords(text) {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}
