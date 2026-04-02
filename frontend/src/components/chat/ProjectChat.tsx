import { useEffect, useState, useRef } from "react"
import { io, Socket } from "socket.io-client"
import { Smile, Paperclip, File, Download } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import EmojiPicker from "../common/EmojiPicker"
import FilePreview from "../common/FilePreview"
import { uploadChatFiles } from "../../api"


type Message = {
  _id?: string
  text: string
  project: string
  user: {
    _id: string
    name: string
  }
  attachments?: {
    name: string
    url: string
    fileType: string
    size: number
  }[]
  createdAt: string
}

type Props = {
  projectId: string
  currentUserId: string | null
  currentUserName: string | null
  onClose: () => void
}

function ProjectChat({ projectId, currentUserId, currentUserName, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  
  const socketRef = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Format timestamp
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ""
    }
  }

  // Filesize formatter
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Helper to get initials
  const getInitials = (name: string) => {
    if (!name) return "??"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  // 1. Fetch initial history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`http://localhost:5000/chat/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setMessages(data)
        }
      } catch (err) {
        console.error("Failed to load history", err)
      }
    }
    loadHistory()
  }, [projectId])

  // 2. Setup Socket
  useEffect(() => {
    const socket = io("http://localhost:5000")
    socketRef.current = socket

    socket.on("connect", () => {
      setIsConnected(true)
      socket.emit("join_project", projectId)
    })

    socket.on("disconnect", () => {
      setIsConnected(false)
    })

    socket.on("receive_message", (data: Message) => {
      // Data arrives in full Message format from backend
      setMessages(prev => [...prev, data])
    })

    return () => {
      socket.disconnect()
    }
  }, [projectId])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleEmojiSelect = (emoji: string) => {
    const cursor = textareaRef.current?.selectionStart || 0
    const newText = text.slice(0, cursor) + emoji + text.slice(cursor)
    setText(newText)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const handleSend = async () => {
    if ((!text.trim() && files.length === 0) || !currentUserId || !currentUserName || isUploading) return

    let attachments = []
    if (files.length > 0) {
      setIsUploading(true)
      try {
        const formData = new FormData()
        files.forEach(f => formData.append("attachments", f))
        attachments = await uploadChatFiles(formData)
      } catch (err) {
        console.error("Upload failed", err)
        setIsUploading(false)
        return
      }
    }

    const newMsg = {
      project: projectId,
      user: currentUserId,
      userName: currentUserName,
      text: text.trim(),
      attachments
    }

    // Send to socket (Backend will save and broadcast)
    socketRef.current?.emit("send_message", newMsg)
    setText("")
    setFiles([])
    setIsUploading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <div className="chat-overlay" onClick={onClose} />

      <div className="chat-drawer" onClick={e => e.stopPropagation()}>
        <div className="chat-header">
          <div>
            <h3 className="chat-title">Team Chat</h3>
            <span className="chat-status">
              {isConnected ? (
                <><span className="status-dot online"></span> Active now</>
              ) : (
                <><span className="status-dot offline"></span> Disconnected</>
              )}
              {isUploading && <span style={{ marginLeft: '10px', fontSize: '11px', color: '#6366f1' }}>Uploading files...</span>}
            </span>
          </div>
          <button className="chat-close-btn" onClick={onClose}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        <div className="chat-list">
          {messages.length === 0 && (
            <div className="chat-empty">
              <div className="chat-empty-icon">💬</div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const isMine = msg.user._id === currentUserId
            const prevMsg = messages[i - 1]
            const isConsecutive = prevMsg && prevMsg.user._id === msg.user._id && 
                                 (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()) < 60000 // 1 minute limit for grouping

            return (
              <div key={msg._id || i} className={`chat-item${isMine ? " chat-item--mine" : " chat-item--other"}${isConsecutive ? " chat-item--consecutive" : ""}`}>
                {!isConsecutive && (
                  <div className="chat-avatar">
                    {getInitials(msg.user.name)}
                  </div>
                )}
                
                <div className="chat-bubble-wrap">
                  {!isConsecutive && (
                    <div className="chat-msg-info">
                      <span className="chat-author">{isMine ? "You" : msg.user.name}</span>
                      <span className="chat-time">{formatTime(msg.createdAt)}</span>
                    </div>
                  )}
                  <div className="chat-bubble">
                    <div className="chat-text">{msg.text}</div>
                    
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="chat-attachments">
                        {msg.attachments.map((file, idx) => (
                          <div key={idx} className="chat-file-card">
                            <div className="file-icon-wrap">
                              {file.fileType.startsWith('image/') ? (
                                <img src={`http://localhost:5000${file.url}`} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                              ) : (
                                <File size={18} />
                              )}
                            </div>
                            <div className="file-info">
                              <span className="file-name">{file.name}</span>
                              <span className="file-size">{formatSize(file.size)}</span>
                            </div>
                            <a 
                              href={`http://localhost:5000${file.url}`} 
                              download={file.name} 
                              target="_blank" 
                              rel="noreferrer"
                              className="file-dl-btn"
                            >
                              <Download size={14} />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}

                    {isConsecutive && (
                       <span className="chat-time-mini">{formatTime(msg.createdAt)}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-footer">
          <input 
            type="file" 
            multiple 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          <FilePreview files={files} onRemove={(idx) => setFiles(prev => prev.filter((_, i) => i !== idx))} />
          
          <div className="chat-input-wrapper">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="chat-action-btn"
            >
              <Paperclip size={18} />
            </button>

            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder="Message your team..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />

            <div className="chat-input-right">
              <button 
                type="button" 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="chat-action-btn"
              >
                <Smile size={18} />
              </button>
              
              <AnimatePresence>
                {showEmojiPicker && (
                  <EmojiPicker 
                    onSelect={handleEmojiSelect} 
                    onClose={() => setShowEmojiPicker(false)} 
                  />
                )}
              </AnimatePresence>

              <button 
                className="chat-send-btn" 
                onClick={handleSend}
                disabled={(!text.trim() && files.length === 0) || !isConnected || isUploading}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProjectChat
