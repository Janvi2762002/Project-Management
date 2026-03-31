import { useState } from "react"
import CommentItem from "./CommentItem"
import CommentInput from "./CommentInput"
import type { Comment } from "./types"


type Props = {
  comments: Comment[]
  currentUserName: string | null
  canComment: boolean
  onAddComment: (text: string) => void
  onDeleteComment?: (commentId: string) => void
}

function CommentThread({
  comments,
  currentUserName,
  canComment,
  onAddComment,
  onDeleteComment,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showInput, setShowInput] = useState(false)

  const totalComments = comments.length
  const hasComments = totalComments > 0

  // Show only the latest comment when collapsed, all when expanded
  const visibleComments = isExpanded ? comments : comments.slice(-1)
  const hiddenCount = totalComments - 1

  const handleSubmit = (text: string) => {
    onAddComment(text)
    setShowInput(false)
    setIsExpanded(true) // show all after adding
  }

  return (
    <div className="cmt-thread">
      {/* Header with count + toggle */}
      {hasComments && (
        <div className="cmt-thread-header">
          <div className="cmt-thread-label">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M2 3h12v8a1 1 0 01-1 1H5l-3 2.5V4a1 1 0 011-1z" />
            </svg>
            <span>
              {totalComments} comment{totalComments !== 1 ? "s" : ""}
            </span>
          </div>

          {hiddenCount > 0 && (
            <button
              className="cmt-toggle-btn"
              onClick={() => setIsExpanded((p) => !p)}
            >
              {isExpanded
                ? "Show less"
                : `View ${hiddenCount} more comment${hiddenCount !== 1 ? "s" : ""}`}
              <svg
                className={`cmt-chevron${isExpanded ? " cmt-chevron--up" : ""}`}
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M2 4l4 4 4-4" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Comment list */}
      {hasComments && (
        <div className={`cmt-list${isExpanded ? " cmt-list--expanded" : ""}`}>
          {visibleComments.map((comment, i) => (
            <CommentItem
              key={comment._id ?? i}
              comment={comment}
              isCurrentUser={
                currentUserName !== null &&
                (comment.user?.name === currentUserName)
              }
              onDelete={onDeleteComment}
            />
          ))}
        </div>
      )}

      {/* Add comment button / input */}
      {canComment && (
        <div className="cmt-composer">
          {showInput ? (
            <CommentInput
              onSubmit={handleSubmit}
              onTyping={() => {}}
              typingUser={null}
            />
          ) : (
            <button
              className="cmt-add-trigger"
              onClick={() => setShowInput(true)}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 3v10M3 8h10" />
              </svg>
              Add a comment
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default CommentThread
