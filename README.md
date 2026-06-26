# Intelligent Puzzle Solver
### Using Backtracking and Brute Force Algorithms

> **DAA Capstone Project 2026** — A full-stack web application for solving, visualizing, and analyzing classic computational puzzles.

---

## 🧩 Supported Puzzles

| Puzzle | Description | Sizes |
|--------|-------------|-------|
| **Sudoku** | 9×9 constraint satisfaction | 9×9 |
| **N-Queens** | Queen placement on NxN board | 4–12 |
| **Knight's Tour** | Hamiltonian path on chessboard | 5–8 |

## 🏗️ Architecture

```
User → React Frontend → Flask REST API → Algorithm Engine → MongoDB
                                              ↓
                                    Backtracking | Brute Force
                                              ↓
                                    Performance Tracker → Analytics
```

## 🛠️ Tech Stack

- **Frontend:** React + Vite, Chart.js, Axios
- **Backend:** Python 3, Flask, Flask-CORS
- **Database:** MongoDB
- **Testing:** Pytest
- **Deployment:** Docker, Docker Compose

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB running on `localhost:27017`

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker (Full Stack)
```bash
docker-compose up --build
```

## 📁 Project Structure

```
├── backend/
│   ├── app.py              # Flask entry point
│   ├── config.py            # Configuration manager
│   ├── algorithms/          # Backtracking & Brute Force engines
│   ├── routes/              # REST API endpoints
│   ├── models/              # MongoDB document schemas
│   ├── utils/               # Validators, report generator
│   └── tests/               # Pytest test suite
├── frontend/
│   └── src/
│       ├── pages/           # Home, PuzzleSelect, Input, Visualization, Dashboard, Reports
│       ├── components/      # SudokuGrid, NQueensBoard, Charts, Navbar
│       └── services/        # API client
├── docker-compose.yml
├── Dockerfile.backend
└── Dockerfile.frontend
```

## 🧪 Testing

```bash
cd backend
pytest tests/ -v
```

## 📊 Features

- ✅ Interactive puzzle input with keyboard navigation
- ✅ Real-time solve with performance metrics
- ✅ Side-by-side algorithm comparison
- ✅ Performance dashboard with Chart.js
- ✅ PDF report generation
- ✅ CSV data export
- ✅ MongoDB persistence
- ✅ Docker containerization

## 📄 License

Academic use — Capstone Project 2026
