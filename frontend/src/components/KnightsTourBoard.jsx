/**
 * Knight's Tour Board component – renders a chessboard with the knight's path and active knight piece.
 */
export default function KnightsTourBoard({ board, highlightCells = [], size = 5 }) {
  const n = board ? board.length : size;

  // Find current active knight position (the cell with the maximum value in the board)
  let activeKnight = null;
  let maxMoveNum = -1;

  if (board) {
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (board[r][c] > maxMoveNum) {
          maxMoveNum = board[r][c];
          activeKnight = { row: r, col: c };
        }
      }
    }
  }

  return (
    <div className="kt-container">
      <div className="kt-board" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {Array.from({ length: n }, (_, r) =>
          Array.from({ length: n }, (_, c) => {
            const moveNum = board ? board[r][c] : -1;
            const isVisited = moveNum !== -1;
            const isDark = (r + c) % 2 === 1;
            const isActive = activeKnight && activeKnight.row === r && activeKnight.col === c;
            
            // Check if cell is highlighted as placing or backtracking
            const hl = highlightCells.find((h) => h.row === r && h.col === c);
            const isHighlight = !!hl;
            const isRemove = hl && hl.action === "remove";

            return (
              <div
                key={`${r}-${c}`}
                className={`kt-cell 
                  ${isDark ? "dark" : "light"} 
                  ${isVisited ? "visited" : ""} 
                  ${isActive ? "active" : ""} 
                  ${isHighlight ? (isRemove ? "highlight-remove" : "highlight-place") : ""}
                `}
                id={`kt-${r}-${c}`}
              >
                {isActive ? (
                  <span className="knight-piece">♞</span>
                ) : isVisited ? (
                  <span className="move-number">{moveNum}</span>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .kt-container {
          display: flex;
          justify-content: center;
          padding: 20px;
        }
        .kt-board {
          display: grid;
          border: 3px solid var(--accent-teal);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 0 30px rgba(20, 184, 166, 0.25);
          max-width: 480px;
          width: 100%;
        }
        .kt-cell {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          min-height: 36px;
          position: relative;
          transition: all var(--transition-fast);
        }
        .kt-cell.dark {
          background: #112a32;
        }
        .kt-cell.light {
          background: #1e3f4a;
        }
        .kt-cell.visited {
          background: rgba(20, 184, 166, 0.2);
          border: 1px solid rgba(20, 184, 166, 0.3);
        }
        .kt-cell.active {
          background: rgba(20, 184, 166, 0.45) !important;
          box-shadow: inset 0 0 10px rgba(20, 184, 166, 0.8);
        }
        .kt-cell.highlight-place {
          background: rgba(245, 158, 11, 0.4) !important;
          animation: cellPop 0.2s ease-out;
        }
        .kt-cell.highlight-remove {
          background: rgba(239, 68, 68, 0.45) !important;
          animation: cellPop 0.2s ease-out;
        }
        .move-number {
          font-size: clamp(0.7rem, 2vw, 1.1rem);
          font-weight: 800;
          color: var(--accent-teal);
          text-shadow: 0 0 6px rgba(20, 184, 166, 0.5);
        }
        .knight-piece {
          font-size: clamp(1.2rem, 3vw, 2.2rem);
          color: #f59e0b;
          text-shadow: 0 0 12px rgba(245, 158, 11, 0.8);
          animation: knightJump 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 10;
        }
        @keyframes knightJump {
          0% { transform: scale(0.5) translateY(-15px); opacity: 0; }
          10% { transform: scale(0.5) translateY(-15px); opacity: 0.5; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes cellPop {
          0% { transform: scale(0.85); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
