import { useNavigate } from "react-router-dom"
import type { Notification } from "../../hooks/useNotifications"

type Props = {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onClose: () => void
}

function NotificationDropdown({ notifications, onMarkAsRead, onMarkAllAsRead, onClose }: Props) {
  const navigate = useNavigate()

  const formatTime = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const handleItemClick = (n: Notification) => {
    if (!n.isRead) onMarkAsRead(n._id)
    onClose()
    
    if (n.taskId && n.projectId) {
      navigate(`/projects/${n.projectId}`)
    } else if (n.projectId) {
      navigate(`/projects/${n.projectId}`)
    } else if (n.taskId) {
        // Fallback or specific task view if needed
    }
  }

  return (
    <div className="notifications-dropdown" onClick={e => e.stopPropagation()}>
      <div className="notifications-header">
        <h3 className="notifications-title">Notifications</h3>
        {notifications.some(n => !n.isRead) && (
          <button className="notifications-mark-all" onClick={onMarkAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="notification-empty">No notifications yet.</div>
        ) : (
          notifications.map(n => (
            <div 
              key={n._id} 
              className={`notification-item ${n.isRead ? "" : "notification-unread"}`}
              onClick={() => handleItemClick(n)}
            >
              <div className="notification-message">{n.message}</div>
              <div className="notification-time">{formatTime(n.createdAt)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NotificationDropdown
