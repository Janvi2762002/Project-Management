import { useState } from "react"

import Login from "./login"
import Register from "./register"

type Panel = "login" | "register"

function AuthPage() {
  const [panel, setPanel] = useState<Panel>("login")

  return (
    <div className="auth-page">

      {/* ── Left: branding ── */}
      <div className="auth-left">
        <div className="auth-brand">
          <span className="auth-brand-dot" />
          <span className="auth-brand-name">Fullstack App</span>
        </div>

        <div className="auth-left-body">
          <h1 className="auth-tagline">
            Manage your work,<br />
            <span className="auth-tagline-accent">ship faster.</span>
          </h1>
          <p className="auth-left-desc">
            Track projects, assign tasks, hit deadlines.<br />
            Everything your team needs in one place.
          </p>
        </div>

        <div className="auth-indicators">
          <span className="auth-indicator active" />
          <span className="auth-indicator" />
          <span className="auth-indicator" />
        </div>
      </div>

      {/* ── Right: form ── */}
      <div className="auth-right">
        <div className="auth-form-wrap">

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
            <Login />
          ) : (
            <Register onSwitchToLogin={() => setPanel("login")} />
          )}

        </div>
      </div>

    </div>
  )
}

export default AuthPage