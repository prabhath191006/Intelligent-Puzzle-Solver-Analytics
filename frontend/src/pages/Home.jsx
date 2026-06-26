import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSummary } from "../services/api";

export default function Home() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getSummary()
      .then((res) => setSummary(res.data.summary))
      .catch(() => {});
  }, []);

  const features = [
    {
      icon: "🧩",
      title: "Multiple Puzzles",
      desc: "Solve Sudoku, N-Queens, and Knight's Tour with interactive input.",
      color: "var(--accent-blue)",
    },
    {
      icon: "⚡",
      title: "Two Algorithms",
      desc: "Compare Backtracking vs Brute Force side-by-side.",
      color: "var(--accent-green)",
    },
    {
      icon: "📊",
      title: "Live Analytics",
      desc: "Real-time performance metrics with interactive charts.",
      color: "var(--accent-purple)",
    },
    {
      icon: "📄",
      title: "Export Reports",
      desc: "Download PDF / CSV reports of solutions and performance.",
      color: "var(--accent-orange)",
    },
    {
      icon: "🎯",
      title: "Step Visualization",
      desc: "Watch the algorithm solve the puzzle step-by-step.",
      color: "var(--accent-teal)",
    },
    {
      icon: "🗄️",
      title: "Persistent Data",
      desc: "All results stored in MongoDB for historical analysis.",
      color: "var(--accent-cyan)",
    },
  ];

  return (
    <div className="home-page fade-in">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="container hero-content">
          <span className="hero-badge">🎓 DAA Capstone Project 2026</span>
          <h1 className="hero-title">
            Intelligent Puzzle Solver
          </h1>
          <p className="hero-subtitle">
            Explore and compare <strong>Backtracking</strong> and <strong>Brute Force</strong> algorithms
            on classic computational puzzles — with real-time visualization and performance analytics.
          </p>
          <div className="hero-actions">
            <Link to="/select" className="btn btn-primary btn-lg" id="cta-start">
              🚀 Start Solving
            </Link>
            <Link to="/dashboard" className="btn btn-secondary btn-lg" id="cta-dashboard">
              📊 View Dashboard
            </Link>
          </div>

          {summary && (
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">{summary.total_solves}</span>
                <span className="stat-label">Solves</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{summary.success_rate}%</span>
                <span className="stat-label">Success Rate</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{summary.performance_logs}</span>
                <span className="stat-label">Benchmarks</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Puzzles */}
      <section className="section container">
        <h2 className="section-title">Supported Puzzles</h2>
        <p className="section-subtitle">Choose a puzzle, pick an algorithm, and watch the magic happen.</p>
        <div className="puzzle-cards">
          {[
            {
              icon: "🔢",
              name: "Sudoku",
              desc: "Classic 9×9 constraint satisfaction problem. Fill every row, column, and 3×3 box with digits 1–9.",
              link: "/input/sudoku",
              color: "#3b82f6",
            },
            {
              icon: "♛",
              name: "N-Queens",
              desc: "Place N queens on an N×N chessboard so that no two queens threaten each other.",
              link: "/input/nqueens",
              color: "#8b5cf6",
            },
            {
              icon: "♞",
              name: "Knight's Tour",
              desc: "Move a knight to visit every square on an N×N board exactly once.",
              link: "/input/knights_tour",
              color: "#14b8a6",
            },
          ].map((p) => (
            <Link to={p.link} key={p.name} className="puzzle-card" style={{ "--card-accent": p.color }}>
              <span className="puzzle-icon">{p.icon}</span>
              <h3>{p.name}</h3>
              <p>{p.desc}</p>
              <span className="puzzle-card-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section container">
        <h2 className="section-title">Key Features</h2>
        <p className="section-subtitle">A complete platform for algorithm analysis and visualization.</p>
        <div className="grid-3">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <span className="feature-icon" style={{ background: f.color + "20", color: f.color }}>
                {f.icon}
              </span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section className="section container">
        <h2 className="section-title">System Architecture</h2>
        <p className="section-subtitle">Enterprise-grade multi-layer architecture.</p>
        <div className="arch-flow">
          {["User", "Frontend (React)", "REST API (Flask)", "Algorithm Engine", "MongoDB", "Analytics", "Reports"].map(
            (step, i) => (
              <div key={step} className="arch-step">
                <div className="arch-node">{step}</div>
                {i < 6 && <span className="arch-arrow">→</span>}
              </div>
            )
          )}
        </div>
      </section>

      <style>{`
        /* ── Hero ── */
        .hero {
          position: relative;
          padding: 100px 0 80px;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          top: -50%;
          left: -20%;
          right: -20%;
          bottom: -50%;
          background: radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.12), transparent 50%),
                      radial-gradient(ellipse at 70% 60%, rgba(139,92,246,0.1), transparent 50%),
                      radial-gradient(ellipse at 50% 90%, rgba(236,72,153,0.08), transparent 50%);
          pointer-events: none;
        }
        .hero-content {
          position: relative;
          text-align: center;
        }
        .hero-badge {
          display: inline-block;
          padding: 8px 20px;
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--accent-blue);
          margin-bottom: 24px;
        }
        .hero-title {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.03em;
          background: var(--gradient-hero);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 20px;
        }
        .hero-subtitle {
          font-size: 1.15rem;
          color: var(--text-secondary);
          max-width: 640px;
          margin: 0 auto 36px;
          line-height: 1.7;
        }
        .hero-subtitle strong {
          color: var(--text-primary);
        }
        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .hero-stats {
          display: flex;
          gap: 48px;
          justify-content: center;
          margin-top: 48px;
        }
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--accent-blue);
        }
        .stat-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* ── Sections ── */
        .section {
          padding: 80px 24px;
        }

        /* ── Puzzle Cards ── */
        .puzzle-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }
        .puzzle-card {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 32px;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          text-decoration: none;
          color: var(--text-primary);
          transition: all var(--transition-base);
          overflow: hidden;
        }
        .puzzle-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--card-accent);
          opacity: 0;
          transition: opacity var(--transition-base);
        }
        .puzzle-card:hover {
          border-color: var(--card-accent);
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .puzzle-card:hover::before { opacity: 1; }
        .puzzle-icon {
          font-size: 2.5rem;
          margin-bottom: 16px;
        }
        .puzzle-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .puzzle-card p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
          flex: 1;
        }
        .puzzle-card-arrow {
          font-size: 1.5rem;
          color: var(--text-muted);
          margin-top: 16px;
          transition: transform var(--transition-fast);
        }
        .puzzle-card:hover .puzzle-card-arrow {
          transform: translateX(4px);
          color: var(--card-accent);
        }

        /* ── Feature Cards ── */
        .feature-card {
          padding: 24px;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          transition: all var(--transition-base);
        }
        .feature-card:hover {
          border-color: var(--border-accent);
          transform: translateY(-2px);
        }
        .feature-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-sm);
          font-size: 1.3rem;
          margin-bottom: 16px;
        }
        .feature-card h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .feature-card p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* ── Architecture Flow ── */
        .arch-flow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
          padding: 32px;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
        }
        .arch-step {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .arch-node {
          padding: 10px 18px;
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--accent-blue);
          white-space: nowrap;
        }
        .arch-arrow {
          color: var(--text-muted);
          font-size: 1.2rem;
        }
      `}</style>
    </div>
  );
}
