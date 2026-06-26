import { Link } from "react-router-dom";

const puzzles = [
  {
    id: "sudoku", name: "Sudoku", icon: "🔢", color: "#3b82f6",
    desc: "Fill a 9×9 grid so each row, column, and 3×3 box has digits 1–9.",
    size: "9×9", complexity: "O(9^m) backtracking"
  },
  {
    id: "nqueens", name: "N-Queens", icon: "♛", color: "#8b5cf6",
    desc: "Place N queens on N×N board with no shared row, column, or diagonal.",
    size: "4–12", complexity: "O(N!) brute force"
  },
  {
    id: "knights_tour", name: "Knight's Tour", icon: "♞", color: "#14b8a6",
    desc: "Move a knight to visit every square on N×N board exactly once.",
    size: "5–8", complexity: "O(8^N²) brute force"
  },
];

export default function PuzzleSelect() {
  return (
    <div className="container fade-in" style={{ padding: "48px 0" }}>
      <h1 className="section-title">Select a Puzzle</h1>
      <p className="section-subtitle">Each puzzle supports Backtracking and Brute Force algorithms.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {puzzles.map((p) => (
          <Link to={`/input/${p.id}`} key={p.id} id={`select-${p.id}`} style={{
            display: "block", padding: 32, background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
            borderLeft: `4px solid ${p.color}`, borderRadius: "var(--radius-lg)", textDecoration: "none",
            color: "var(--text-primary)", transition: "all 0.25s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
              <span style={{ fontSize: "3rem" }}>{p.icon}</span>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{p.name}</h2>
                <span className="badge badge-blue">Board: {p.size}</span>
              </div>
            </div>
            <p style={{ color: "var(--text-secondary)", marginBottom: 12 }}>{p.desc}</p>
            <code style={{ fontSize: "0.8rem", color: "var(--accent-orange)", background: "rgba(245,158,11,0.1)", padding: "4px 10px", borderRadius: 4 }}>{p.complexity}</code>
            <div style={{ textAlign: "right", marginTop: 16 }}>
              <span className="btn btn-primary btn-sm">Solve →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
