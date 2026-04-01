import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { registerUser } from "../api"

interface Props {
  onSwitchToLogin: () => void
}

function Register({ onSwitchToLogin }: Props) {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [role, setRole] = useState("user")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password) return
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      setSuccess("")
      return
    }

    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const data = await registerUser({ name, email, password, role })

      if (!data.token && !data.user) {
        setError(data.message || "Registration failed. Please try again.")
        return
      }

      setSuccess(data.message || "Account created successfully!")
      
      localStorage.setItem("token", data.token)
      localStorage.setItem("role", data.role)
      
      // Short delay to show success message
      setTimeout(() => {
        navigate("/dashboard")
      }, 1500)

    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h2 className="auth-heading">Create account</h2>
      <p className="auth-subheading">Get started for free today.</p>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success anim-fade-in">{success}</div>}

      <div className="auth-field">
        <label htmlFor="reg-name">Full Name</label>
        <input
          id="reg-name"
          type="text"
          placeholder="Your full name"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
      </div>

      <div className="auth-field">
        <label htmlFor="reg-email">Email</label>
        <input
          id="reg-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>

      <div className="auth-field">
        <label htmlFor="reg-password">Password</label>
        <input
          id="reg-password"
          type="password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
        />
      </div>

      <div className="auth-field">
        <label htmlFor="reg-role">Role</label>
        <div className="auth-select-wrap">
          <select
            id="reg-role"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <button
        className="auth-submit-btn"
        onClick={handleSubmit}
        disabled={loading || !name.trim() || !email.trim() || !password}
      >
        {loading ? "Creating account…" : "Create account"}
      </button>

      <div className="auth-footer">
        Already have an account?{" "}
        <button onClick={onSwitchToLogin}>Login</button>
      </div>
    </>
  )
}

export default Register