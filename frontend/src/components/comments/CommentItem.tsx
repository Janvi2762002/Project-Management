import { useState } from "react"
import { Trash2, Edit2, Check, X, File, Download } from "lucide-react"


type Comment = {
  _id?: string
  text: string
  user: {
    _id?: string
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
  comment: Comment
  isCurrentUser: boolean
  onDelete?: (commentId: string) => void
  onEdit?: (commentId: string, newText: string) => void
}

function CommentItem({ comment, isCurrentUser, onDelete, onEdit }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.text)

  const handleUpdate = () => {
    if (editText.trim() && editText !== comment.text) {
      onEdit?.(comment._id!, editText)
    }
    setIsEditing(false)
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className={`comment-item ${isCurrentUser ? "comment-item-mine" : "comment-item-other"}`}>
      {/* Header */}
      <div className="comment-meta">
        <span className={`comment-author ${isCurrentUser ? "comment-author-mine" : "comment-author-other"}`}>
          {isCurrentUser ? "You" : comment.user.name}
        </span>
        <span className="comment-time">
          {formatTime(comment.createdAt)}
        </span>
      </div>

      {/* Content */}
      <div className="relative group mt-1">
        {isEditing ? (
          <div className="flex flex-col gap-2.5 mt-1.5">
            <textarea
              className="comment-textarea border border-primary-200 rounded-xl p-2.5 bg-white min-h-[60px]"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-1.5">
              <button
                onClick={() => setIsEditing(false)}
                className="comment-action-btn hover:bg-slate-100"
                title="Cancel"
              >
                <X size={15} />
              </button>
              <button
                onClick={handleUpdate}
                className="comment-submit-btn comment-submit-active scale-90"
                title="Save"
              >
                <Check size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div className="comment-content-wrap">
            <p className="comment-text">
              {comment.text}
            </p>
            
            {comment.attachments && comment.attachments.length > 0 && (
              <div className="comment-attachments-list">
                {comment.attachments.map((file, idx) => (
                  <div key={idx} className="comment-file-card">
                    <div className="comment-file-icon">
                      {file.fileType.startsWith('image/') ? (
                        <img 
                          src={`http://localhost:5000${file.url}`} 
                          alt={file.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} 
                        />
                      ) : (
                        <File size={16} />
                      )}
                    </div>
                    <div className="comment-file-info">
                      <div className="comment-file-name" title={file.name}>{file.name}</div>
                      <div className="comment-file-size">{formatSize(file.size)}</div>
                    </div>
                    <a 
                      href={`http://localhost:5000${file.url}`} 
                      download={file.name} 
                      target="_blank" 
                      rel="noreferrer"
                      className="comment-file-download"
                    >
                      <Download size={12} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hover Actions - More discreet */}
        {!isEditing && isCurrentUser && (
          <div className="comment-actions-wrap">
            <button
              onClick={() => setIsEditing(true)}
              className="comment-action-btn comment-action-edit"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={() => onDelete?.(comment._id!)}
              className="comment-action-btn comment-action-delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentItem
