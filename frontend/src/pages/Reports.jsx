import { useState, useEffect } from "react";
import { getResults, downloadPDF } from "../services/api";

export default function Reports() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    getResults(50).then(r => setResults(r.data.results || [])).catch(() => {});
  }, []);

  const handleExportCSV = () => {
    window.open("/api/reports/csv", "_blank");
  };

  return (
    <div className="container fade-in" style={{ padding: "48px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 className="section-title">📄 Reports</h1>
          <p className="section-subtitle" style={{ marginBottom: 0 }}>View and download solve results.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV} id="export-csv">📊 Export CSV</button>
        </div>
      </div>

      {results.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          <p style={{ fontSize: "3rem", marginBottom: 16 }}>📋</p>
          <p>No results yet. Solve a puzzle to see reports here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {results.map((r, i) => (
            <div key={r._id || i} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: "2rem" }}>
                  {r.puzzle_id === "direct" ? "🧩" : "💾"}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                    {(r.algorithm || "").replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {r.solved_at?.slice(0, 19).replace("T", " ")}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span className={`badge ${r.solved ? "badge-green" : "badge-red"}`}>
                  {r.solved ? "Solved" : "Failed"}
                </span>
                {r.metrics && (
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {r.metrics.execution_time_ms} ms · {Number(r.metrics.iterations || 0).toLocaleString()} iter
                  </span>
                )}
                <button className="btn btn-secondary btn-sm" onClick={() => downloadPDF({ ...r, puzzle_type: r.puzzle_id })}>
                  📄 PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
