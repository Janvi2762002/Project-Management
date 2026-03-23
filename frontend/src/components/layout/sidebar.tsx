import { Link } from "react-router-dom"
import "../../styles/layout.css"

function Sidebar() {
  return (
    <div className="sidebar">

      <h2 className="logo">Project Flow</h2>

      <nav className="sidebar-menu">

        <Link to="/dashboard">Dashboard</Link>
        <Link to="/projects">Projects</Link>


        <button
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem("token")
            window.location.href = "/login"
          }}
        >
          Logout
        </button>

      </nav>

    </div>
  )
}

export default Sidebar