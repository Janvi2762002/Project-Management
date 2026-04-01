import { useEffect, type ReactNode } from "react"
import Sidebar from "./sidebar"
import Topbar from "./topbar"
import { socket } from "../../socketService"
import { jwtDecode } from "jwt-decode"

type Props = {
  children: ReactNode
}

type DecodedToken = {
  userId: string
  role: string
  name: string
  exp: number
}

function Layout({ children }: Props) {
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token)
        
        // Proactive expiration check
        const now = Date.now() / 1000
        if (decoded.exp < now) {
          localStorage.removeItem("token")
          window.location.href = "/?expired=true"
          return
        }

        socket.emit("register_user", decoded.userId)
      } catch (err) {
        console.error("Failed to decode token for socket registration", err)
      }
    }
  }, [])

  return (
    <div className="layout">

      <Sidebar />

      <div className="main">

        <Topbar />

        <div className="content">
          {children}
        </div>

      </div>

    </div>
  )
}

export default Layout