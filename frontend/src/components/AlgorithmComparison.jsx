/**
 * AlgorithmComparison – side-by-side metrics table.
 */
export default function AlgorithmComparison({ comparison }) {
  if (!comparison || Object.keys(comparison).length === 0) return null;

  const algorithms = Object.keys(comparison);

  const metrics = [
    { key: "execution_time_ms", label: "Execution Time", unit: "ms", icon: "⏱" },
    { key: "memory_used_mb", label: "Memory Used", unit: "MB", icon: "💾" },
    { key: "iterations", label: "Iterations", unit: "", icon: "🔄", format: true },
    { key: "recursive_calls", label: "Recursive Calls", unit: "", icon: "📞", format: true },
    { key: "pruned_branches", label: "Pruned Branches", unit: "", icon: "✂️", format: true },
    { key: "states_explored", label: "States Explored", unit: "", icon: "🔍", format: true },
  ];

  const getWinner = (key) => {
    const vals = algorithms.map((a) => comparison[a].metrics?.[key] || 0);
    if (key === "pruned_branches") {
      // More pruning = better for backtracking
      return vals[0] > vals[1] ? algorithms[0] : algorithms[1];
    }
    // Less = better for time, memory, iterations
    return vals[0] < vals[1] ? algorithms[0] : algorithms[1];
  };

  const formatNum = (v, fmt) =>
    fmt ? Number(v || 0).toLocaleString() : Number(v || 0).toFixed(2);

  return (
    <div className="comparison-wrapper">
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Metric</th>
            {algorithms.map((a) => (
              <th key={a} className={a === "backtracking" ? "col-bt" : "col-bf"}>
                {a.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </th>
            ))}
            <th>Winner</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => {
            const winner = getWinner(m.key);
            return (
              <tr key={m.key}>
                <td className="metric-label">
                  <span className="metric-icon">{m.icon}</span>
                  {m.label}
                </td>
                {algorithms.map((a) => {
                  const val = comparison[a].metrics?.[m.key];
                  const isWin = winner === a;
                  return (
                    <td key={a} className={isWin ? "winner-cell" : ""}>
                      {formatNum(val, m.format)}
                      {m.unit && ` ${m.unit}`}
                    </td>
                  );
                })}
                <td>
                  <span className={`badge ${winner === "backtracking" ? "badge-green" : "badge-orange"}`}>
                    {winner.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <style>{`
        .comparison-wrapper {
          overflow-x: auto;
          margin-top: 20px;
        }
        .comparison-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .comparison-table th {
          padding: 14px 18px;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          text-align: left;
          border-bottom: 2px solid var(--border-subtle);
        }
        .col-bt { color: var(--accent-green) !important; }
        .col-bf { color: var(--accent-orange) !important; }
        .comparison-table td {
          padding: 12px 18px;
          font-size: 0.9rem;
          border-bottom: 1px solid var(--border-subtle);
          color: var(--text-primary);
        }
        .comparison-table tr:last-child td { border-bottom: none; }
        .comparison-table tr:hover td { background: rgba(59, 130, 246, 0.05); }
        .winner-cell {
          color: var(--accent-green) !important;
          font-weight: 700;
        }
        .metric-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
        .metric-icon { font-size: 1.1rem; }
      `}</style>
    </div>
  );
}
