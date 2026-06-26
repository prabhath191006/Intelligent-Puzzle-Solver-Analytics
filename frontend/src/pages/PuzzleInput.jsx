import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import SudokuGrid from "../components/SudokuGrid";
import PracticeMode from "../components/PracticeMode";
import { getPuzzlePresets } from "../services/api";

const createEmptyBoard = () => Array.from({ length: 9 }, () => Array(9).fill(0));

export default function PuzzleInput() {
  const { puzzleType } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(createEmptyBoard);
  const [n, setN] = useState(puzzleType === "nqueens" ? 8 : 5);
  const [startRow, setStartRow] = useState(0);
  const [startCol, setStartCol] = useState(0);
  const [algorithm, setAlgorithm] = useState("backtracking");
  const [compareMode, setCompareMode] = useState(false);
  const [isPractice, setIsPractice] = useState(false);

  const loadPreset = async (difficulty) => {
    try {
      const res = await getPuzzlePresets(puzzleType);
      const preset = res.data.presets?.find((p) => p.difficulty === difficulty);
      if (preset) setBoard(preset.initial_state);
    } catch { /* ignore */ }
  };

  const handleSolve = () => {
    let payload = { puzzle_type: puzzleType, algorithm, compare: compareMode };
    if (puzzleType === "sudoku") payload.board = board;
    else if (puzzleType === "nqueens") payload.n = n;
    else { payload.n = n; payload.start_row = startRow; payload.start_col = startCol; }
    navigate("/solve", { state: payload });
  };

  if (isPractice) {
    return (
      <div className="container" style={{ padding: "48px 0" }}>
        <PracticeMode puzzleType={puzzleType} n={puzzleType === "sudoku" ? 9 : n} onClose={() => setIsPractice(false)} />
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ padding: "48px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 className="section-title" style={{ marginBottom: 0 }}>
          {puzzleType === "sudoku" ? "🔢 Sudoku" : puzzleType === "nqueens" ? "♛ N-Queens" : "♞ Knight's Tour"}
        </h1>
        <button className="btn btn-secondary" onClick={() => setIsPractice(true)} id="btn-practice-mode" style={{ borderColor: "var(--accent-purple)", color: "var(--accent-purple)" }}>
          🎮 Interactive Practice Mode
        </button>
      </div>
      <p className="section-subtitle">Configure your puzzle and choose an algorithm.</p>

      <div style={{ display: "grid", gridTemplateColumns: puzzleType === "sudoku" ? "1fr 320px" : "1fr", gap: 32 }}>
        {/* Main input area */}
        <div className="card">
          {puzzleType === "sudoku" && (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {["easy", "medium", "hard"].map((d) => (
                  <button key={d} className="btn btn-secondary btn-sm" onClick={() => loadPreset(d)} id={`preset-${d}`}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
                <button className="btn btn-danger btn-sm" onClick={() => setBoard(createEmptyBoard())} id="clear-board">
                  Clear
                </button>
              </div>
              <SudokuGrid board={board} onBoardChange={setBoard} />
            </>
          )}

          {puzzleType === "nqueens" && (
            <div style={{ padding: 24 }}>
              <label className="label">Board Size (N)</label>
              <input type="range" min="4" max="12" value={n} onChange={(e) => setN(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent-purple)" }} id="nqueens-slider" />
              <div style={{ textAlign: "center", fontSize: "3rem", fontWeight: 900, color: "var(--accent-purple)", margin: "20px 0" }}>
                {n} × {n}
              </div>
              <p style={{ color: "var(--text-secondary)", textAlign: "center" }}>
                Place {n} queens on a {n}×{n} board
              </p>
            </div>
          )}

          {puzzleType === "knights_tour" && (
            <div style={{ padding: 24 }}>
              <label className="label">Board Size (N)</label>
              <select className="select" value={n} onChange={(e) => setN(Number(e.target.value))} id="kt-size">
                {[5, 6, 8].map((s) => <option key={s} value={s}>{s}×{s}</option>)}
              </select>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                <div>
                  <label className="label">Start Row</label>
                  <input className="input" type="number" min="0" max={n - 1} value={startRow}
                    onChange={(e) => setStartRow(Number(e.target.value))} id="kt-row" />
                </div>
                <div>
                  <label className="label">Start Column</label>
                  <input className="input" type="number" min="0" max={n - 1} value={startCol}
                    onChange={(e) => setStartCol(Number(e.target.value))} id="kt-col" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls sidebar (for sudoku) or below */}
        {puzzleType === "sudoku" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <label className="label">Algorithm</label>
              <select className="select" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} id="algo-select">
                <option value="backtracking">Backtracking</option>
                <option value="brute_force">Brute Force</option>
              </select>
            </div>
            <div className="card">
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={compareMode} onChange={(e) => setCompareMode(e.target.checked)} id="compare-toggle" />
                <span style={{ fontWeight: 600 }}>Compare Both Algorithms</span>
              </label>
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleSolve} id="solve-btn">
              🚀 Solve Puzzle
            </button>
          </div>
        )}
      </div>

      {/* Controls for non-sudoku */}
      {puzzleType !== "sudoku" && (
        <div style={{ display: "flex", gap: 16, marginTop: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="label">Algorithm</label>
            <select className="select" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} id="algo-select">
              <option value="backtracking">Backtracking</option>
              <option value="brute_force">Brute Force</option>
            </select>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", paddingBottom: 12 }}>
            <input type="checkbox" checked={compareMode} onChange={(e) => setCompareMode(e.target.checked)} />
            <span style={{ fontWeight: 600 }}>Compare Both</span>
          </label>
          <button className="btn btn-primary btn-lg" onClick={handleSolve} id="solve-btn">🚀 Solve</button>
        </div>
      )}
    </div>
  );
}

