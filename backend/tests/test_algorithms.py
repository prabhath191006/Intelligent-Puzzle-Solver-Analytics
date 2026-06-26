"""
Unit tests for algorithm engines.
"""
import pytest
from algorithms.backtracking import (
    solve_sudoku_backtracking,
    solve_nqueens_backtracking,
    solve_knights_tour_backtracking,
)
from algorithms.brute_force import (
    solve_sudoku_brute_force,
    solve_nqueens_brute_force,
    solve_knights_tour_brute_force,
)

EASY_SUDOKU = [
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

class TestSudokuBacktracking:
    def test_solves_easy(self):
        result = solve_sudoku_backtracking(EASY_SUDOKU)
        assert result["solved"] is True
        assert result["solution"] is not None
        assert result["algorithm"] == "backtracking"

    def test_metrics_recorded(self):
        result = solve_sudoku_backtracking(EASY_SUDOKU)
        m = result["metrics"]
        assert m["execution_time_ms"] > 0
        assert m["iterations"] > 0

    def test_solution_valid(self):
        result = solve_sudoku_backtracking(EASY_SUDOKU)
        sol = result["solution"]
        for r in range(9):
            assert sorted(sol[r]) == list(range(1, 10))
        for c in range(9):
            assert sorted(sol[r][c] for r in range(9)) == list(range(1, 10))

class TestSudokuBruteForce:
    def test_solves_easy(self):
        result = solve_sudoku_brute_force(EASY_SUDOKU)
        assert result["solved"] is True
        assert result["algorithm"] == "brute_force"

class TestNQueensBacktracking:
    @pytest.mark.parametrize("n", [4, 5, 6, 8])
    def test_solves(self, n):
        result = solve_nqueens_backtracking(n)
        assert result["solved"] is True
        assert sum(sum(row) for row in result["solution"]) == n

class TestNQueensBruteForce:
    @pytest.mark.parametrize("n", [4, 5, 6])
    def test_solves(self, n):
        result = solve_nqueens_brute_force(n)
        assert result["solved"] is True

class TestKnightsTourBacktracking:
    def test_solves_5x5(self):
        result = solve_knights_tour_backtracking(5)
        assert result["solved"] is True

class TestPerformanceComparison:
    def test_backtracking_faster_nqueens(self):
        bt = solve_nqueens_backtracking(8)
        bf = solve_nqueens_brute_force(8)
        # Backtracking should generally use fewer iterations
        assert bt["metrics"]["iterations"] <= bf["metrics"]["iterations"]
