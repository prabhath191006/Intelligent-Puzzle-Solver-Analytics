import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: "/", label: "Home", icon: "🏠" },
    { to: "/select", label: "Puzzles", icon: "🧩" },
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/reports", label: "Reports", icon: "📄" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <NavLink to="/" className="navbar-brand">
          <span className="brand-icon">🧠</span>
          <span className="brand-text">PuzzleSolver</span>
        </NavLink>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="navbar-toggle-btn"
        >
          <span className={`hamburger ${menuOpen ? "open" : ""}`}></span>
        </button>

        <ul className={`navbar-links ${menuOpen ? "active" : ""}`}>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
                id={`nav-${link.label.toLowerCase()}`}
              >
                <span className="nav-icon">{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 72px;
          background: rgba(10, 14, 26, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-subtle);
          z-index: 1000;
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
        }
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          text-decoration: none;
        }
        .brand-icon {
          font-size: 1.5rem;
        }
        .brand-text {
          background: var(--gradient-hero);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .navbar-links {
          display: flex;
          list-style: none;
          gap: 4px;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        .nav-link:hover {
          color: var(--text-primary);
          background: rgba(59, 130, 246, 0.1);
        }
        .nav-link.active {
          color: var(--accent-blue);
          background: rgba(59, 130, 246, 0.15);
        }
        .nav-icon {
          font-size: 1rem;
        }
        .navbar-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
        }
        .hamburger {
          display: block;
          width: 24px;
          height: 2px;
          background: var(--text-primary);
          position: relative;
          transition: all 0.3s;
        }
        .hamburger::before, .hamburger::after {
          content: '';
          position: absolute;
          width: 24px;
          height: 2px;
          background: var(--text-primary);
          transition: all 0.3s;
        }
        .hamburger::before { top: -7px; }
        .hamburger::after { top: 7px; }
        .hamburger.open { background: transparent; }
        .hamburger.open::before { top: 0; transform: rotate(45deg); }
        .hamburger.open::after { top: 0; transform: rotate(-45deg); }

        @media (max-width: 768px) {
          .navbar-toggle { display: block; }
          .navbar-links {
            position: absolute;
            top: 72px;
            left: 0;
            right: 0;
            flex-direction: column;
            background: rgba(10, 14, 26, 0.98);
            backdrop-filter: blur(20px);
            padding: 16px;
            border-bottom: 1px solid var(--border-subtle);
            display: none;
          }
          .navbar-links.active { display: flex; }
        }
      `}</style>
    </nav>
  );
}
