import React from "react";
import { X, File, Image as ImageIcon, FileText } from "lucide-react";

interface FilePreviewProps {
  files: File[];
  onRemove: (index: number) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ files, onRemove }) => {
  if (files.length === 0) return null;

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon size={16} />;
    if (type.includes("pdf") || type.includes("word") || type.includes("text")) return <FileText size={16} />;
    return <File size={16} />;
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '8px', 
      padding: '8px 12px', 
      borderTop: '1px solid var(--border)',
      backgroundColor: 'var(--surface)'
    }}>
      {files.map((file, index) => (
        <div 
          key={index} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            backgroundColor: 'var(--surface-hover, #f1f5f9)', 
            padding: '4px 8px', 
            borderRadius: '6px', 
            fontSize: '12px', 
            border: '1px solid var(--border)' 
          }}
        >
          <span style={{ color: 'var(--primary, #4f46e5)' }}>{getFileIcon(file.type)}</span>
          <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {file.name}
          </span>
          <button 
            type="button"
            onClick={() => onRemove(index)}
            style={{ background: 'none', border: 'none', padding: 0, color: '#ef4444', cursor: 'pointer', display: 'flex' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FilePreview;
