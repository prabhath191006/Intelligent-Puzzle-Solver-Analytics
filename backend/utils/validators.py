"""
Validators
Input validation for puzzle data.
"""


def validate_sudoku_board(board):
    """Validate a Sudoku board input."""
    errors = []

    if not isinstance(board, list) or len(board) != 9:
        return False, ["Board must be a 9x9 grid (list of 9 rows)"]

    for i, row in enumerate(board):
        if not isinstance(row, list) or len(row) != 9:
            errors.append(f"Row {i} must have exactly 9 elements")
            continue
        for j, val in enumerate(row):
            if not isinstance(val, int) or val < 0 or val > 9:
                errors.append(f"Cell [{i}][{j}] must be an integer 0-9")

    if errors:
        return False, errors

    # Check for constraint violations in the initial state
    for r in range(9):
        for c in range(9):
            num = board[r][c]
            if num == 0:
                continue
            # Row duplicate
            for c2 in range(9):
                if c2 != c and board[r][c2] == num:
                    errors.append(f"Duplicate {num} in row {r}")
                    break
            # Column duplicate
            for r2 in range(9):
                if r2 != r and board[r2][c] == num:
                    errors.append(f"Duplicate {num} in column {c}")
                    break
            # Box duplicate
            br, bc = 3 * (r // 3), 3 * (c // 3)
            for r2 in range(br, br + 3):
                for c2 in range(bc, bc + 3):
                    if (r2, c2) != (r, c) and board[r2][c2] == num:
                        errors.append(f"Duplicate {num} in 3x3 box at [{r}][{c}]")

    if errors:
        return False, list(set(errors))  # deduplicate

    return True, []


def validate_nqueens_input(n):
    """Validate N-Queens size input."""
    if not isinstance(n, int) or n < 4 or n > 12:
        return False, ["N must be an integer between 4 and 12"]
    return True, []


def validate_knights_tour_input(n, start_row=0, start_col=0):
    """Validate Knight's Tour input."""
    errors = []
    if not isinstance(n, int) or n < 5 or n > 8:
        errors.append("Board size N must be an integer between 5 and 8")
    if not isinstance(start_row, int) or start_row < 0 or start_row >= n:
        errors.append(f"Start row must be between 0 and {n - 1}")
    if not isinstance(start_col, int) or start_col < 0 or start_col >= n:
        errors.append(f"Start column must be between 0 and {n - 1}")
    return len(errors) == 0, errors
