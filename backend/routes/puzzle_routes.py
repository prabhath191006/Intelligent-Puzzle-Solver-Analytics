"""
Puzzle Routes
CRUD operations for puzzle configurations and datasets.
"""
from flask import Blueprint, request, jsonify
from models.puzzle_model import create_puzzle_document
from config import PUZZLE_CONFIG

puzzle_bp = Blueprint("puzzle", __name__, url_prefix="/api/puzzles")


def init_puzzle_routes(db):
    """Initialize puzzle routes with database reference."""

    @puzzle_bp.route("/types", methods=["GET"])
    def get_puzzle_types():
        """Return available puzzle types and their configurations."""
        return jsonify({
            "success": True,
            "puzzle_types": PUZZLE_CONFIG,
        })

    @puzzle_bp.route("/presets/<puzzle_type>", methods=["GET"])
    def get_presets(puzzle_type):
        """Return preset puzzles for a given type."""
        if puzzle_type not in PUZZLE_CONFIG:
            return jsonify({"success": False, "error": f"Unknown puzzle type: {puzzle_type}"}), 400

        presets = list(db.puzzle_presets.find(
            {"puzzle_type": puzzle_type},
            {"_id": 0}
        ).limit(20))

        return jsonify({"success": True, "presets": presets})

    @puzzle_bp.route("/save", methods=["POST"])
    def save_puzzle():
        """Save a puzzle configuration."""
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400

        doc = create_puzzle_document(
            puzzle_type=data.get("puzzle_type"),
            size=data.get("size"),
            difficulty=data.get("difficulty", "custom"),
            initial_state=data.get("initial_state"),
        )
        result = db.puzzles.insert_one(doc)
        doc["_id"] = str(result.inserted_id)

        return jsonify({"success": True, "puzzle": doc}), 201

    @puzzle_bp.route("/<puzzle_id>", methods=["GET"])
    def get_puzzle(puzzle_id):
        """Get a specific puzzle by ID."""
        try:
            # Try ObjectId first (MongoDB), fall back to string (in-memory)
            try:
                from bson import ObjectId
                puzzle = db.puzzles.find_one({"_id": ObjectId(puzzle_id)})
            except Exception:
                puzzle = db.puzzles.find_one({"_id": puzzle_id})
        except Exception:
            return jsonify({"success": False, "error": "Invalid puzzle ID"}), 400

        if not puzzle:
            return jsonify({"success": False, "error": "Puzzle not found"}), 404

        puzzle["_id"] = str(puzzle["_id"])
        return jsonify({"success": True, "puzzle": puzzle})

    @puzzle_bp.route("/history", methods=["GET"])
    def get_history():
        """Get puzzle solve history."""
        limit = request.args.get("limit", 20, type=int)
        puzzles = list(db.puzzles.find().sort("created_at", -1).limit(limit))
        for p in puzzles:
            p["_id"] = str(p["_id"])
        return jsonify({"success": True, "puzzles": puzzles})

    return puzzle_bp
