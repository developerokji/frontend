import React, { useState, useEffect, useRef } from 'react';
import './ServiceStyles.css';

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = 'Enter content...', 
  label, 
  required = false,
  error,
  icon,
  height = '200px'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value || '');
  const editorRef = useRef(null);

  useEffect(() => {
    setHtmlContent(value || '');
  }, [value]);

  const handleContentChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setHtmlContent(content);
      onChange(content);
    }
  };

  const handleInput = (e) => {
    // Prevent reverse typing by ensuring cursor position
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      // Force cursor to stay at correct position
      setTimeout(() => {
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }, 0);
    }
    handleContentChange();
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    handleContentChange();
    editorRef.current?.focus();
  };

  const createLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const Toolbar = () => (
    <div className="rich-editor-toolbar">
      <div className="btn-group btn-group-sm me-2 mb-2">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => execCommand('bold')}
          title="Bold"
        >
          <i className="bi bi-type-bold"></i>
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => execCommand('italic')}
          title="Italic"
        >
          <i className="bi bi-type-italic"></i>
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => execCommand('underline')}
          title="Underline"
        >
          <i className="bi bi-type-underline"></i>
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => execCommand('strikeThrough')}
          title="Strikethrough"
        >
          <i className="bi bi-type-strikethrough"></i>
        </button>
      </div>

      <div className="btn-group btn-group-sm me-2 mb-2">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => execCommand('formatBlock', '<h1>')}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => execCommand('formatBlock', '<h2>')}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => execCommand('formatBlock', '<h3>')}
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => execCommand('formatBlock', '<p>')}
          title="Paragraph"
        >
          P
        </button>
      </div>

      <div className="btn-group btn-group-sm me-2 mb-2">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => execCommand('justifyLeft')}
          title="Align Left"
        >
          <i className="bi bi-text-left"></i>
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => execCommand('justifyCenter')}
          title="Align Center"
        >
          <i className="bi bi-text-center"></i>
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => execCommand('justifyRight')}
          title="Align Right"
        >
          <i className="bi bi-text-right"></i>
        </button>
      </div>

      <div className="btn-group btn-group-sm me-2 mb-2">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => execCommand('insertUnorderedList')}
          title="Bullet List"
        >
          <i className="bi bi-list-ul"></i>
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => execCommand('insertOrderedList')}
          title="Numbered List"
        >
          <i className="bi bi-list-ol"></i>
        </button>
      </div>

      <div className="btn-group btn-group-sm me-2 mb-2">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={createLink}
          title="Insert Link"
        >
          <i className="bi bi-link-45deg"></i>
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={insertImage}
          title="Insert Image"
        >
          <i className="bi bi-image"></i>
        </button>
      </div>

      <div className="btn-group btn-group-sm mb-2">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => execCommand('undo')}
          title="Undo"
        >
          <i className="bi bi-arrow-counterclockwise"></i>
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => execCommand('redo')}
          title="Redo"
        >
          <i className="bi bi-arrow-clockwise"></i>
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => execCommand('removeFormat')}
          title="Clear Formatting"
        >
          <i className="bi bi-eraser"></i>
        </button>
      </div>
    </div>
  );

  return (
    <div className="mb-4">
      {label && (
        <label className="form-label fw-medium">
          {icon && <i className={`${icon} me-2`}></i>}
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      
      <div className={`border rounded ${error ? 'border-danger' : 'border-light-subtle'} rich-editor-container`}>
        <Toolbar />
        <div
          ref={editorRef}
          className="rich-editor-content"
          style={{ minHeight: height }}
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsEditing(true)}
          onBlur={() => {
            setIsEditing(false);
            handleContentChange();
          }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          data-placeholder={placeholder}
        />
      </div>
      
      {error && (
        <div className="invalid-feedback d-block mt-1">
          <i className="bi bi-exclamation-triangle me-1"></i>
          {error}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
