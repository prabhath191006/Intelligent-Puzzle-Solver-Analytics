import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
);

/**
 * PerformanceChart – renders algorithm comparison charts.
 */
export default function PerformanceChart({ comparison }) {
  if (!comparison || Object.keys(comparison).length === 0) {
    return <p style={{ color: "var(--text-muted)", textAlign: "center" }}>No data to display</p>;
  }

  const algorithms = Object.keys(comparison);
  const labels = ["Time (ms)", "Iterations", "Recursive Calls", "Pruned Branches"];

  const colors = {
    backtracking: { bg: "rgba(16, 185, 129, 0.7)", border: "#10b981" },
    brute_force: { bg: "rgba(245, 158, 11, 0.7)", border: "#f59e0b" },
  };

  // Bar chart data
  const barData = {
    labels,
    datasets: algorithms.map((algo) => ({
      label: algo.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      data: [
        comparison[algo].metrics?.execution_time_ms || 0,
        comparison[algo].metrics?.iterations || 0,
        comparison[algo].metrics?.recursive_calls || 0,
        comparison[algo].metrics?.pruned_branches || 0,
      ],
      backgroundColor: colors[algo]?.bg || "rgba(59, 130, 246, 0.7)",
      borderColor: colors[algo]?.border || "#3b82f6",
      borderWidth: 2,
      borderRadius: 6,
    })),
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#94a3b8", font: { family: "Inter", weight: 600 } },
      },
      title: { display: false },
    },
    scales: {
      x: {
        ticks: { color: "#64748b", font: { family: "Inter" } },
        grid: { color: "rgba(148, 163, 184, 0.05)" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#64748b", font: { family: "Inter" } },
        grid: { color: "rgba(148, 163, 184, 0.08)" },
      },
    },
  };

  // Doughnut for time split
  const doughnutData = {
    labels: algorithms.map((a) => a.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())),
    datasets: [
      {
        data: algorithms.map((a) => comparison[a].metrics?.execution_time_ms || 1),
        backgroundColor: algorithms.map(
          (a) => colors[a]?.bg || "rgba(59, 130, 246, 0.7)"
        ),
        borderColor: algorithms.map((a) => colors[a]?.border || "#3b82f6"),
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#94a3b8", font: { family: "Inter", weight: 500 }, padding: 16 },
      },
    },
  };

  return (
    <div className="chart-container">
      <div className="chart-row">
        <div className="chart-card">
          <h3 className="chart-title">📊 Algorithm Performance Comparison</h3>
          <div style={{ height: "300px" }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
        <div className="chart-card chart-card-sm">
          <h3 className="chart-title">⏱ Time Distribution</h3>
          <div style={{ height: "260px" }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <style>{`
        .chart-container {
          margin-top: 24px;
        }
        .chart-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }
        .chart-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 24px;
        }
        .chart-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 16px;
        }
        @media (max-width: 768px) {
          .chart-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
