import React, { useState, useRef } from "react"
import { Send, Smile, Paperclip } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"


type Props = {
  onSubmit: (text: string) => void
  onTyping: (isTyping: boolean) => void
  typingUser: string | null
}

function CommentInput({ onSubmit, onTyping, typingUser }: Props) {
  const [text, setText] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    onTyping(e.target.value.length > 0)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      onSubmit(text)
      setText("")
      onTyping(false)
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="comment-composer">
      {/* Typing indicator */}
      <div className="typing-indicator-wrap">
        <AnimatePresence>
          {typingUser && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="typing-indicator"
            >
              <div className="flex gap-1">
                <span className="typing-dot" style={{ animationDelay: '0ms' }} />
                <span className="typing-dot" style={{ animationDelay: '150ms' }} />
                <span className="typing-dot" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-[10px] text-slate-400 font-bold tracking-tight italic">
                {typingUser} is typing...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit} className="comment-input-form">
        <button type="button" className="p-2 text-slate-400 hover:text-primary-500 transition-colors">
          <Paperclip size={18} />
        </button>
        
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment..."
          className="comment-textarea"
          rows={1}
        />

        <div className="flex items-center gap-1">
          <button type="button" className="p-2 text-slate-400 hover:text-amber-500 transition-colors">
            <Smile size={18} />
          </button>
          
          <button
            type="submit"
            disabled={!text.trim()}
            className={`comment-submit-btn ${text.trim() ? "comment-submit-active" : "comment-submit-disabled"}`}
          >
            <Send size={16} strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  )
}

export default CommentInput
