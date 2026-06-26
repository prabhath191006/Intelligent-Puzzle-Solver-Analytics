import { useState, useEffect, useCallback } from "react";

export default function PracticeMode({ puzzleType, n = 8, onClose }) {
  // Sudoku Board (9x9)
  const [sudokuGrid, setSudokuGrid] = useState(() => Array.from({ length: 9 }, () => Array(9).fill(0)));
  const [selectedCell, setSelectedCell] = useState(null);
  const [sudokuConflicts, setSudokuConflicts] = useState([]);

  // N-Queens Queens list
  const [queens, setQueens] = useState([]); // Array of {r, c}
  const [queensConflicts, setQueensConflicts] = useState(new Set());

  // Knight's Tour path
  const [ktPath, setKtPath] = useState([]); // Array of {r, c}
  
  // Game state
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // ────────────────────────────────────────────────────────
  //  SUDOKU LOGIC
  // ────────────────────────────────────────────────────────
  
  const checkSudokuConflicts = (grid) => {
    const conflicts = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = grid[r][c];
        if (val === 0) continue;

        // Check row
        for (let col = 0; col < 9; col++) {
          if (col !== c && grid[r][col] === val) {
            conflicts.push({ r, c });
          }
        }
        // Check column
        for (let row = 0; row < 9; row++) {
          if (row !== r && grid[row][c] === val) {
            conflicts.push({ r, c });
          }
        }
        // Check 3x3 box
        const boxR = 3 * Math.floor(r / 3);
        const boxC = 3 * Math.floor(c / 3);
        for (let row = boxR; row < boxR + 3; row++) {
          for (let col = boxC; col < boxC + 3; col++) {
            if ((row !== r || col !== c) && grid[row][col] === val) {
              conflicts.push({ r, c });
            }
          }
        }
      }
    }
    setSudokuConflicts(conflicts);

    // Check if fully solved
    let isFull = true;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) isFull = false;
      }
    }
    if (isFull && conflicts.length === 0) {
      setGameWon(true);
    }
  };

  const handleSudokuCellClick = (r, c) => {
    setSelectedCell({ r, c });
  };

  const handleSudokuKeyDown = useCallback((e) => {
    if (!selectedCell) return;
    const num = parseInt(e.key);
    const { r, c } = selectedCell;

    if (num >= 1 && num <= 9) {
      const nextGrid = sudokuGrid.map(row => [...row]);
      nextGrid[r][c] = num;
      setSudokuGrid(nextGrid);
      checkSudokuConflicts(nextGrid);
    } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
      const nextGrid = sudokuGrid.map(row => [...row]);
      nextGrid[r][c] = 0;
      setSudokuGrid(nextGrid);
      checkSudokuConflicts(nextGrid);
    } else if (e.key === "ArrowRight" && c < 8) setSelectedCell({ r, c: c + 1 });
    else if (e.key === "ArrowLeft" && c > 0) setSelectedCell({ r, c: c - 1 });
    else if (e.key === "ArrowDown" && r < 8) setSelectedCell({ r: r + 1, c });
    else if (e.key === "ArrowUp" && r > 0) setSelectedCell({ r: r - 1, c });
  }, [selectedCell, sudokuGrid]);

  useEffect(() => {
    if (puzzleType === "sudoku") {
      window.addEventListener("keydown", handleSudokuKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleSudokuKeyDown);
    };
  }, [puzzleType, handleSudokuKeyDown]);

  const isSudokuConflict = (r, c) => {
    return sudokuConflicts.some(cell => cell.r === r && cell.c === c);
  };

  // ────────────────────────────────────────────────────────
  //  N-QUEENS LOGIC
  // ────────────────────────────────────────────────────────

  const checkNQueensConflicts = (currentQueens) => {
    const conflicts = new Set();
    for (let i = 0; i < currentQueens.length; i++) {
      for (let j = i + 1; j < currentQueens.length; j++) {
        const q1 = currentQueens[i];
        const q2 = currentQueens[j];
        
        // Horizontal, vertical, or diagonal conflicts
        if (
          q1.r === q2.r ||
          q1.c === q2.c ||
          Math.abs(q1.r - q2.r) === Math.abs(q1.c - q2.c)
        ) {
          conflicts.add(`${q1.r}-${q1.c}`);
          conflicts.add(`${q2.r}-${q2.c}`);
        }
      }
    }
    setQueensConflicts(conflicts);

    // If placed N queens and no conflicts, we won!
    if (currentQueens.length === n && conflicts.size === 0) {
      setGameWon(true);
    } else {
      setGameWon(false);
    }
  };

  const handleNQueensCellClick = (r, c) => {
    const exists = queens.find(q => q.r === r && q.c === c);
    let nextQueens;
    if (exists) {
      nextQueens = queens.filter(q => !(q.r === r && q.c === c));
    } else {
      if (queens.length >= n) return; // Can't place more than N
      nextQueens = [...queens, { r, c }];
    }
    setQueens(nextQueens);
    checkNQueensConflicts(nextQueens);
  };

  // ────────────────────────────────────────────────────────
  //  KNIGHT'S TOUR LOGIC
  // ────────────────────────────────────────────────────────

  const getValidKnightMoves = useCallback((row, col, path) => {
    const moves = [
      [2, 1], [1, 2], [-1, 2], [-2, 1],
      [-2, -1], [-1, -2], [1, -2], [2, -1]
    ];
    const valid = [];
    for (const [dr, dc] of moves) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
        // Must not be already visited
        const visited = path.some(p => p.r === nr && p.c === nc);
        if (!visited) {
          valid.push({ r: nr, c: nc });
        }
      }
    }
    return valid;
  }, [n]);

  const handleKnightCellClick = (r, c) => {
    if (ktPath.length === 0) {
      // First move
      const nextPath = [{ r, c }];
      setKtPath(nextPath);
      
      // Check if stuck immediately (impossible on ordinary boards, but good practice)
      const nextMoves = getValidKnightMoves(r, c, nextPath);
      if (nextMoves.length === 0 && n * n > 1) {
        setGameOver(true);
      }
    } else {
      // Must be a valid knight move from current position
      const current = ktPath[ktPath.length - 1];
      const validMoves = getValidKnightMoves(current.r, current.c, ktPath);
      const isValid = validMoves.some(m => m.r === r && m.c === c);

      if (isValid) {
        const nextPath = [...ktPath, { r, c }];
        setKtPath(nextPath);

        // Check victory
        if (nextPath.length === n * n) {
          setGameWon(true);
        } else {
          // Check if stuck
          const nextMoves = getValidKnightMoves(r, c, nextPath);
          if (nextMoves.length === 0) {
            setGameOver(true);
          }
        }
      }
    }
  };

  const undoKnightMove = () => {
    if (ktPath.length > 0) {
      setKtPath(ktPath.slice(0, -1));
      setGameOver(false);
      setGameWon(false);
    }
  };

  const restartGame = () => {
    setSudokuGrid(Array.from({ length: 9 }, () => Array(9).fill(0)));
    setSudokuConflicts([]);
    setSelectedCell(null);
    setQueens([]);
    setQueensConflicts(new Set());
    setKtPath([]);
    setGameWon(false);
    setGameOver(false);
  };

  // Helper variables for rendering Knight's Tour
  const currentKnight = ktPath.length > 0 ? ktPath[ktPath.length - 1] : null;
  const validKnightMoves = currentKnight ? getValidKnightMoves(currentKnight.r, currentKnight.c, ktPath) : [];

  return (
    <div className="practice-container fade-in">
      <div className="practice-header">
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>
            🎮 Practice Mode: {puzzleType === "sudoku" ? "Sudoku" : puzzleType === "nqueens" ? `${n}-Queens` : `Knight's Tour (${n}x${n})`}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "4px 0 0" }}>
            {puzzleType === "sudoku" && "Click a cell and use your keyboard (1-9) to solve the grid. Conflicts glow red."}
            {puzzleType === "nqueens" && `Click cells to place queens. Place ${n} queens without threatening each other.`}
            {puzzleType === "knights_tour" && "Click any square to start. Then follow valid L-shaped highlights to visit every cell."}
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>
          Exit Practice
        </button>
      </div>

      <div className="practice-layout">
        
        {/* Game board */}
        <div className="practice-board-card card">
          
          {/* Victory Modal */}
          {gameWon && (
            <div className="victory-overlay">
              <div className="victory-modal">
                <span style={{ fontSize: "3.5rem" }}>🏆</span>
                <h3 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent-green)" }}>Puzzle Solved!</h3>
                <p style={{ color: "var(--text-secondary)", margin: "12px 0 20px" }}>
                  Outstanding! You've manually solved the {puzzleType.replace("_", " ")} puzzle correctly.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button className="btn btn-primary" onClick={restartGame}>Play Again</button>
                  <button className="btn btn-secondary" onClick={onClose}>Exit</button>
                </div>
              </div>
            </div>
          )}

          {/* Game Over Modal (for Knight's Tour) */}
          {gameOver && (
            <div className="victory-overlay">
              <div className="victory-modal">
                <span style={{ fontSize: "3.5rem" }}>💀</span>
                <h3 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--accent-red)" }}>No Moves Left!</h3>
                <p style={{ color: "var(--text-secondary)", margin: "12px 0 20px" }}>
                  You got stuck after visiting <strong>{ktPath.length}</strong> squares. Try backtracking or restart!
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button className="btn btn-primary" onClick={undoKnightMove}>⏪ Undo Move</button>
                  <button className="btn btn-danger" onClick={restartGame}>🔄 Restart</button>
                </div>
              </div>
            </div>
          )}

          {/* Render Sudoku Practice Board */}
          {puzzleType === "sudoku" && (
            <div className="practice-sudoku-grid">
              {sudokuGrid.map((row, r) =>
                row.map((cell, c) => {
                  const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                  const hasConflict = isSudokuConflict(r, c);
                  const isBoxRight = (c + 1) % 3 === 0 && c < 8;
                  const isBoxBottom = (r + 1) % 3 === 0 && r < 8;

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`practice-sudoku-cell 
                        ${isSelected ? "selected" : ""} 
                        ${hasConflict ? "conflict" : ""} 
                        ${isBoxRight ? "box-right" : ""} 
                        ${isBoxBottom ? "box-bottom" : ""}
                      `}
                      onClick={() => handleSudokuCellClick(r, c)}
                    >
                      {cell !== 0 ? cell : ""}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Render N-Queens Practice Board */}
          {puzzleType === "nqueens" && (
            <div className="practice-chess-board" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
              {Array.from({ length: n }, (_, r) =>
                Array.from({ length: n }, (_, c) => {
                  const hasQueen = queens.some(q => q.r === r && q.c === c);
                  const isDark = (r + c) % 2 === 1;
                  const hasConflict = queensConflicts.has(`${r}-${c}`);

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`practice-chess-cell ${isDark ? "dark" : "light"} ${hasConflict ? "conflict" : ""}`}
                      onClick={() => handleNQueensCellClick(r, c)}
                      style={{ cursor: "pointer", transition: "all 0.2s" }}
                    >
                      {hasQueen && <span className="practice-queen-piece">♛</span>}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Render Knight's Tour Practice Board */}
          {puzzleType === "knights_tour" && (
            <div className="practice-chess-board" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
              {Array.from({ length: n }, (_, r) =>
                Array.from({ length: n }, (_, c) => {
                  const isDark = (r + c) % 2 === 1;
                  
                  // Check if visited and find its step number
                  const stepIndex = ktPath.findIndex(p => p.r === r && p.c === c);
                  const isVisited = stepIndex !== -1;
                  
                  // Active knight position
                  const isActive = currentKnight && currentKnight.r === r && currentKnight.c === c;
                  
                  // Is it a valid next move?
                  const isValidNext = validKnightMoves.some(m => m.r === r && m.c === c);

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`practice-chess-cell 
                        ${isDark ? "dark" : "light"} 
                        ${isVisited ? "visited" : ""} 
                        ${isActive ? "active" : ""} 
                        ${isValidNext ? "valid-next" : ""}
                      `}
                      onClick={() => handleKnightCellClick(r, c)}
                      style={{ cursor: ktPath.length === 0 || isValidNext ? "pointer" : "default" }}
                    >
                      {isActive ? (
                        <span className="practice-knight-piece">♞</span>
                      ) : isVisited ? (
                        <span className="practice-move-number">{stepIndex + 1}</span>
                      ) : isValidNext && ktPath.length > 0 ? (
                        <span className="practice-dot"></span>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>

        {/* Side Game Stats & Actions */}
        <div className="practice-stats-card card">
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>📈 Performance & Rules</h3>
          
          {puzzleType === "sudoku" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="stat-row">
                <span className="stat-label">Empty Cells</span>
                <span className="stat-value">{sudokuGrid.flat().filter(x => x === 0).length} / 81</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Errors / Conflicts</span>
                <span className="stat-value" style={{ color: sudokuConflicts.length > 0 ? "var(--accent-red)" : "var(--accent-green)" }}>
                  {sudokuConflicts.length}
                </span>
              </div>
              <div className="practice-rules-box">
                <h4>Rules:</h4>
                <ul>
                  <li>Each row must contain digits 1–9 with no repeats.</li>
                  <li>Each column must contain digits 1–9 with no repeats.</li>
                  <li>Each 3x3 square must contain digits 1–9 with no repeats.</li>
                </ul>
              </div>
            </div>
          )}

          {puzzleType === "nqueens" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="stat-row">
                <span className="stat-label">Queens Placed</span>
                <span className="stat-value">{queens.length} / {n}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Attacking Conflicts</span>
                <span className="stat-value" style={{ color: queensConflicts.size > 0 ? "var(--accent-red)" : "var(--accent-green)" }}>
                  {queensConflicts.size}
                </span>
              </div>
              <div className="practice-rules-box">
                <h4>Rules:</h4>
                <ul>
                  <li>No two queens can share the same row.</li>
                  <li>No two queens can share the same column.</li>
                  <li>No two queens can share the same diagonal.</li>
                </ul>
              </div>
            </div>
          )}

          {puzzleType === "knights_tour" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="stat-row">
                <span className="stat-label">Squares Visited</span>
                <span className="stat-value">{ktPath.length} / {n * n}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Remaining Squares</span>
                <span className="stat-value">{n * n - ktPath.length}</span>
              </div>
              
              {ktPath.length > 0 && (
                <button className="btn btn-secondary btn-sm" onClick={undoKnightMove} style={{ marginTop: 8 }}>
                  ⏪ Undo Move
                </button>
              )}

              <div className="practice-rules-box">
                <h4>Rules:</h4>
                <ul>
                  <li>The Knight moves in an "L" shape (2 steps in one direction, 1 step orthogonal).</li>
                  <li>You must visit every square on the board exactly once.</li>
                  <li>You cannot visit a square that has already been visited.</li>
                </ul>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button className="btn btn-danger" onClick={restartGame} style={{ flex: 1 }}>
              🔄 Reset Board
            </button>
          </div>
        </div>

      </div>

      <style>{`
        .practice-container {
          padding: 24px 0;
        }
        .practice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .practice-layout {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 32px;
        }
        @media (max-width: 820px) {
          .practice-layout {
            grid-template-columns: 1fr;
          }
        }
        
        /* Boards styling */
        .practice-board-card {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          min-height: 400px;
          overflow: hidden;
        }
        
        /* ── Sudoku Practice Board ── */
        .practice-sudoku-grid {
          display: grid;
          grid-template-columns: repeat(9, 44px);
          grid-template-rows: repeat(9, 44px);
          border: 3px solid var(--accent-blue);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: var(--shadow-glow-blue);
        }
        .practice-sudoku-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-primary);
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          cursor: pointer;
          transition: all var(--transition-fast);
          user-select: none;
          outline: none;
        }
        .practice-sudoku-cell:hover {
          background: rgba(59, 130, 246, 0.12);
        }
        .practice-sudoku-cell.selected {
          background: rgba(59, 130, 246, 0.25);
          box-shadow: inset 0 0 0 2px var(--accent-blue);
        }
        .practice-sudoku-cell.conflict {
          background: rgba(239, 68, 68, 0.25) !important;
          color: var(--accent-red) !important;
          animation: shake 0.2s ease-in-out;
        }
        .practice-sudoku-cell.box-right {
          border-right: 3px solid var(--accent-blue);
        }
        .practice-sudoku-cell.box-bottom {
          border-bottom: 3px solid var(--accent-blue);
        }
        
        /* ── N-Queens & Knight's Tour Chess Board ── */
        .practice-chess-board {
          display: grid;
          border: 3px solid var(--accent-purple);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: var(--shadow-glow-purple);
          max-width: 420px;
          width: 100%;
        }
        .practice-chess-cell {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          min-height: 32px;
          transition: all 0.2s;
          position: relative;
        }
        .practice-chess-cell.dark { background: #2d1b69; }
        .practice-chess-cell.light { background: #3d2b7a; }
        .practice-chess-cell:hover {
          filter: brightness(1.2);
        }
        .practice-chess-cell.conflict {
          background: rgba(239, 68, 68, 0.5) !important;
          animation: shake 0.25s ease-in-out;
        }
        .practice-chess-cell.visited {
          background: rgba(20, 184, 166, 0.3) !important;
        }
        .practice-chess-cell.active {
          background: rgba(245, 158, 11, 0.35) !important;
          box-shadow: inset 0 0 8px rgba(245, 158, 11, 0.8);
        }
        .practice-chess-cell.valid-next {
          background: rgba(20, 184, 166, 0.15) !important;
          box-shadow: inset 0 0 6px rgba(20, 184, 166, 0.5);
        }
        
        /* Game Pieces */
        .practice-queen-piece {
          font-size: clamp(1.2rem, 3vw, 2.2rem);
          color: #fbbf24;
          text-shadow: 0 0 10px rgba(251, 191, 36, 0.7);
          animation: scalePop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .practice-knight-piece {
          font-size: clamp(1.2rem, 3vw, 2.2rem);
          color: #f59e0b;
          text-shadow: 0 0 10px rgba(245, 158, 11, 0.7);
          animation: scalePop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 5;
        }
        .practice-move-number {
          font-size: clamp(0.7rem, 2vw, 1.1rem);
          font-weight: 800;
          color: var(--accent-teal);
        }
        .practice-dot {
          width: 8px;
          height: 8px;
          background: var(--accent-teal);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--accent-teal);
          animation: pulse 1.2s infinite;
        }
        
        /* Stats details */
        .stat-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid var(--border-subtle);
        }
        .stat-label {
          color: var(--text-secondary);
          font-size: 0.85rem;
        }
        .stat-value {
          font-weight: 700;
          font-size: 0.95rem;
        }
        .practice-rules-box {
          margin-top: 16px;
          padding: 16px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }
        .practice-rules-box h4 {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .practice-rules-box ul {
          padding-left: 16px;
          font-size: 0.8rem;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        /* Victory overlay modal */
        .victory-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(10, 14, 26, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .victory-modal {
          background: var(--bg-card);
          border: 1px solid var(--border-accent);
          border-radius: var(--radius-lg);
          padding: 32px;
          max-width: 360px;
          width: 90%;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0,0,0,0.6), var(--shadow-glow-blue);
          animation: scalePop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        /* Animations */
        @keyframes scalePop {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
