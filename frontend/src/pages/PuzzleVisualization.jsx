import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SudokuGrid from "../components/SudokuGrid";
import NQueensBoard from "../components/NQueensBoard";
import KnightsTourBoard from "../components/KnightsTourBoard";
import PerformanceChart from "../components/PerformanceChart";
import AlgorithmComparison from "../components/AlgorithmComparison";
import { solvePuzzle, compareSolvers, downloadPDF } from "../services/api";

export default function PuzzleVisualization() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Playback Animation States
  const [playbackMode, setPlaybackMode] = useState("animated");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50); // ms per step

  useEffect(() => {
    if (!state) { navigate("/select"); return; }
    solve();
  }, []);

  const solve = async () => {
    setLoading(true); setError(null);
    try {
      if (state.compare) {
        const res = await compareSolvers(state);
        setComparison(res.data.comparison);
        // Use backtracking result as primary display
        const bt = res.data.comparison.backtracking;
        setResult({ solved: bt.solved, solution: bt.solution, metrics: bt.metrics, puzzle_type: state.puzzle_type, algorithm: "backtracking", steps: bt.steps || [] });
      } else {
        const res = await solvePuzzle(state);
        setResult(res.data);
      }
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Solve failed");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (result && result.steps && result.steps.length > 0 && !state?.compare) {
      setIsPlaying(true);
      setCurrentStep(0);
    } else {
      setPlaybackMode("instant");
    }
  }, [result]);

  useEffect(() => {
    let timer = null;
    if (isPlaying && result?.steps) {
      if (currentStep < result.steps.length) {
        timer = setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
        }, speed);
      } else {
        setIsPlaying(false);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStep, speed, result]);

  const handleDownloadPDF = () => {
    if (result) downloadPDF(result);
  };

  // Re-build board state at currentStep
  const getBoardAtStep = () => {
    if (!result || !state || !result.steps) return null;
    const steps = result.steps;
    const n = result.solution ? result.solution.length : (state.n || 9);

    if (state.puzzle_type === "sudoku") {
      const newBoard = state.board.map(row => [...row]);
      for (let i = 0; i < currentStep; i++) {
        const s = steps[i];
        if (s && s.row !== undefined && s.col !== undefined) {
          newBoard[s.row][s.col] = s.value;
        }
      }
      return newBoard;
    } else if (state.puzzle_type === "nqueens") {
      const newBoard = Array.from({ length: n }, () => Array(n).fill(0));
      for (let i = 0; i < currentStep; i++) {
        const s = steps[i];
        if (s && s.row !== undefined && s.col !== undefined) {
          if (s.action === "place") {
            newBoard[s.row][s.col] = 1;
          } else if (s.action === "remove") {
            newBoard[s.row][s.col] = 0;
          }
        }
      }
      return newBoard;
    } else if (state.puzzle_type === "knights_tour") {
      const newBoard = Array.from({ length: n }, () => Array(n).fill(-1));
      for (let i = 0; i < currentStep; i++) {
        const s = steps[i];
        if (s && s.row !== undefined && s.col !== undefined) {
          if (s.action === "place") {
            newBoard[s.row][s.col] = s.move;
          } else if (s.action === "remove") {
            newBoard[s.row][s.col] = -1;
          }
        }
      }
      return newBoard;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: "60vh" }}>
        <div className="spinner"></div>
        <p className="pulse">Solving puzzle...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
        <h2 style={{ color: "var(--accent-red)", marginBottom: 16 }}>❌ Error</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>{error}</p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    );
  }

  const stepsList = result?.steps || [];
  const activeStep = currentStep > 0 && stepsList.length > 0 ? stepsList[currentStep - 1] : null;
  const highlightCells = activeStep ? [{ row: activeStep.row, col: activeStep.col, action: activeStep.action }] : [];
  const animatedBoard = getBoardAtStep();

  return (
    <div className="container fade-in" style={{ padding: "48px 0" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
        <div>
          <h1 className="section-title">
            {result?.solved ? "✅ Puzzle Solved!" : "❌ No Solution Found"}
          </h1>
          <p className="section-subtitle" style={{ marginBottom: 0 }}>
            {state?.puzzle_type?.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())} —{" "}
            {state?.compare ? "Algorithm Comparison" : result?.algorithm?.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Back</button>
          <button className="btn btn-success btn-sm" onClick={handleDownloadPDF} id="download-pdf">📄 PDF</button>
        </div>
      </div>

      {/* Metrics cards */}
      {result?.metrics && (
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {[
            { label: "Time", value: `${result.metrics.execution_time_ms} ms`, icon: "⏱", color: "var(--accent-blue)" },
            { label: "Iterations", value: Number(result.metrics.iterations).toLocaleString(), icon: "🔄", color: "var(--accent-green)" },
            { label: "Memory", value: `${result.metrics.memory_used_mb} MB`, icon: "💾", color: "var(--accent-purple)" },
            { label: "Pruned", value: Number(result.metrics.pruned_branches).toLocaleString(), icon: "✂️", color: "var(--accent-orange)" },
          ].map((m) => (
            <div key={m.label} className="card" style={{ textAlign: "center" }}>
              <span style={{ fontSize: "1.5rem" }}>{m.icon}</span>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: m.color, margin: "8px 0 4px" }}>{m.value}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Solution Board */}
      {result?.solution && (
        <div className="grid-2" style={{ gridTemplateColumns: !state?.compare && stepsList.length > 0 ? "1.2fr 0.8fr" : "1fr", gap: 32, marginBottom: 32 }}>
          
          {/* Left Chessboard/Grid */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                {playbackMode === "animated" ? `Visualizer Search — Step ${currentStep} / ${stepsList.length}` : "Final Solution"}
              </h2>
              {!state?.compare && stepsList.length > 0 && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className={`btn btn-sm ${playbackMode === "animated" ? "btn-primary" : "btn-secondary"}`} onClick={() => setPlaybackMode("animated")}>
                    🔄 Animated
                  </button>
                  <button className={`btn btn-sm ${playbackMode === "instant" ? "btn-primary" : "btn-secondary"}`} onClick={() => { setPlaybackMode("instant"); setIsPlaying(false); }}>
                    ✨ Instant
                  </button>
                </div>
              )}
            </div>

            {state?.puzzle_type === "sudoku" && (
              <SudokuGrid board={playbackMode === "animated" ? animatedBoard : result.solution} readOnly highlightCells={playbackMode === "animated" ? highlightCells : []} />
            )}
            {state?.puzzle_type === "nqueens" && (
              <NQueensBoard board={playbackMode === "animated" ? animatedBoard : result.solution} highlightCells={playbackMode === "animated" ? highlightCells : []} />
            )}
            {state?.puzzle_type === "knights_tour" && (
              <KnightsTourBoard board={playbackMode === "animated" ? animatedBoard : result.solution} highlightCells={playbackMode === "animated" ? highlightCells : []} />
            )}
          </div>

          {/* Right Playback Control Sidebar (only shown in single run animated mode) */}
          {!state?.compare && stepsList.length > 0 && playbackMode === "animated" && (
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20, justifyContent: "center" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 10 }}>
                🎮 Playback Controls
              </h3>

              {/* Progress Slider */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                  <span>Search Steps</span>
                  <span>{Math.round((currentStep / stepsList.length) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={stepsList.length}
                  value={currentStep}
                  onChange={(e) => { setCurrentStep(Number(e.target.value)); setIsPlaying(false); }}
                  style={{ width: "100%", accentColor: "var(--accent-blue)" }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => { setCurrentStep(0); setIsPlaying(false); }} title="Restart">
                  🔄
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setCurrentStep(p => Math.max(0, p - 1)); setIsPlaying(false); }} title="Step Backward">
                  ⏮
                </button>
                <button className="btn btn-primary" onClick={() => {
                  if (currentStep >= stepsList.length) setCurrentStep(0);
                  setIsPlaying(!isPlaying);
                }} style={{ minWidth: 100 }}>
                  {isPlaying ? "⏸ Pause" : "▶ Play"}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setCurrentStep(p => Math.min(stepsList.length, p + 1)); setIsPlaying(false); }} title="Step Forward">
                  ⏭
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setCurrentStep(stepsList.length); setIsPlaying(false); }} title="Skip to End">
                  ⏩
                </button>
              </div>

              {/* Speed Controller */}
              <div>
                <label className="label">Speed (Delay: {speed}ms)</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    { label: "Slow", val: 300 },
                    { label: "Normal", val: 100 },
                    { label: "Fast", val: 30 },
                    { label: "Turbo", val: 5 }
                  ].map(s => (
                    <button
                      key={s.label}
                      className={`btn btn-sm ${speed === s.val ? "btn-primary" : "btn-secondary"}`}
                      onClick={() => setSpeed(s.val)}
                      style={{ flex: 1, padding: "6px 0", fontSize: "0.75rem" }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conflict/Placement Status Indicator */}
              {activeStep && (
                <div style={{
                  padding: 12,
                  borderRadius: 8,
                  background: activeStep.action === "remove" ? "rgba(239, 68, 68, 0.12)" : "rgba(16, 185, 129, 0.12)",
                  border: `1px solid ${activeStep.action === "remove" ? "var(--accent-red)" : "var(--accent-green)"}`,
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}>
                  <span style={{ fontSize: "1.2rem" }}>
                    {activeStep.action === "remove" ? "🚨" : "✔️"}
                  </span>
                  <div>
                    <strong style={{ color: activeStep.action === "remove" ? "var(--accent-red)" : "var(--accent-green)" }}>
                      {activeStep.action === "remove" ? "Backtracking (Remove)" : "Placing Candidate"}
                    </strong>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                      Row {activeStep.row}, Col {activeStep.col}
                      {activeStep.value !== undefined && ` → Val: ${activeStep.value}`}
                      {activeStep.move !== undefined && ` → Move: ${activeStep.move}`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Comparison */}
      {comparison && (
        <>
          <AlgorithmComparison comparison={comparison} />
          <PerformanceChart comparison={comparison} />
        </>
      )}
    </div>
  );
}

