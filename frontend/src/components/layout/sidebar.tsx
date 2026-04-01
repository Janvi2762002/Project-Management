import { NavLink, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"

type DecodedToken = { userId: string; role: string; name: string }

function Sidebar() {
  const navigate = useNavigate()
  const [dark, setDark] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "dark"
  })

  const token = localStorage.getItem("token")
  const user = token ? (() => { try { return jwtDecode<DecodedToken>(token) } catch { return null } })() : null

  function getInitials(name: string) {
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
  }

  useEffect(() => {
    if (dark) {
      document.documentElement.setAttribute("data-theme", "dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.removeAttribute("data-theme")
      localStorage.setItem("theme", "light")
    }
  }, [dark])

  return (
    <div className="sidebar">

      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="4" width="12" height="9" rx="1.5" />
            <path d="M2 7h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" />
          </svg>
        </div>
        <h2 className="logo">ProjectFlow</h2>
      </div>

      {/* ── Navigation ── */}
      <div className="sidebar-nav-section">
        <div>
          <span className="sidebar-nav-label">Menu</span>
          <nav className="sidebar-menu">
            <NavLink to="/dashboard">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="1" width="6" height="6" rx="1.2" />
                <rect x="9" y="1" width="6" height="6" rx="1.2" />
                <rect x="1" y="9" width="6" height="6" rx="1.2" />
                <rect x="9" y="9" width="6" height="6" rx="1.2" />
              </svg>
              Dashboard
            </NavLink>

            <NavLink to="/projects">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="4" width="12" height="9" rx="1.5" />
                <path d="M2 7h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" />
              </svg>
              Projects
            </NavLink>
          </nav>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="sidebar-footer">

        {/* User chip */}
        {user && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
            padding: "8px 10px",
            borderRadius: "8px",
            marginBottom: "4px",
          }}>
            <div style={{
              width: "26px", height: "26px",
              borderRadius: "50%",
              background: "var(--accent-mid)",
              color: "var(--accent)",
              fontSize: "10px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              {getInitials(user.name)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name}
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "capitalize" }}>
                {user.role}
              </div>
            </div>
          </div>
        )}

        {/* Dark mode toggle */}
        <button className="theme-toggle-btn" onClick={() => setDark(d => !d)}>
          {dark ? (
            <>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="3" />
                <path d="M8 1.5V3M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" />
              </svg>
              Light mode
            </>
          ) : (
            <>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13.5 9.5A6 6 0 017 2 6 6 0 1013.5 9.5z" />
              </svg>
              Dark mode
            </>
          )}
        </button>

        {/* Logout */}
        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("token")
            localStorage.removeItem("role")
            navigate("/auth")
          }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" />
          </svg>
          Sign out
        </button>

      </div>
    </div>
  )
}

export default Sidebar