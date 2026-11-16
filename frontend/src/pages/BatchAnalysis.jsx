import React, { useState, useMemo } from "react";
import { Upload, Download, ArrowUpDown, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { analyzeBatchFile, getSampleBatchData } from "../services/api";
import MetricCard from "../components/MetricCard";
import DisclaimerBanner from "../components/DisclaimerBanner";
import StatusBadge from "../components/StatusBadge";
import { formatPercent, formatNumber } from "../utils/formatters";

export default function BatchAnalysis() {
  const [file, setFile] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  const [error, setError] = useState(null);
  const [filterClass, setFilterClass] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("Confidence_Pct");
  const [sortDirection, setSortDirection] = useState("desc");
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  // Inspect uploaded CSV columns and preliminary row count
  function processFile(uploaded) {
    if (!uploaded) return;
    if (!uploaded.name.endsWith(".csv")) {
      setError("Please select a valid CSV file (.csv format required).");
      return;
    }

    setFile(uploaded);
    setFileMeta({
      name: uploaded.name,
      sizeKb: (uploaded.size / 1024).toFixed(1),
    });
    setError(null);
    setResultsData(null);
    setCurrentPage(1);

    // Read headers to pre-populate column selector
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      const firstLine = lines[0] || "";
      const parsedCols = firstLine
        .split(",")
        .map((c) => c.trim().replace(/^["']|["']$/g, ""));
      setColumns(parsedCols);
      setFileMeta((prev) => ({
        ...prev,
        previewRows: Math.max(0, lines.length - 1),
      }));

      // Auto-select column containing text/review
      const found =
        parsedCols.find((c) => /text|review|comment|content/i.test(c)) ||
        parsedCols[0];
      setSelectedColumn(found);
    };
    reader.readAsText(uploaded.slice(0, 8192));
  }

  function handleFileChange(e) {
    const uploaded = e.target.files[0];
    processFile(uploaded);
  }

  function handleReset() {
    setFile(null);
    setFileMeta(null);
    setColumns([]);
    setSelectedColumn("");
    setResultsData(null);
    setError(null);
    setSearchQuery("");
    setCurrentPage(1);
  }

  // Load built-in sample test CSV
  async function handleLoadSample() {
    try {
      setLoading(true);
      setError(null);
      const res = await getSampleBatchData();
      const csvHeader = res.columns.join(",");
      const csvRows = res.rows.map((r) =>
        res.columns
          .map((c) => `"${String(r[c] || "").replace(/"/g, '""')}"`)
          .join(",")
      );
      const csvContent = [csvHeader, ...csvRows].join("\n");
      const sampleFile = new File([csvContent], "sample_test_batch.csv", {
        type: "text/csv",
      });

      setFile(sampleFile);
      setFileMeta({
        name: "sample_test_batch.csv",
        sizeKb: (sampleFile.size / 1024).toFixed(1),
        previewRows: res.rows.length,
      });
      setColumns(res.columns);
      const autoCol =
        res.columns.find((c) => /text|review/i.test(c)) || res.columns[0];
      setSelectedColumn(autoCol);

      // Auto run analysis on sample
      const batchRes = await analyzeBatchFile(sampleFile, autoCol);
      setResultsData(batchRes);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "Failed to load sample dataset.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze() {
    if (!file) {
      setError("Please select or upload a CSV file.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await analyzeBatchFile(file, selectedColumn);
      setResultsData(res);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "Batch analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadCSV() {
    if (!resultsData || !resultsData.results) return;
    const items = resultsData.results;
    if (items.length === 0) return;

    const headers = Object.keys(items[0]);
    const csvLines = [
      headers.join(","),
      ...items.map((row) =>
        headers
          .map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];
    const blob = new Blob([csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `audited_${resultsData.filename || "reviews"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Toggle sorting
  function handleSort(field) {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  }

  // Filtered & Sorted rows
  const processedRows = useMemo(() => {
    if (!resultsData?.results) return [];

    let rows = resultsData.results.filter((row) => {
      const matchesClass =
        filterClass === "all"
          ? true
          : filterClass === "deceptive"
          ? row.Predicted_Class === "Potentially Deceptive"
          : row.Predicted_Class === "More Similar to Truthful Examples";

      const textVal = String(
        row[resultsData?.selected_column] || ""
      ).toLowerCase();
      const matchesSearch = searchQuery
        ? textVal.includes(searchQuery.toLowerCase())
        : true;

      return matchesClass && matchesSearch;
    });

    if (sortField) {
      rows = [...rows].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        const comparison = valA > valB ? 1 : -1;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return rows;
  }, [
    resultsData,
    filterClass,
    searchQuery,
    sortField,
    sortDirection,
  ]);

  // Pagination calculation
  const totalDisplayRows = processedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalDisplayRows / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedRows.slice(start, start + pageSize);
  }, [processedRows, currentPage, pageSize]);

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ marginBottom: "6px" }}>Batch Review Analysis</h1>
        <p style={{ maxWidth: "760px", fontSize: "0.925rem" }}>
          Upload bulk customer review datasets in CSV format. ReviewGuard runs calibrated inference,
          validates records, calculates summary proportions, and generates audited reports for download.
        </p>
      </div>

      {/* Upload and Configuration Panel */}
      <div className="panel" style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {/* File input dropzone */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <label
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--text-secondary)",
                }}
              >
                1. Select CSV Dataset
              </label>
              {file && (
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div
              style={{
                border: "1px dashed var(--border-strong)",
                borderRadius: "var(--radius-md)",
                padding: "22px 16px",
                textAlign: "center",
                backgroundColor: file ? "var(--bg-main)" : "var(--bg-subtle)",
                transition: "border-color 0.15s ease",
              }}
            >
              <Upload
                size={22}
                color="var(--accent-primary)"
                style={{ margin: "0 auto 10px auto", display: "block" }}
              />
              <input
                type="file"
                accept=".csv"
                id="csv-file-input"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <label
                htmlFor="csv-file-input"
                className="btn-secondary"
                style={{
                  display: "inline-block",
                  cursor: "pointer",
                  fontSize: "0.825rem",
                  padding: "7px 16px",
                }}
              >
                {file ? "Replace CSV File" : "Choose CSV File"}
              </label>

              {fileMeta ? (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "8px 12px",
                    backgroundColor: "var(--bg-subtle)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    textAlign: "left",
                    fontSize: "0.8rem",
                  }}
                >
                  <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {fileMeta.name}
                  </div>
                  <div
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.75rem",
                      marginTop: "2px",
                    }}
                  >
                    Size: {fileMeta.sizeKb} KB
                    {fileMeta.previewRows !== undefined
                      ? ` | ~${formatNumber(fileMeta.previewRows)} rows detected`
                      : ""}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: "10px",
                  }}
                >
                  Supports comma-separated UTF-8 CSV files with header row
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: "10px",
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>Or test with pre-configured data:</span>
              <button
                type="button"
                onClick={handleLoadSample}
                disabled={loading}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent-primary)",
                  fontWeight: 600,
                  textDecoration: "underline",
                  padding: 0,
                  fontSize: "inherit",
                  cursor: "pointer",
                }}
              >
                Load built-in 8-sample CSV
              </button>
            </div>
          </div>

          {/* Column selector & Analyze action */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--text-secondary)",
                  marginBottom: "8px",
                }}
              >
                2. Target Review Column
              </label>
              {columns.length > 0 ? (
                <div>
                  <select
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      fontSize: "0.85rem",
                    }}
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                  >
                    {columns.map((c, i) => (
                      <option key={i} value={c}>
                        Column: "{c}"
                      </option>
                    ))}
                  </select>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      marginTop: "6px",
                    }}
                  >
                    Found {columns.length} columns in CSV header.
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: "0.825rem",
                    color: "var(--text-muted)",
                    fontStyle: "italic",
                    padding: "12px",
                    backgroundColor: "var(--bg-subtle)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  Upload a CSV file or load the sample dataset to inspect available columns.
                </div>
              )}
            </div>

            <div style={{ marginTop: "24px" }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleAnalyze}
                disabled={loading || !file}
                style={{
                  width: "100%",
                  padding: "11px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="spin-icon" />
                    <span>Processing Batch Predictions...</span>
                  </>
                ) : (
                  <span>Run Batch Inference Audit</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginTop: "18px",
              padding: "12px 16px",
              backgroundColor: "var(--status-deceptive-bg)",
              border: "1px solid var(--status-deceptive-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.825rem",
              color: "var(--status-deceptive-text)",
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      {resultsData && resultsData.summary && (
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
              marginBottom: "24px",
            }}
          >
            <MetricCard
              label="Total Rows"
              value={formatNumber(resultsData.summary.total_rows)}
              subtext="Records in uploaded file"
              badge="File"
              badgeType="neutral"
            />
            <MetricCard
              label="Valid Analyzed"
              value={formatNumber(resultsData.summary.valid_reviews_analyzed)}
              subtext={`${resultsData.summary.invalid_or_empty_rows} empty rows skipped`}
              badge="Processed"
              badgeType="truthful"
            />
            <MetricCard
              label="Flagged Deceptive"
              value={formatNumber(resultsData.summary.deceptive_count)}
              subtext={`${formatPercent(resultsData.summary.deceptive_pct)} of valid subset`}
              badge="Deceptive"
              badgeType="deceptive"
            />
            <MetricCard
              label="Classified Truthful"
              value={formatNumber(resultsData.summary.truthful_count)}
              subtext={`${formatPercent(resultsData.summary.truthful_pct)} of valid subset`}
              badge="Authentic"
              badgeType="truthful"
            />
            <MetricCard
              label="Mean Confidence"
              value={formatPercent(resultsData.summary.avg_confidence_pct)}
              subtext="Model estimation mean"
              badge="Calibrated"
              badgeType="neutral"
            />
          </div>

          {/* Results Table Panel */}
          <div className="panel">
            {/* Filter and Action Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
                marginBottom: "16px",
                paddingBottom: "14px",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              {/* Classification filter pills */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                  }}
                >
                  Filter:
                </span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    className={
                      filterClass === "all" ? "btn-primary" : "btn-secondary"
                    }
                    style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                    onClick={() => {
                      setFilterClass("all");
                      setCurrentPage(1);
                    }}
                  >
                    All ({resultsData.results.length})
                  </button>
                  <button
                    type="button"
                    className={
                      filterClass === "deceptive"
                        ? "btn-primary"
                        : "btn-secondary"
                    }
                    style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                    onClick={() => {
                      setFilterClass("deceptive");
                      setCurrentPage(1);
                    }}
                  >
                    Deceptive ({resultsData.summary.deceptive_count})
                  </button>
                  <button
                    type="button"
                    className={
                      filterClass === "truthful"
                        ? "btn-primary"
                        : "btn-secondary"
                    }
                    style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                    onClick={() => {
                      setFilterClass("truthful");
                      setCurrentPage(1);
                    }}
                  >
                    Truthful ({resultsData.summary.truthful_count})
                  </button>
                </div>
              </div>

              {/* Search, Page Size, and CSV Download */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="text"
                  placeholder="Search in reviews..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: "180px",
                    fontSize: "0.8rem",
                    padding: "6px 10px",
                  }}
                />

                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    fontSize: "0.8rem",
                    padding: "6px 8px",
                  }}
                >
                  <option value={10}>10 / page</option>
                  <option value={15}>15 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={1000}>All rows</option>
                </select>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleDownloadCSV}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.8rem",
                    padding: "6px 12px",
                  }}
                >
                  <Download size={14} /> Export Audited CSV
                </button>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "42%" }}>
                      <span style={{ cursor: "default" }}>Review Text</span>
                    </th>
                    <th>
                      <button
                        type="button"
                        onClick={() => handleSort("Predicted_Class")}
                        style={{
                          background: "none",
                          border: "none",
                          fontWeight: "inherit",
                          color: "inherit",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: 0,
                        }}
                      >
                        Classification
                        {sortField === "Predicted_Class" ? (
                          sortDirection === "asc" ? (
                            <ChevronUp size={13} />
                          ) : (
                            <ChevronDown size={13} />
                          )
                        ) : (
                          <ArrowUpDown size={12} color="var(--text-muted)" />
                        )}
                      </button>
                    </th>
                    <th>
                      <button
                        type="button"
                        onClick={() => handleSort("Confidence_Pct")}
                        style={{
                          background: "none",
                          border: "none",
                          fontWeight: "inherit",
                          color: "inherit",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: 0,
                        }}
                      >
                        Confidence
                        {sortField === "Confidence_Pct" ? (
                          sortDirection === "asc" ? (
                            <ChevronUp size={13} />
                          ) : (
                            <ChevronDown size={13} />
                          )
                        ) : (
                          <ArrowUpDown size={12} color="var(--text-muted)" />
                        )}
                      </button>
                    </th>
                    <th>
                      <button
                        type="button"
                        onClick={() => handleSort("Deceptive_Score_Pct")}
                        style={{
                          background: "none",
                          border: "none",
                          fontWeight: "inherit",
                          color: "inherit",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: 0,
                        }}
                      >
                        Deceptive Score
                        {sortField === "Deceptive_Score_Pct" ? (
                          sortDirection === "asc" ? (
                            <ChevronUp size={13} />
                          ) : (
                            <ChevronDown size={13} />
                          )
                        ) : (
                          <ArrowUpDown size={12} color="var(--text-muted)" />
                        )}
                      </button>
                    </th>
                    <th>
                      <button
                        type="button"
                        onClick={() => handleSort("Word_Count")}
                        style={{
                          background: "none",
                          border: "none",
                          fontWeight: "inherit",
                          color: "inherit",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: 0,
                        }}
                      >
                        Word Count
                        {sortField === "Word_Count" ? (
                          sortDirection === "asc" ? (
                            <ChevronUp size={13} />
                          ) : (
                            <ChevronDown size={13} />
                          )
                        ) : (
                          <ArrowUpDown size={12} color="var(--text-muted)" />
                        )}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.length > 0 ? (
                    paginatedRows.map((row, i) => (
                      <tr key={i}>
                        <td
                          style={{
                            fontSize: "0.825rem",
                            color: "var(--text-primary)",
                            lineHeight: 1.5,
                          }}
                        >
                          {String(row[resultsData.selected_column] || "")}
                        </td>
                        <td>
                          <StatusBadge label={row.Predicted_Class} />
                        </td>
                        <td
                          style={{
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            fontFamily: "monospace",
                          }}
                        >
                          {row.Confidence_Pct !== undefined
                            ? formatPercent(row.Confidence_Pct)
                            : "N/A"}
                        </td>
                        <td
                          style={{
                            color: "var(--text-secondary)",
                            fontFamily: "monospace",
                          }}
                        >
                          {row.Deceptive_Score_Pct !== undefined
                            ? formatPercent(row.Deceptive_Score_Pct)
                            : "N/A"}
                        </td>
                        <td style={{ color: "var(--text-secondary)" }}>
                          {row.Word_Count !== undefined
                            ? formatNumber(row.Word_Count)
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          textAlign: "center",
                          padding: "28px",
                          color: "var(--text-muted)",
                        }}
                      >
                        No records match the current filter or search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination and Summary Footer */}
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
              }}
            >
              <div>
                Showing {paginatedRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
                {Math.min(currentPage * pageSize, totalDisplayRows)} of{" "}
                {totalDisplayRows} filtered reviews (total {resultsData.results.length})
              </div>

              {totalPages > 1 && (
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-primary)", padding: "0 4px" }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
}
