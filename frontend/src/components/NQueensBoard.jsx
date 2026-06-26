/**
 * N-Queens Board component – renders queens on an NxN chessboard.
 */
export default function NQueensBoard({ board, highlightCells = [], size = 8 }) {
  const n = board ? board.length : size;

  return (
    <div className="queens-container">
      <div className="queens-board" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {Array.from({ length: n }, (_, r) =>
          Array.from({ length: n }, (_, c) => {
            const hasQueen = board && board[r][c] === 1;
            const isDark = (r + c) % 2 === 1;
            const isHighlight = highlightCells.some((h) => h.row === r && h.col === c);

            return (
              <div
                key={`${r}-${c}`}
                className={`queen-cell ${isDark ? "dark" : "light"} ${isHighlight ? "highlight" : ""}`}
                id={`queen-${r}-${c}`}
              >
                {hasQueen && <span className="queen-piece">♛</span>}
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .queens-container {
          display: flex;
          justify-content: center;
          padding: 20px;
        }
        .queens-board {
          display: grid;
          border: 3px solid var(--accent-purple);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: var(--shadow-glow-purple);
          max-width: 480px;
          width: 100%;
        }
        .queen-cell {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 36px;
          min-height: 36px;
          transition: all var(--transition-fast);
        }
        .queen-cell.dark {
          background: #2d1b69;
        }
        .queen-cell.light {
          background: #3d2b7a;
        }
        .queen-cell.highlight {
          background: rgba(139, 92, 246, 0.4) !important;
          animation: cellPop 0.3s ease-out;
        }
        .queen-piece {
          font-size: clamp(1.2rem, 3vw, 2.2rem);
          color: #fbbf24;
          text-shadow: 0 0 12px rgba(251, 191, 36, 0.6);
          animation: queenAppear 0.3s ease-out;
        }
        @keyframes queenAppear {
          from { transform: scale(0) rotate(-180deg); opacity: 0; }
          to { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes cellPop {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
