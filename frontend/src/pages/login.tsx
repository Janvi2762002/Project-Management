// import { useState } from "react";
// import { loginUser } from "../api";
// import { useNavigate } from "react-router-dom";
// import "../styles/auth.css";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const data = await loginUser({ email, password });

//       if (data.token) {
//         localStorage.setItem("token", data.token);
//         navigate("/projects");
//       } else {
//         setError("Invalid credentials");
//       }
//     } catch {
//       setError("Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">

//         <h2 className="auth-title">Project Manager</h2>
//         <p className="auth-subtitle">Sign in to your account</p>

//         {error && <p className="auth-error">{error}</p>}

//         <input
//           className="auth-input"
//           placeholder="Email"
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         <input
//           className="auth-input"
//           placeholder="Password"
//           type="password"
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <button
//           className="auth-button"
//           onClick={handleLogin}
//           disabled={loading}
//         >
//           {loading ? "Signing in..." : "Login"}
//         </button>

//       </div>
//     </div>
//   );
// }

// export default Login;



import { useState } from "react"
import { loginUser } from "../api"
import { useNavigate } from "react-router-dom"

function Login() {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")

  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      setLoading(true)
      setError("")

      const data = await loginUser({ email, password })

      if (data.token) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("role",data.role)
        navigate("/projects")
      } else {
        setError("Invalid credentials")
      }
    } catch {
      setError("Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h2 className="auth-heading">Welcome back</h2>
      <p className="auth-subheading">Sign in to your account to continue.</p>

      {error && <div className="auth-error">{error}</div>}

      <div className="auth-field">
        <label>Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          autoFocus
        />
      </div>

      <div className="auth-field">
        <label>Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
        />
      </div>

      <button
        className="auth-submit-btn"
        onClick={handleLogin}
        disabled={loading || !email.trim() || !password}
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </>
  )
}

export default Login