import { useState, useEffect } from "react"
import { socket } from "../socketService"

export type Notification = {
  _id: string
  type: "task_assigned" | "comment_added" | "mention"
  message: string
  taskId?: string
  projectId?: string
  isRead: boolean
  createdAt: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const res = await fetch("http://localhost:5000/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (Array.isArray(data)) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.isRead).length)
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err)
    }
  }

  const markAsRead = async (id: string) => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      await fetch(`http://localhost:5000/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Failed to mark as read", err)
    }
  }

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      await fetch("http://localhost:5000/notifications/read-all", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error("Failed to mark all as read", err)
    }
  }

  useEffect(() => {
    fetchNotifications()

    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
    }

    socket.on("new_notification", handleNewNotification)

    return () => {
      socket.off("new_notification", handleNewNotification)
    }
  }, [])

  return { notifications, unreadCount, markAsRead, markAllAsRead, refresh: fetchNotifications }
}
