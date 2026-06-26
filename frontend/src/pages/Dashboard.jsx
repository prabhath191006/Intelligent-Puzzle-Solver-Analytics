import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { getPerformanceData, getAlgorithmComparison, getSummary } from "../services/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [comparison, setComparison] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    getSummary().then(r => setSummary(r.data.summary)).catch(() => {});
    getAlgorithmComparison().then(r => setComparison(r.data.comparison || [])).catch(() => {});
    getPerformanceData().then(r => setLogs(r.data.logs || [])).catch(() => {});
  }, []);

  const filteredLogs = filter ? logs.filter(l => l.puzzle_type === filter) : logs;

  // Build chart data from comparison
  const barData = {
    labels: comparison.map(c => `${c.puzzle_type} - ${c.algorithm}`),
    datasets: [{
      label: "Avg Time (ms)", data: comparison.map(c => c.avg_time_ms),
      backgroundColor: comparison.map(c => c.algorithm === "backtracking" ? "rgba(16,185,129,0.7)" : "rgba(245,158,11,0.7)"),
      borderRadius: 6,
    }],
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#94a3b8", font: { family: "Inter" } } } },
    scales: {
      x: { ticks: { color: "#64748b", font: { size: 10 } }, grid: { color: "rgba(148,163,184,0.05)" } },
      y: { ticks: { color: "#64748b" }, grid: { color: "rgba(148,163,184,0.08)" } },
    },
  };

  return (
    <div className="container fade-in" style={{ padding: "48px 0" }}>
      <h1 className="section-title">📊 Performance Dashboard</h1>
      <p className="section-subtitle">Aggregated analytics across all puzzle solves.</p>

      {/* Summary cards */}
      {summary && (
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {[
            { label: "Total Solves", value: summary.total_solves, icon: "🧩", color: "var(--accent-blue)" },
            { label: "Success Rate", value: `${summary.success_rate}%`, icon: "✅", color: "var(--accent-green)" },
            { label: "Puzzles Saved", value: summary.total_puzzles, icon: "💾", color: "var(--accent-purple)" },
            { label: "Benchmarks", value: summary.performance_logs, icon: "📈", color: "var(--accent-orange)" },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: "center" }}>
              <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: s.color, margin: "8px 0 4px" }}>{s.value}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div style={{ marginBottom: 24 }}>
        <select className="select" style={{ maxWidth: 300 }} value={filter} onChange={e => setFilter(e.target.value)} id="dashboard-filter">
          <option value="">All Puzzles</option>
          <option value="sudoku">Sudoku</option>
          <option value="nqueens">N-Queens</option>
          <option value="knights_tour">Knight's Tour</option>
        </select>
      </div>

      {/* Chart */}
      {comparison.length > 0 && (
        <div className="card" style={{ marginBottom: 32 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Average Execution Time by Algorithm</h3>
          <div style={{ height: 300 }}>
            <Bar data={barData} options={chartOpts} />
          </div>
        </div>
      )}

      {/* Recent logs table */}
      {filteredLogs.length > 0 && (
        <div className="card" style={{ overflowX: "auto" }}>
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Recent Performance Logs</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr>
                {["Puzzle", "Algorithm", "Time (ms)", "Iterations", "Memory (MB)", "Date"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", borderBottom: "2px solid var(--border-subtle)", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.slice(0, 20).map((l, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "10px 14px" }}>{l.puzzle_type}</td>
                  <td><span className={`badge ${l.algorithm === "backtracking" ? "badge-green" : "badge-orange"}`}>{l.algorithm}</span></td>
                  <td>{l.execution_time_ms}</td>
                  <td>{Number(l.iterations).toLocaleString()}</td>
                  <td>{l.memory_used_mb}</td>
                  <td style={{ color: "var(--text-muted)" }}>{l.logged_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!summary && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          <p>No data yet. Solve some puzzles to see analytics!</p>
        </div>
      )}
    </div>
  );
}
