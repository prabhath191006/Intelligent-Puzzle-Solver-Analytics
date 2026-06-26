"""
Solver Routes
API endpoints for solving puzzles with backtracking and brute force algorithms.
"""
from flask import Blueprint, request, jsonify
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
from utils.validators import (
    validate_sudoku_board,
    validate_nqueens_input,
    validate_knights_tour_input,
)
from models.puzzle_model import create_result_document, create_performance_log

solver_bp = Blueprint("solver", __name__, url_prefix="/api/solver")

# Solver registry
SOLVERS = {
    "sudoku": {
        "backtracking": solve_sudoku_backtracking,
        "brute_force": solve_sudoku_brute_force,
    },
    "nqueens": {
        "backtracking": solve_nqueens_backtracking,
        "brute_force": solve_nqueens_brute_force,
    },
    "knights_tour": {
        "backtracking": solve_knights_tour_backtracking,
        "brute_force": solve_knights_tour_brute_force,
    },
}

VALIDATORS = {
    "sudoku": lambda d: validate_sudoku_board(d.get("board", [])),
    "nqueens": lambda d: validate_nqueens_input(d.get("n", 0)),
    "knights_tour": lambda d: validate_knights_tour_input(
        d.get("n", 0), d.get("start_row", 0), d.get("start_col", 0)
    ),
}


def init_solver_routes(db):
    """Initialize solver routes with database reference."""

    @solver_bp.route("/solve", methods=["POST"])
    def solve():
        """
        Solve a puzzle.
        Body: { puzzle_type, algorithm, board/n, ... }
        """
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400

        puzzle_type = data.get("puzzle_type")
        algorithm = data.get("algorithm")

        if puzzle_type not in SOLVERS:
            return jsonify({
                "success": False,
                "error": f"Unknown puzzle type: {puzzle_type}. Supported: {list(SOLVERS.keys())}"
            }), 400

        if algorithm not in SOLVERS[puzzle_type]:
            return jsonify({
                "success": False,
                "error": f"Unknown algorithm: {algorithm}. Supported: {list(SOLVERS[puzzle_type].keys())}"
            }), 400

        # Validate input
        validator = VALIDATORS.get(puzzle_type)
        if validator:
            is_valid, errors = validator(data)
            if not is_valid:
                return jsonify({"success": False, "errors": errors}), 400

        # Run solver
        try:
            solver_fn = SOLVERS[puzzle_type][algorithm]

            if puzzle_type == "sudoku":
                result = solver_fn(data["board"])
            elif puzzle_type == "nqueens":
                result = solver_fn(data["n"])
            elif puzzle_type == "knights_tour":
                result = solver_fn(
                    data["n"],
                    data.get("start_row", 0),
                    data.get("start_col", 0),
                )
            else:
                return jsonify({"success": False, "error": "Unhandled puzzle type"}), 500

        except Exception as e:
            return jsonify({
                "success": False,
                "error": f"Solver error: {str(e)}"
            }), 500

        # Save result to database
        try:
            result_doc = create_result_document(
                puzzle_id=data.get("puzzle_id", "direct"),
                algorithm=algorithm,
                solution=result.get("solution"),
                metrics=result.get("metrics", {}),
                steps_count=len(result.get("steps", [])),
            )
            db.results.insert_one(result_doc)

            # Log performance
            perf_log = create_performance_log(
                puzzle_type=puzzle_type,
                algorithm=algorithm,
                n=data.get("n", 9),
                metrics=result.get("metrics", {}),
            )
            db.performance_logs.insert_one(perf_log)
        except Exception:
            pass  # Don't fail the solve if DB logging fails

        # Limit steps sent to frontend (for performance)
        steps = result.get("steps", [])
        if len(steps) > 2000:
            # Send first 1000 and last 1000
            steps = steps[:1000] + steps[-1000:]

        return jsonify({
            "success": True,
            "solved": result.get("solved", False),
            "solution": result.get("solution"),
            "steps": steps,
            "metrics": result.get("metrics", {}),
            "algorithm": algorithm,
            "puzzle_type": puzzle_type,
        })

    @solver_bp.route("/compare", methods=["POST"])
    def compare():
        """
        Solve a puzzle with BOTH algorithms and compare performance.
        """
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400

        puzzle_type = data.get("puzzle_type")
        if puzzle_type not in SOLVERS:
            return jsonify({"success": False, "error": f"Unknown puzzle type: {puzzle_type}"}), 400

        # Validate
        validator = VALIDATORS.get(puzzle_type)
        if validator:
            is_valid, errors = validator(data)
            if not is_valid:
                return jsonify({"success": False, "errors": errors}), 400

        results = {}
        for algo_name, solver_fn in SOLVERS[puzzle_type].items():
            try:
                if puzzle_type == "sudoku":
                    result = solver_fn(data["board"])
                elif puzzle_type == "nqueens":
                    result = solver_fn(data["n"])
                elif puzzle_type == "knights_tour":
                    result = solver_fn(data["n"], data.get("start_row", 0), data.get("start_col", 0))

                results[algo_name] = {
                    "solved": result.get("solved", False),
                    "solution": result.get("solution"),
                    "metrics": result.get("metrics", {}),
                    "steps_count": len(result.get("steps", [])),
                }

                # Log performance
                try:
                    perf_log = create_performance_log(
                        puzzle_type=puzzle_type,
                        algorithm=algo_name,
                        n=data.get("n", 9),
                        metrics=result.get("metrics", {}),
                    )
                    db.performance_logs.insert_one(perf_log)
                except Exception:
                    pass

            except Exception as e:
                results[algo_name] = {
                    "solved": False,
                    "error": str(e),
                    "metrics": {},
                }

        return jsonify({
            "success": True,
            "puzzle_type": puzzle_type,
            "comparison": results,
        })

    return solver_bp
