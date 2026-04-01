import { useState, useRef, useEffect } from "react"
import { Bell } from "lucide-react"
import { useNotifications } from "../../hooks/useNotifications"
import NotificationDropdown from "../notifications/NotificationDropdown"
import "../../styles/notifications.css"

function Topbar() {
  const [showNotifications, setShowNotifications] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="topbar">

      <input
        className="search"
        placeholder="Search projects..."
      />

      <div className="topbar-right" style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative" }} ref={dropdownRef}>
        <button 
          className="nav-icon-btn" 
          onClick={() => setShowNotifications(!showNotifications)}
          style={{ width: "32px", height: "32px" }}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
          )}
        </button>

        {showNotifications && (
          <NotificationDropdown
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onClose={() => setShowNotifications(false)}
          />
        )}

        <div className="user">
          👤
        </div>
      </div>

    </div>
  )
}

export default Topbar