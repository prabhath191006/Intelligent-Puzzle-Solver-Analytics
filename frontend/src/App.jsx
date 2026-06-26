import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import PuzzleSelect from "./pages/PuzzleSelect.jsx";
import PuzzleInput from "./pages/PuzzleInput.jsx";
import PuzzleVisualization from "./pages/PuzzleVisualization.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Reports from "./pages/Reports.jsx";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/select" element={<PuzzleSelect />} />
          <Route path="/input/:puzzleType" element={<PuzzleInput />} />
          <Route path="/solve" element={<PuzzleVisualization />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">
          <p>© 2026 Intelligent Puzzle Solver — Capstone Project | Backtracking & Brute Force Algorithms</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
