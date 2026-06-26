"""
Unit tests for validators.
"""
import pytest
from utils.validators import validate_sudoku_board, validate_nqueens_input, validate_knights_tour_input

class TestSudokuValidator:
    def test_valid_board(self):
        board = [[0]*9 for _ in range(9)]
        board[0][0] = 5
        ok, errs = validate_sudoku_board(board)
        assert ok is True

    def test_wrong_size(self):
        ok, errs = validate_sudoku_board([[0]*8 for _ in range(9)])
        assert ok is False

    def test_invalid_value(self):
        board = [[0]*9 for _ in range(9)]
        board[0][0] = 10
        ok, errs = validate_sudoku_board(board)
        assert ok is False

    def test_duplicate_row(self):
        board = [[0]*9 for _ in range(9)]
        board[0][0] = 5
        board[0][1] = 5
        ok, errs = validate_sudoku_board(board)
        assert ok is False

class TestNQueensValidator:
    def test_valid(self):
        ok, _ = validate_nqueens_input(8)
        assert ok is True

    def test_too_small(self):
        ok, _ = validate_nqueens_input(3)
        assert ok is False

    def test_too_large(self):
        ok, _ = validate_nqueens_input(13)
        assert ok is False

class TestKnightsTourValidator:
    def test_valid(self):
        ok, _ = validate_knights_tour_input(5, 0, 0)
        assert ok is True

    def test_invalid_size(self):
        ok, _ = validate_knights_tour_input(3, 0, 0)
        assert ok is False
