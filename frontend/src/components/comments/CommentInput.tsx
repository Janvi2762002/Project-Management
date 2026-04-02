import React, { useState, useRef } from "react"
import { Send, Smile, Paperclip } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import EmojiPicker from "../common/EmojiPicker"
import FilePreview from "../common/FilePreview"


type Props = {
  onSubmit: (text: string, files: File[]) => void
  onTyping: (isTyping: boolean) => void
  typingUser: string | null
}

function CommentInput({ onSubmit, onTyping, typingUser }: Props) {
  const [text, setText] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    onTyping(e.target.value.length > 0)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

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

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim() || files.length > 0) {
      onSubmit(text, files)
      setText("")
      setFiles([])
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
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
        />
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-slate-400 hover:text-primary-500 transition-colors"
        >
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

        <div className="flex items-center gap-1 relative">
          <button 
            type="button" 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-slate-400 hover:text-amber-500 transition-colors"
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
            type="submit"
            disabled={!text.trim() && files.length === 0}
            className={`comment-submit-btn ${text.trim() || files.length > 0 ? "comment-submit-active" : "comment-submit-disabled"}`}
          >
            <Send size={16} strokeWidth={2.5} />
          </button>
        </div>
      </form>
      <FilePreview files={files} onRemove={removeFile} />
    </div>
  )
}

export default CommentInput
