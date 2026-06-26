"""
Configuration Manager
Handles puzzle settings, difficulty levels, and constraint rules.
"""
import os

class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get("SECRET_KEY", "puzzle-solver-secret-key-2026")
    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
    DATABASE_NAME = "puzzle_solver"
    DEBUG = False

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False

# Puzzle configuration presets
PUZZLE_CONFIG = {
    "sudoku": {
        "sizes": [9],
        "difficulties": {
            "easy": {"min_clues": 36, "max_clues": 45},
            "medium": {"min_clues": 27, "max_clues": 35},
            "hard": {"min_clues": 22, "max_clues": 26},
        },
        "constraints": [
            "Each row must contain digits 1-9 with no repetition",
            "Each column must contain digits 1-9 with no repetition",
            "Each 3x3 sub-box must contain digits 1-9 with no repetition",
        ],
    },
    "nqueens": {
        "sizes": list(range(4, 13)),  # 4 to 12
        "difficulties": {
            "easy": {"n": 4},
            "medium": {"n": 8},
            "hard": {"n": 12},
        },
        "constraints": [
            "No two queens share the same row",
            "No two queens share the same column",
            "No two queens share the same diagonal",
        ],
    },
    "knights_tour": {
        "sizes": [5, 6, 8],
        "difficulties": {
            "easy": {"n": 5},
            "medium": {"n": 6},
            "hard": {"n": 8},
        },
        "constraints": [
            "Knight must visit every square exactly once",
            "Knight moves in L-shape (2+1 squares)",
        ],
    },
}

def get_config():
    """Return the appropriate config based on environment."""
    env = os.environ.get("FLASK_ENV", "development")
    if env == "production":
        return ProductionConfig()
    return DevelopmentConfig()
