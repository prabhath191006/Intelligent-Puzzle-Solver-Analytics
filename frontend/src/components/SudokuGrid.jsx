import { useState, useCallback } from "react";

/**
 * Interactive 9x9 Sudoku grid with keyboard navigation and input validation.
 */
export default function SudokuGrid({ board, onBoardChange, readOnly = false, highlightCells = [] }) {
  const [selected, setSelected] = useState(null);

  const handleCellClick = useCallback((row, col) => {
    if (!readOnly) setSelected({ row, col });
  }, [readOnly]);

  const handleKeyDown = useCallback((e, row, col) => {
    if (readOnly) return;
    const num = parseInt(e.key);
    if (num >= 0 && num <= 9) {
      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = num;
      onBoardChange(newBoard);
    } else if (e.key === "Backspace" || e.key === "Delete") {
      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = 0;
      onBoardChange(newBoard);
    } else if (e.key === "ArrowRight" && col < 8) setSelected({ row, col: col + 1 });
    else if (e.key === "ArrowLeft" && col > 0) setSelected({ row, col: col - 1 });
    else if (e.key === "ArrowDown" && row < 8) setSelected({ row: row + 1, col });
    else if (e.key === "ArrowUp" && row > 0) setSelected({ row: row - 1, col });
  }, [board, onBoardChange, readOnly]);

  const isHighlighted = (row, col) =>
    highlightCells.some((c) => c.row === row && c.col === col);

  return (
    <div className="sudoku-container">
      <div className="sudoku-grid" role="grid" aria-label="Sudoku Grid">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isSelected = selected?.row === r && selected?.col === c;
            const isPreset = cell !== 0 && readOnly;
            const boxBorderRight = (c + 1) % 3 === 0 && c < 8;
            const boxBorderBottom = (r + 1) % 3 === 0 && r < 8;

            return (
              <div
                key={`${r}-${c}`}
                className={`sudoku-cell
                  ${isSelected ? "selected" : ""}
                  ${isHighlighted(r, c) ? "highlighted" : ""}
                  ${isPreset ? "preset" : ""}
                  ${boxBorderRight ? "box-right" : ""}
                  ${boxBorderBottom ? "box-bottom" : ""}
                `}
                onClick={() => handleCellClick(r, c)}
                onKeyDown={(e) => handleKeyDown(e, r, c)}
                tabIndex={readOnly ? -1 : 0}
                role="gridcell"
                aria-label={`Row ${r + 1} Column ${c + 1} value ${cell || "empty"}`}
                id={`cell-${r}-${c}`}
              >
                {cell !== 0 ? cell : ""}
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .sudoku-container {
          display: flex;
          justify-content: center;
          padding: 20px;
        }
        .sudoku-grid {
          display: grid;
          grid-template-columns: repeat(9, 52px);
          grid-template-rows: repeat(9, 52px);
          border: 3px solid var(--accent-blue);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: var(--shadow-glow-blue);
        }
        .sudoku-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-primary);
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          cursor: pointer;
          outline: none;
          transition: all var(--transition-fast);
          user-select: none;
        }
        .sudoku-cell:hover:not(.preset) {
          background: rgba(59, 130, 246, 0.1);
        }
        .sudoku-cell.selected {
          background: rgba(59, 130, 246, 0.25);
          box-shadow: inset 0 0 0 2px var(--accent-blue);
        }
        .sudoku-cell.highlighted {
          background: rgba(16, 185, 129, 0.2);
          color: var(--accent-green);
          animation: cellPop 0.3s ease-out;
        }
        .sudoku-cell.preset {
          color: var(--accent-cyan);
          font-weight: 800;
          background: rgba(6, 182, 212, 0.08);
        }
        .sudoku-cell.box-right {
          border-right: 3px solid var(--accent-blue);
        }
        .sudoku-cell.box-bottom {
          border-bottom: 3px solid var(--accent-blue);
        }
        @keyframes cellPop {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @media (max-width: 520px) {
          .sudoku-grid {
            grid-template-columns: repeat(9, 38px);
            grid-template-rows: repeat(9, 38px);
          }
          .sudoku-cell { font-size: 1rem; }
        }
      `}</style>
    </div>
  );
}
