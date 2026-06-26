"""
Brute Force Engine
Implements brute force / exhaustive search for Sudoku, N-Queens, and Knight's Tour.
Features: Generate All Combinations, State Expansion, Constraint Validation, Solution Detection.
"""
import copy
import itertools
from algorithms.performance import PerformanceTracker


# ──────────────────────────────────────────────
#  SUDOKU – Brute Force
# ──────────────────────────────────────────────

def solve_sudoku_brute_force(board):
    """
    Solve a 9x9 Sudoku puzzle using brute force (exhaustive search).
    Still uses constraint validation, but no intelligent pruning.
    """
    tracker = PerformanceTracker()
    tracker.start()
    grid = copy.deepcopy(board)
    steps = []

    # Find all empty cells
    empty_cells = []
    for r in range(9):
        for c in range(9):
            if grid[r][c] == 0:
                empty_cells.append((r, c))

    def is_valid(grid, row, col, num):
        """Check all constraints for placement."""
        for i in range(9):
            if grid[row][i] == num and i != col:
                return False
            if grid[i][col] == num and i != row:
                return False
        box_r, box_c = 3 * (row // 3), 3 * (col // 3)
        for r in range(box_r, box_r + 3):
            for c in range(box_c, box_c + 3):
                if grid[r][c] == num and (r, c) != (row, col):
                    return False
        return True

    def brute_force(idx):
        """Try all values 1-9 for each empty cell sequentially."""
        if idx == len(empty_cells):
            # Validate entire board
            for r in range(9):
                for c in range(9):
                    if not is_valid(grid, r, c, grid[r][c]):
                        return False
            return True

        row, col = empty_cells[idx]
        for num in range(1, 10):
            tracker.record_iteration()
            grid[row][col] = num
            steps.append({"row": row, "col": col, "value": num, "action": "place"})

            if is_valid(grid, row, col, num):
                if brute_force(idx + 1):
                    return True

            grid[row][col] = 0
            steps.append({"row": row, "col": col, "value": 0, "action": "remove"})

        return False

    solved = brute_force(0)
    tracker.stop()

    return {
        "solved": solved,
        "solution": grid if solved else None,
        "steps": steps,
        "metrics": tracker.get_metrics(),
        "algorithm": "brute_force",
        "puzzle_type": "sudoku",
    }


# ──────────────────────────────────────────────
#  N-QUEENS – Brute Force
# ──────────────────────────────────────────────

def solve_nqueens_brute_force(n):
    """
    Solve N-Queens using brute force: generate all permutations of column
    placements and validate constraints.
    """
    tracker = PerformanceTracker()
    tracker.start()
    steps = []
    solution = None

    # Generate all permutations of n columns
    for perm in itertools.permutations(range(n)):
        tracker.record_iteration()
        # Check diagonal constraints
        valid = True
        for i in range(n):
            for j in range(i + 1, n):
                if abs(perm[i] - perm[j]) == abs(i - j):
                    valid = False
                    break
            if not valid:
                break

        if valid:
            board = [[0] * n for _ in range(n)]
            for row, col in enumerate(perm):
                board[row][col] = 1
                steps.append({"row": row, "col": col, "action": "place"})
            solution = board
            break

    tracker.stop()

    return {
        "solved": solution is not None,
        "solution": solution,
        "n": n,
        "steps": steps,
        "metrics": tracker.get_metrics(),
        "algorithm": "brute_force",
        "puzzle_type": "nqueens",
    }


# ──────────────────────────────────────────────
#  KNIGHT'S TOUR – Brute Force
# ──────────────────────────────────────────────

def solve_knights_tour_brute_force(n, start_row=0, start_col=0):
    """
    Solve Knight's Tour using brute force (no Warnsdorff heuristic).
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

    def brute_force(x, y, move_count):
        board[x][y] = move_count
        steps.append({"row": x, "col": y, "move": move_count, "action": "place"})
        tracker.record_iteration()

        if move_count == n * n - 1:
            return True

        # Try all 8 moves without any heuristic ordering
        for dx, dy in moves:
            nx, ny = x + dx, y + dy
            if is_valid_move(nx, ny):
                if brute_force(nx, ny, move_count + 1):
                    return True

        # Backtrack
        board[x][y] = -1
        steps.append({"row": x, "col": y, "move": -1, "action": "remove"})
        return False

    solved = brute_force(start_row, start_col, 0)
    tracker.stop()

    return {
        "solved": solved,
        "solution": board if solved else None,
        "n": n,
        "steps": steps,
        "metrics": tracker.get_metrics(),
        "algorithm": "brute_force",
        "puzzle_type": "knights_tour",
    }
