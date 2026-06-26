/**
 * API Service
 * Centralized API communication layer for the Intelligent Puzzle Solver.
 */
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 2 min for complex solves
  headers: { "Content-Type": "application/json" },
});

// ── Health ──
export const checkHealth = () => api.get("/health");

// ── Puzzles ──
export const getPuzzleTypes = () => api.get("/puzzles/types");
export const getPuzzlePresets = (type) => api.get(`/puzzles/presets/${type}`);
export const savePuzzle = (data) => api.post("/puzzles/save", data);
export const getPuzzleHistory = (limit = 20) => api.get(`/puzzles/history?limit=${limit}`);

// ── Solver ──
export const solvePuzzle = (data) => api.post("/solver/solve", data);
export const compareSolvers = (data) => api.post("/solver/compare", data);

// ── Analytics ──
export const getPerformanceData = (puzzleType) =>
  api.get(`/analytics/performance${puzzleType ? `?puzzle_type=${puzzleType}` : ""}`);
export const getAlgorithmComparison = (puzzleType) =>
  api.get(`/analytics/comparison${puzzleType ? `?puzzle_type=${puzzleType}` : ""}`);
export const getSummary = () => api.get("/analytics/summary");

// ── Reports ──
export const downloadPDF = async (data) => {
  const response = await api.post("/reports/pdf", data, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `puzzle_report_${data.puzzle_type || "result"}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
export const downloadCSV = (puzzleType) =>
  api.get(`/reports/csv${puzzleType ? `?puzzle_type=${puzzleType}` : ""}`, { responseType: "blob" });
export const getResults = (limit = 20) => api.get(`/reports/results?limit=${limit}`);

export default api;
