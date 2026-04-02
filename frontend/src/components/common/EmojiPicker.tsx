import React from "react";
import { motion } from "framer-motion";

const COMMON_EMOJIS = [
  "👍", "❤️", "✅", "🚀", "🔥", "✨", "🎉", "😊", "😂", "😮", 
  "😢", "🙏", "👀", "📍", "⏰", "🙌", "💪", "💡", "🤔", "👏"
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="emoji-picker-popover"
      style={{
        position: 'absolute',
        bottom: '100%',
        right: 0,
        marginBottom: '8px',
        backgroundColor: 'var(--surface, white)',
        border: '1px solid var(--border, #e2e8f0)',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        padding: '12px',
        zIndex: 1000,
        width: '240px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #64748b)' }}>Recently used</span>
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', cursor: 'pointer' }}
        >
          ×
        </button>
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: '4px' 
      }}>
        {COMMON_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            style={{
              fontSize: '20px',
              padding: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover, #f1f5f9)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {emoji}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default EmojiPicker;
