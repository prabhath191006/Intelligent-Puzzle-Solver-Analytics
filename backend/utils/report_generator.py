"""
Report Generator
Generates PDF reports for solved puzzles using ReportLab.
"""
import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT


def generate_pdf_report(result_data):
    """
    Generate a PDF report for a puzzle solution.
    Returns a BytesIO buffer with the PDF content.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5 * inch, bottomMargin=0.5 * inch)
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "CustomTitle", parent=styles["Title"],
        fontSize=20, textColor=colors.HexColor("#1a1a2e"),
        spaceAfter=20
    )
    heading_style = ParagraphStyle(
        "CustomHeading", parent=styles["Heading2"],
        fontSize=14, textColor=colors.HexColor("#16213e"),
        spaceAfter=10, spaceBefore=15
    )
    body_style = ParagraphStyle(
        "CustomBody", parent=styles["Normal"],
        fontSize=11, leading=16
    )

    elements = []

    # Title
    elements.append(Paragraph("Intelligent Puzzle Solver - Solution Report", title_style))
    elements.append(Spacer(1, 10))

    # Metadata
    puzzle_type = result_data.get("puzzle_type", "Unknown").replace("_", " ").title()
    algorithm = result_data.get("algorithm", "Unknown").replace("_", " ").title()
    solved = "Solved" if result_data.get("solved") else "Not Solved"
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    meta_data = [
        ["Puzzle Type", puzzle_type],
        ["Algorithm", algorithm],
        ["Status", solved],
        ["Generated At", timestamp],
    ]
    meta_table = Table(meta_data, colWidths=[2 * inch, 4 * inch])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#e8f4f8")),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#1a1a2e")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 11),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#bdc3c7")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 20))

    # Performance Metrics
    metrics = result_data.get("metrics", {})
    elements.append(Paragraph("Performance Metrics", heading_style))

    perf_data = [
        ["Metric", "Value"],
        ["Execution Time", f"{metrics.get('execution_time_ms', 0)} ms"],
        ["Memory Used", f"{metrics.get('memory_used_mb', 0)} MB"],
        ["Iterations", f"{metrics.get('iterations', 0):,}"],
        ["Recursive Calls", f"{metrics.get('recursive_calls', 0):,}"],
        ["Pruned Branches", f"{metrics.get('pruned_branches', 0):,}"],
        ["States Explored", f"{metrics.get('states_explored', 0):,}"],
    ]
    perf_table = Table(perf_data, colWidths=[3 * inch, 3 * inch])
    perf_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f3460")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#bdc3c7")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8f9fa")]),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(perf_table)
    elements.append(Spacer(1, 20))

    # Solution Grid
    solution = result_data.get("solution")
    if solution and result_data.get("puzzle_type") == "sudoku":
        elements.append(Paragraph("Solution Grid", heading_style))
        grid_data = [[str(cell) for cell in row] for row in solution]
        grid_table = Table(grid_data, colWidths=[0.5 * inch] * 9, rowHeights=[0.5 * inch] * 9)
        grid_table.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 1, colors.HexColor("#2c3e50")),
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 14),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            # Thicker lines for 3x3 boxes
            ("LINEABOVE", (0, 3), (-1, 3), 2, colors.black),
            ("LINEABOVE", (0, 6), (-1, 6), 2, colors.black),
            ("LINEAFTER", (2, 0), (2, -1), 2, colors.black),
            ("LINEAFTER", (5, 0), (5, -1), 2, colors.black),
        ]))
        elements.append(grid_table)

    elif solution and result_data.get("puzzle_type") == "nqueens":
        elements.append(Paragraph("Solution Board", heading_style))
        n = len(solution)
        grid_data = [["Q" if cell == 1 else "." for cell in row] for row in solution]
        grid_table = Table(grid_data, colWidths=[0.45 * inch] * n, rowHeights=[0.45 * inch] * n)
        grid_table.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 1, colors.HexColor("#2c3e50")),
            ("FONTSIZE", (0, 0), (-1, -1), 16),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        elements.append(grid_table)

    elements.append(Spacer(1, 30))
    elements.append(Paragraph(
        "Generated by Intelligent Puzzle Solver — Capstone Project 2026",
        ParagraphStyle("Footer", parent=styles["Normal"], fontSize=9,
                       textColor=colors.gray, alignment=TA_CENTER)
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer
