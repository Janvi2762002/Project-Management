import { useState, useEffect } from "react"
import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react"
import { MessageSquare, X } from "lucide-react"
import CommentList from "./CommentList"
import CommentInput from "./CommentInput"
import type { Comment } from "./types"
import { io, Socket } from "socket.io-client"


// Assuming socket is initialized globally or passed via context
const SOCKET_URL = "http://localhost:5000"

type Props = {
  taskId: string
  comments: Comment[]
  currentUserName: string | null
  canComment: boolean
  onAddComment: (text: string) => void
  onDeleteComment?: (commentId: string) => void
  onEditComment?: (commentId: string, newText: string) => void
}

function CommentPopover({
  taskId,
  comments,
  currentUserName,
  canComment,
  onAddComment,
  onDeleteComment,
  onEditComment,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [typingUser, setTypingUser] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const newSocket = io(SOCKET_URL)
    setSocket(newSocket)

    newSocket.emit("join_task_comments", taskId)

    newSocket.on("user_typing_comment", (data: { taskId: string; userName: string }) => {
      if (data.taskId === taskId && data.userName !== currentUserName) {
        setTypingUser(data.userName)
      }
    })

    newSocket.on("user_stopped_typing_comment", (data: { taskId: string; userName: string }) => {
      if (data.taskId === taskId) {
        setTypingUser(null)
      }
    })

    return () => {
      newSocket.disconnect()
    }
  }, [isOpen, taskId, currentUserName])

  const handleTyping = (isTyping: boolean) => {
    if (socket && currentUserName) {
      if (isTyping) {
        socket.emit("typing_comment", { taskId, userName: currentUserName })
      } else {
        socket.emit("stop_typing_comment", { taskId, userName: currentUserName })
      }
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`comment-popover-trigger ${isOpen ? "comment-popover-trigger-open" : "comment-popover-trigger-closed"}`}
      >
        <MessageSquare size={15} fill={isOpen ? "currentColor" : "none"} className={isOpen ? "opacity-10" : ""} />
        {comments.length > 0 && (
          <span className="activity-total-val">{comments.length}</span>
        )}
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        transition
        className="relative z-[9999] transition duration-300 ease-out data-[closed]:opacity-0"
      >
        {/* Backdrop Dimmer */}
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition duration-300 ease-out data-[closed]:opacity-0"
        />

        {/* Modal Container */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel
            transition
            className="comment-modal-panel transition duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 data-[closed]:translate-y-4"
          >
            <div className="comment-popover-inner">
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="comment-popover-close"
              >
                <X size={15} strokeWidth={3} />
              </button>

              <CommentList
                comments={comments}
                currentUserName={currentUserName}
                onDelete={onDeleteComment}
                onEdit={onEditComment}
              />

              {canComment && (
                <CommentInput
                  onSubmit={(text) => {
                    onAddComment(text)
                  }}
                  onTyping={handleTyping}
                  typingUser={typingUser}
                />
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}

export default CommentPopover
