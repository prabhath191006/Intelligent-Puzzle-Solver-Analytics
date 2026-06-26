"""
Puzzle Model
MongoDB document schema helpers for puzzle data.
"""
from datetime import datetime, timezone


def create_puzzle_document(puzzle_type, size, difficulty, initial_state, user_id=None):
    """Create a puzzle document for MongoDB."""
    return {
        "puzzle_type": puzzle_type,
        "size": size,
        "difficulty": difficulty,
        "initial_state": initial_state,
        "user_id": user_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "unsolved",
    }


def create_result_document(puzzle_id, algorithm, solution, metrics, steps_count):
    """Create a solved result document for MongoDB."""
    return {
        "puzzle_id": str(puzzle_id),
        "algorithm": algorithm,
        "solved": solution is not None,
        "solution": solution,
        "metrics": metrics,
        "steps_count": steps_count,
        "solved_at": datetime.now(timezone.utc).isoformat(),
    }


def create_performance_log(puzzle_type, algorithm, n, metrics):
    """Create a performance log entry."""
    return {
        "puzzle_type": puzzle_type,
        "algorithm": algorithm,
        "size": n,
        "execution_time_ms": metrics.get("execution_time_ms", 0),
        "memory_used_mb": metrics.get("memory_used_mb", 0),
        "iterations": metrics.get("iterations", 0),
        "recursive_calls": metrics.get("recursive_calls", 0),
        "pruned_branches": metrics.get("pruned_branches", 0),
        "logged_at": datetime.now(timezone.utc).isoformat(),
    }
