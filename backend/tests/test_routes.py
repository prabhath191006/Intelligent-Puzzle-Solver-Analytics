"""
Integration tests for API routes.
Uses a single shared Flask test client to avoid blueprint re-registration errors.
"""
import pytest
import json
from app import create_app

# Create the app once at module level to avoid blueprint re-registration
_app = create_app()
_app.config["TESTING"] = True


@pytest.fixture
def client():
    with _app.test_client() as client:
        yield client


class TestHealthEndpoint:
    def test_health(self, client):
        resp = client.get("/api/health")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["status"] == "healthy"


class TestConfigEndpoint:
    def test_config(self, client):
        resp = client.get("/api/config")
        data = resp.get_json()
        assert data["success"] is True
        assert "sudoku" in data["config"]


class TestSolverEndpoint:
    def test_solve_nqueens(self, client):
        resp = client.post("/api/solver/solve", json={
            "puzzle_type": "nqueens",
            "algorithm": "backtracking",
            "n": 4,
        })
        data = resp.get_json()
        assert data["success"] is True
        assert data["solved"] is True

    def test_solve_invalid_type(self, client):
        resp = client.post("/api/solver/solve", json={
            "puzzle_type": "invalid",
            "algorithm": "backtracking",
        })
        assert resp.status_code == 400

    def test_compare(self, client):
        resp = client.post("/api/solver/compare", json={
            "puzzle_type": "nqueens",
            "n": 4,
        })
        data = resp.get_json()
        assert data["success"] is True
        assert "backtracking" in data["comparison"]
        assert "brute_force" in data["comparison"]

    def test_solve_sudoku(self, client):
        board = [
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9],
        ]
        resp = client.post("/api/solver/solve", json={
            "puzzle_type": "sudoku",
            "algorithm": "backtracking",
            "board": board,
        })
        data = resp.get_json()
        assert data["success"] is True
        assert data["solved"] is True
        # Verify solution is a 9x9 grid
        assert len(data["solution"]) == 9
        assert all(len(row) == 9 for row in data["solution"])


class TestPresetsEndpoint:
    def test_get_presets(self, client):
        resp = client.get("/api/puzzles/presets/sudoku")
        data = resp.get_json()
        assert data["success"] is True
        assert len(data["presets"]) >= 1

    def test_invalid_type(self, client):
        resp = client.get("/api/puzzles/presets/invalid_puzzle")
        assert resp.status_code == 400


class TestAnalyticsEndpoints:
    def test_summary(self, client):
        resp = client.get("/api/analytics/summary")
        data = resp.get_json()
        assert data["success"] is True
        assert "summary" in data

    def test_performance(self, client):
        resp = client.get("/api/analytics/performance")
        data = resp.get_json()
        assert data["success"] is True
        assert "logs" in data
