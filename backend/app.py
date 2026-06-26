"""
Intelligent Puzzle Solver – Flask Application
Main entry point for the backend API server.
"""
from flask import Flask, jsonify
from flask_cors import CORS
from config import get_config, PUZZLE_CONFIG
from utils.memory_db import get_database

from routes.puzzle_routes import puzzle_bp, init_puzzle_routes
from routes.solver_routes import solver_bp, init_solver_routes
from routes.analytics_routes import analytics_bp, init_analytics_routes
from routes.report_routes import report_bp, init_report_routes


def create_app():
    """Application factory."""
    app = Flask(__name__)
    config = get_config()
    app.config.from_object(config)

    # CORS for React frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Database connection (MongoDB with in-memory fallback)
    db, is_memory = get_database(config.MONGO_URI, config.DATABASE_NAME)
    if is_memory:
        print("[INFO] Running with in-memory storage. Data will not persist across restarts.")

    # Seed preset puzzles if collection is empty (non-blocking)
    try:
        _seed_presets(db)
    except Exception as e:
        print(f"[WARNING] Could not seed presets: {e}")

    # Register blueprints
    init_puzzle_routes(db)
    app.register_blueprint(puzzle_bp)

    init_solver_routes(db)
    app.register_blueprint(solver_bp)

    init_analytics_routes(db)
    app.register_blueprint(analytics_bp)

    init_report_routes(db)
    app.register_blueprint(report_bp)

    # Health check
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "healthy",
            "service": "Intelligent Puzzle Solver API",
            "version": "1.0.0",
        })

    # Config endpoint
    @app.route("/api/config", methods=["GET"])
    def get_puzzle_config():
        return jsonify({"success": True, "config": PUZZLE_CONFIG})

    return app


def _seed_presets(db):
    """Seed sample puzzle presets if none exist."""
    if db.puzzle_presets.count_documents({}) > 0:
        return

    presets = [
        {
            "puzzle_type": "sudoku",
            "name": "Easy Sudoku #1",
            "difficulty": "easy",
            "size": 9,
            "initial_state": [
                [5, 3, 0, 0, 7, 0, 0, 0, 0],
                [6, 0, 0, 1, 9, 5, 0, 0, 0],
                [0, 9, 8, 0, 0, 0, 0, 6, 0],
                [8, 0, 0, 0, 6, 0, 0, 0, 3],
                [4, 0, 0, 8, 0, 3, 0, 0, 1],
                [7, 0, 0, 0, 2, 0, 0, 0, 6],
                [0, 6, 0, 0, 0, 0, 2, 8, 0],
                [0, 0, 0, 4, 1, 9, 0, 0, 5],
                [0, 0, 0, 0, 8, 0, 0, 7, 9],
            ],
        },
        {
            "puzzle_type": "sudoku",
            "name": "Medium Sudoku #1",
            "difficulty": "medium",
            "size": 9,
            "initial_state": [
                [0, 0, 0, 6, 0, 0, 4, 0, 0],
                [7, 0, 0, 0, 0, 3, 6, 0, 0],
                [0, 0, 0, 0, 9, 1, 0, 8, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 5, 0, 1, 8, 0, 0, 0, 3],
                [0, 0, 0, 3, 0, 6, 0, 4, 5],
                [0, 4, 0, 2, 0, 0, 0, 6, 0],
                [9, 0, 3, 0, 0, 0, 0, 0, 0],
                [0, 2, 0, 0, 0, 0, 1, 0, 0],
            ],
        },
        {
            "puzzle_type": "sudoku",
            "name": "Hard Sudoku #1",
            "difficulty": "hard",
            "size": 9,
            "initial_state": [
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 3, 0, 8, 5],
                [0, 0, 1, 0, 2, 0, 0, 0, 0],
                [0, 0, 0, 5, 0, 7, 0, 0, 0],
                [0, 0, 4, 0, 0, 0, 1, 0, 0],
                [0, 9, 0, 0, 0, 0, 0, 0, 0],
                [5, 0, 0, 0, 0, 0, 0, 7, 3],
                [0, 0, 2, 0, 1, 0, 0, 0, 0],
                [0, 0, 0, 0, 4, 0, 0, 0, 9],
            ],
        },
    ]

    db.puzzle_presets.insert_many(presets)
    print("[OK] Seeded puzzle presets")


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
