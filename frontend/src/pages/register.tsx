import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { registerUser } from "../api"
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material"

interface Props {
    onSwitchToLogin: () => void
}
function Register({ onSwitchToLogin }: Props) {
    const navigate = useNavigate()
    const [name, setName] = useState("")
    const [role, setRole] = useState("User")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {

        if (!name.trim() || !email.trim() || !password) return
        if (password.length < 8) {
            setError("Password must be at least 8 characters.")
            return
        }

        setError("")
        setLoading(true)

        try {

            const data = await registerUser({ name, email, password , role})

            if (!data.ok) {
                setError(data.message || "Registration failed. Please try again.")
                return
            }

            localStorage.setItem("token", data.token)
            navigate("/dashboard")
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

            {/* Email */}
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

            {/* Password */}
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

            <FormControl fullWidth size="small" className="auth-field">
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                    labelId="role-label"
                    value={role}
                    label="Role"
                    onChange={(e) => setRole(e.target.value)}
                >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                </Select>
            </FormControl>

        
            <button
                className="auth-submit-btn"
                onClick={handleSubmit}
                disabled={loading || !name.trim() || !email.trim() || !password}
            >
                {loading ? "Creating account…" : "Create account"}
            </button>

            <div className="auth-footer">
                Already have an account?{" "}
                <button onClick={onSwitchToLogin}>Sign in</button>
            </div>
        </>
    )
}

export default Register