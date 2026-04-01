import { useState, useEffect } from "react"
import Login from "./login"
import Register from "./register"

type Panel = "login" | "register"

function AuthPage() {
  const [panel, setPanel] = useState<Panel>("login")
  const [showExpiredAlert, setShowExpiredAlert] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("expired") === "true") {
      setShowExpiredAlert(true)
      // Clean up URL without refreshing
      window.history.replaceState({}, document.title, "/")
    }
  }, [])

  return (
    <div className="auth-page">

      {/* ── Left: Branding ── */}
      <div className="auth-left">
        <div className="auth-brand">
          <span className="auth-brand-dot" />
          <span className="auth-brand-name">ProjectFlow</span>
        </div>

        <div className="auth-left-body">
          <h1 className="auth-tagline">
            Manage work,<br />
            <span className="auth-tagline-accent">ship faster.</span>
          </h1>
          <p className="auth-left-desc">
            Track projects, assign tasks, hit deadlines.<br />
            Everything your team needs in one place.
          </p>
        </div>

        <div className="auth-features">
          <div className="auth-feature-pill">
            <div className="auth-feature-pill-icon">📋</div>
            <span className="auth-feature-pill-text">Kanban board with drag & drop</span>
          </div>
          <div className="auth-feature-pill">
            <div className="auth-feature-pill-icon">💬</div>
            <span className="auth-feature-pill-text">Real-time team chat & comments</span>
          </div>
          <div className="auth-feature-pill">
            <div className="auth-feature-pill-icon">📊</div>
            <span className="auth-feature-pill-text">Progress analytics & insights</span>
          </div>
        </div>

        <div className="auth-indicators">
          <span className="auth-indicator active" />
          <span className="auth-indicator" />
          <span className="auth-indicator" />
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          {showExpiredAlert && (
            <div className="auth-alert fade-in">
              <div className="auth-alert-icon">⚠️</div>
              <div className="auth-alert-body">
                <p className="auth-alert-title">Session Expired</p>
                <p className="auth-alert-desc">Please sign in again to continue.</p>
              </div>
              <button 
                className="auth-alert-close" 
                onClick={() => setShowExpiredAlert(false)}
              >
                &times;
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab${panel === "login" ? " active" : ""}`}
              onClick={() => setPanel("login")}
            >
              Sign in
            </button>
            <button
              className={`auth-tab${panel === "register" ? " active" : ""}`}
              onClick={() => setPanel("register")}
            >
              Register
            </button>
          </div>

          {/* Panel */}
          {panel === "login" ? (
            <Login onSwitchToRegister={() => setPanel("register")} />
          ) : (
            <Register onSwitchToLogin={() => setPanel("login")} />
          )}

        </div>
      </div>

    </div>
  )
}

export default AuthPage