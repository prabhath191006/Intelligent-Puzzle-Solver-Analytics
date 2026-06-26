"""
Performance Tracker
Tracks execution time, memory usage, and iteration count for algorithm runs.
"""
import time
import psutil
import os


class PerformanceTracker:
    """Tracks and records algorithm performance metrics."""

    def __init__(self):
        self.start_time = None
        self.end_time = None
        self.iterations = 0
        self.recursive_calls = 0
        self.states_explored = 0
        self.pruned_branches = 0
        self.memory_before = 0
        self.memory_after = 0
        self.snapshots = []  # time-series snapshots for visualization

    def start(self):
        """Start tracking performance."""
        process = psutil.Process(os.getpid())
        self.memory_before = process.memory_info().rss / 1024 / 1024  # MB
        self.start_time = time.perf_counter()
        self.iterations = 0
        self.recursive_calls = 0
        self.states_explored = 0
        self.pruned_branches = 0
        self.snapshots = []

    def stop(self):
        """Stop tracking performance."""
        self.end_time = time.perf_counter()
        process = psutil.Process(os.getpid())
        self.memory_after = process.memory_info().rss / 1024 / 1024  # MB

    def record_iteration(self):
        """Record a single iteration / state expansion."""
        self.iterations += 1
        self.states_explored += 1
        # Take a snapshot every 500 iterations for charting
        if self.iterations % 500 == 0:
            elapsed = time.perf_counter() - self.start_time
            self.snapshots.append({
                "iteration": self.iterations,
                "elapsed_ms": round(elapsed * 1000, 2),
            })

    def record_recursive_call(self):
        """Record a recursive call."""
        self.recursive_calls += 1

    def record_prune(self):
        """Record a pruned branch."""
        self.pruned_branches += 1

    def get_metrics(self):
        """Return collected metrics as a dictionary."""
        elapsed = (self.end_time - self.start_time) if self.end_time else 0
        return {
            "execution_time_ms": round(elapsed * 1000, 2),
            "execution_time_s": round(elapsed, 4),
            "memory_used_mb": round(self.memory_after - self.memory_before, 4),
            "memory_before_mb": round(self.memory_before, 2),
            "memory_after_mb": round(self.memory_after, 2),
            "iterations": self.iterations,
            "states_explored": self.states_explored,
            "recursive_calls": self.recursive_calls,
            "pruned_branches": self.pruned_branches,
            "snapshots": self.snapshots,
        }
