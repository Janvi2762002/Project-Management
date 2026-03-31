import { useEffect, useRef } from "react"
import { MessageSquareText } from "lucide-react"
import CommentItem from "./CommentItem"
import type { Comment } from "./types"


type Props = {
  comments: Comment[]
  currentUserName: string | null
  onDelete?: (commentId: string) => void
  onEdit?: (commentId: string, newText: string) => void
}

function CommentList({ 
  comments, 
  currentUserName, 
  onDelete: onDeleteComment, 
  onEdit: onEditComment 
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new comments
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [comments])

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-slate-50/50">
      {/* Header */}
      <div className="activity-header">
        <div className="activity-header-left">
          <div className="activity-header-icon">
            <MessageSquareText size={20} />
          </div>
          <div className="flex flex-col">
            <h3 className="activity-header-title">
              Task Activity
            </h3>
            <p className="activity-header-subtitle">
              Updates & Feedback
            </p>
          </div>
        </div>
        {/* Adjusted margin to clear the absolute-positioned close button */}
        <div className="activity-total-badge">
          <span className="activity-total-val">{comments.length}</span>
          <span className="activity-total-label">Total</span>
        </div>
      </div>

      {/* List */}
      <div 
        ref={scrollRef}
        className="activity-list"
      >
        {comments.length === 0 ? (
          <div className="activity-empty-state">
            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50">
              <MessageSquareText size={40} className="text-slate-200" />
            </div>
            <div className="space-y-1">
              <p className="text-[13px] font-bold text-slate-600">No activity yet</p>
              <p className="text-[11px] leading-relaxed">Be the first to share your thoughts<br/>or give feedback on this task.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {comments.map((comment, i) => (
              <CommentItem
                key={comment._id ?? i}
                comment={comment}
                isCurrentUser={
                  currentUserName !== null &&
                  (comment.user?.name === currentUserName)
                }
                onDelete={onDeleteComment}
                onEdit={onEditComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentList
