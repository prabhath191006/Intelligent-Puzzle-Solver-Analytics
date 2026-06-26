"""
Backtracking Engine
Implements backtracking algorithm for Sudoku, N-Queens, and Knight's Tour.
Features: Recursive Search, Constraint Checking, Invalid Path Pruning, Optimized Search.
"""
import copy
from algorithms.performance import PerformanceTracker


# ──────────────────────────────────────────────
#  SUDOKU – Backtracking
# ──────────────────────────────────────────────

def solve_sudoku_backtracking(board):
    """
    Solve a 9x9 Sudoku puzzle using backtracking with constraint propagation.
    board: 9x9 list of lists, 0 = empty cell.
    Returns (solved_board, metrics, steps).
    """
    tracker = PerformanceTracker()
    tracker.start()
    grid = copy.deepcopy(board)
    steps = []

    def is_valid(grid, row, col, num):
        """Check row, column, and 3x3 box constraints."""
        # Row check
        if num in grid[row]:
            return False
        # Column check
        for r in range(9):
            if grid[r][col] == num:
                return False
        # Box check
        box_r, box_c = 3 * (row // 3), 3 * (col // 3)
        for r in range(box_r, box_r + 3):
            for c in range(box_c, box_c + 3):
                if grid[r][c] == num:
                    return False
        return True

    def find_empty(grid):
        """Find the next empty cell (MRV heuristic – pick cell with fewest candidates)."""
        min_candidates = 10
        best_cell = None
        for r in range(9):
            for c in range(9):
                if grid[r][c] == 0:
                    count = sum(1 for n in range(1, 10) if is_valid(grid, r, c, n))
                    if count < min_candidates:
                        min_candidates = count
                        best_cell = (r, c)
                        if count == 1:
                            return best_cell
        return best_cell

    def backtrack(grid):
        tracker.record_recursive_call()
        cell = find_empty(grid)
        if cell is None:
            return True  # solved

        row, col = cell
        for num in range(1, 10):
            tracker.record_iteration()
            if is_valid(grid, row, col, num):
                grid[row][col] = num
                steps.append({"row": row, "col": col, "value": num, "action": "place"})

                if backtrack(grid):
                    return True

                grid[row][col] = 0
                steps.append({"row": row, "col": col, "value": 0, "action": "remove"})
                tracker.record_prune()
            else:
                tracker.record_prune()

        return False

    solved = backtrack(grid)
    tracker.stop()

    return {
        "solved": solved,
        "solution": grid if solved else None,
        "steps": steps,
        "metrics": tracker.get_metrics(),
        "algorithm": "backtracking",
        "puzzle_type": "sudoku",
    }


# ──────────────────────────────────────────────
#  N-QUEENS – Backtracking
# ──────────────────────────────────────────────

def solve_nqueens_backtracking(n):
    """
    Solve the N-Queens problem using backtracking.
    Returns (solution_board, metrics, steps).
    """
    tracker = PerformanceTracker()
    tracker.start()
    steps = []

    cols = set()
    pos_diag = set()  # row + col
    neg_diag = set()  # row - col
    board = [[0] * n for _ in range(n)]

    def backtrack(row):
        tracker.record_recursive_call()
        if row == n:
            return True

        for col in range(n):
            tracker.record_iteration()
            if col in cols or (row + col) in pos_diag or (row - col) in neg_diag:
                tracker.record_prune()
                continue

            # Place queen
            board[row][col] = 1
            cols.add(col)
            pos_diag.add(row + col)
            neg_diag.add(row - col)
            steps.append({"row": row, "col": col, "action": "place"})

            if backtrack(row + 1):
                return True

            # Remove queen (backtrack)
            board[row][col] = 0
            cols.remove(col)
            pos_diag.remove(row + col)
            neg_diag.remove(row - col)
            steps.append({"row": row, "col": col, "action": "remove"})
            tracker.record_prune()

        return False

    solved = backtrack(0)
    tracker.stop()

    return {
        "solved": solved,
        "solution": board if solved else None,
        "n": n,
        "steps": steps,
        "metrics": tracker.get_metrics(),
        "algorithm": "backtracking",
        "puzzle_type": "nqueens",
    }


# ──────────────────────────────────────────────
#  KNIGHT'S TOUR – Backtracking (Warnsdorff)
# ──────────────────────────────────────────────

def solve_knights_tour_backtracking(n, start_row=0, start_col=0):
    """
    Solve the Knight's Tour using backtracking with Warnsdorff's heuristic.
    """
    tracker = PerformanceTracker()
    tracker.start()
    steps = []

    board = [[-1] * n for _ in range(n)]
    moves = [
        (2, 1), (1, 2), (-1, 2), (-2, 1),
        (-2, -1), (-1, -2), (1, -2), (2, -1),
    ]

    def is_valid_move(x, y):
        return 0 <= x < n and 0 <= y < n and board[x][y] == -1

    def degree(x, y):
        """Count accessible neighbors (Warnsdorff heuristic)."""
        count = 0
        for dx, dy in moves:
            nx, ny = x + dx, y + dy
            if is_valid_move(nx, ny):
                count += 1
        return count

    def backtrack(x, y, move_count):
        tracker.record_recursive_call()
        board[x][y] = move_count
        steps.append({"row": x, "col": y, "move": move_count, "action": "place"})

        if move_count == n * n - 1:
            return True

        # Sort next moves by Warnsdorff's heuristic (fewest onward moves first)
        next_moves = []
        for dx, dy in moves:
            nx, ny = x + dx, y + dy
            if is_valid_move(nx, ny):
                next_moves.append((degree(nx, ny), nx, ny))
        next_moves.sort()

        for _, nx, ny in next_moves:
            tracker.record_iteration()
            if backtrack(nx, ny, move_count + 1):
                return True
            tracker.record_prune()

        # Backtrack
        board[x][y] = -1
        steps.append({"row": x, "col": y, "move": -1, "action": "remove"})
        return False

    solved = backtrack(start_row, start_col, 0)
    tracker.stop()

    return {
        "solved": solved,
        "solution": board if solved else None,
        "n": n,
        "steps": steps,
        "metrics": tracker.get_metrics(),
        "algorithm": "backtracking",
        "puzzle_type": "knights_tour",
    }
