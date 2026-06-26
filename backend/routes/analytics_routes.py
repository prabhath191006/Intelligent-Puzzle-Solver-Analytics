"""
Analytics Routes
Endpoints for performance dashboard, algorithm comparison data, and statistics.
"""
from flask import Blueprint, request, jsonify

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")


def init_analytics_routes(db):
    """Initialize analytics routes with database reference."""

    @analytics_bp.route("/performance", methods=["GET"])
    def get_performance_data():
        """Get performance logs for charting."""
        puzzle_type = request.args.get("puzzle_type")
        limit = request.args.get("limit", 50, type=int)

        query = {}
        if puzzle_type:
            query["puzzle_type"] = puzzle_type

        logs = list(
            db.performance_logs.find(query, {"_id": 0})
            .sort("logged_at", -1)
            .limit(limit)
        )

        return jsonify({"success": True, "logs": logs})

    @analytics_bp.route("/comparison", methods=["GET"])
    def get_algorithm_comparison():
        """Get aggregated algorithm comparison statistics."""
        puzzle_type = request.args.get("puzzle_type")

        pipeline = []
        if puzzle_type:
            pipeline.append({"$match": {"puzzle_type": puzzle_type}})

        pipeline.extend([
            {
                "$group": {
                    "_id": {
                        "puzzle_type": "$puzzle_type",
                        "algorithm": "$algorithm",
                    },
                    "avg_time_ms": {"$avg": "$execution_time_ms"},
                    "avg_memory_mb": {"$avg": "$memory_used_mb"},
                    "avg_iterations": {"$avg": "$iterations"},
                    "total_runs": {"$sum": 1},
                    "min_time_ms": {"$min": "$execution_time_ms"},
                    "max_time_ms": {"$max": "$execution_time_ms"},
                }
            },
            {"$sort": {"_id.puzzle_type": 1, "_id.algorithm": 1}},
        ])

        results = list(db.performance_logs.aggregate(pipeline))

        # Flatten for frontend
        comparison = []
        for r in results:
            comparison.append({
                "puzzle_type": r["_id"]["puzzle_type"],
                "algorithm": r["_id"]["algorithm"],
                "avg_time_ms": round(r["avg_time_ms"], 2),
                "avg_memory_mb": round(r["avg_memory_mb"], 4),
                "avg_iterations": round(r["avg_iterations"]),
                "total_runs": r["total_runs"],
                "min_time_ms": round(r["min_time_ms"], 2),
                "max_time_ms": round(r["max_time_ms"], 2),
            })

        return jsonify({"success": True, "comparison": comparison})

    @analytics_bp.route("/summary", methods=["GET"])
    def get_summary():
        """Get overall system summary stats."""
        total_puzzles = db.puzzles.count_documents({})
        total_results = db.results.count_documents({})
        total_solved = db.results.count_documents({"solved": True})
        total_logs = db.performance_logs.count_documents({})

        return jsonify({
            "success": True,
            "summary": {
                "total_puzzles": total_puzzles,
                "total_solves": total_results,
                "successful_solves": total_solved,
                "performance_logs": total_logs,
                "success_rate": round(total_solved / max(total_results, 1) * 100, 1),
            },
        })

    return analytics_bp
