"""
Report Routes
Endpoints for generating and downloading PDF / CSV reports.
"""
import csv
import io
from flask import Blueprint, request, jsonify, send_file
from utils.report_generator import generate_pdf_report

report_bp = Blueprint("report", __name__, url_prefix="/api/reports")


def init_report_routes(db):
    """Initialize report routes with database reference."""

    @report_bp.route("/pdf", methods=["POST"])
    def download_pdf():
        """Generate and download a PDF report for a solve result."""
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400

        try:
            buffer = generate_pdf_report(data)
            return send_file(
                buffer,
                mimetype="application/pdf",
                as_attachment=True,
                download_name=f"puzzle_report_{data.get('puzzle_type', 'unknown')}.pdf",
            )
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    @report_bp.route("/csv", methods=["GET"])
    def download_csv():
        """Export performance logs as CSV."""
        puzzle_type = request.args.get("puzzle_type")
        query = {}
        if puzzle_type:
            query["puzzle_type"] = puzzle_type

        logs = list(db.performance_logs.find(query, {"_id": 0}).sort("logged_at", -1).limit(500))

        if not logs:
            return jsonify({"success": False, "error": "No data to export"}), 404

        # Create CSV
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=logs[0].keys())
        writer.writeheader()
        writer.writerows(logs)

        buffer = io.BytesIO(output.getvalue().encode("utf-8"))
        buffer.seek(0)

        return send_file(
            buffer,
            mimetype="text/csv",
            as_attachment=True,
            download_name="performance_logs.csv",
        )

    @report_bp.route("/results", methods=["GET"])
    def get_results():
        """Get all solve results."""
        limit = request.args.get("limit", 20, type=int)
        results = list(db.results.find({}, {"steps": 0}).sort("solved_at", -1).limit(limit))
        for r in results:
            r["_id"] = str(r["_id"])
        return jsonify({"success": True, "results": results})

    return report_bp
