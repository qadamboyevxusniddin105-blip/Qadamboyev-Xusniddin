import React, { useRef, useState, useEffect } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link,
  Image,
  Minus,
  Code,
  Undo,
  Redo,
  Eye,
  FileCode,
  HelpCircle
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write the article in rich editorial prose...',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'html' | 'preview'>('visual');
  const [rawHtml, setRawHtml] = useState(value);

  // Sync incoming value to editor content if changed externally and not focused
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setRawHtml(value);
  }, [value]);

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    handleEditorInput();
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setRawHtml(html);
      onChange(html);
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Enter external destination URL (https://...):', 'https://');
    if (url && url !== 'https://') {
      executeCommand('createLink', url);
    }
  };

  const handleInsertImage = () => {
    const url = prompt('Enter direct image URL (https://...):', 'https://images.unsplash.com/');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  const handleFormatBlock = (tag: string) => {
    executeCommand('formatBlock', `<${tag}>`);
  };

  const handleRawHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setRawHtml(newHtml);
    onChange(newHtml);
    if (editorRef.current) {
      editorRef.current.innerHTML = newHtml;
    }
  };

  return (
    <div className="border border-stone-300 rounded-xl overflow-hidden bg-white shadow-xs">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-stone-100 border-b border-stone-200">
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <button
            type="button"
            onClick={() => handleFormatBlock('h2')}
            className="p-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-200/80 rounded transition-colors"
            title="Section Heading (H2)"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleFormatBlock('h3')}
            className="p-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-200/80 rounded transition-colors"
            title="Subheading (H3)"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleFormatBlock('p')}
            className="px-2 py-1 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-200/80 rounded transition-colors"
            title="Normal Paragraph"
          >
            P
          </button>

          <span className="h-4 w-px bg-stone-300 mx-1" />

          {/* Formatting */}
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-200/80 rounded transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-200/80 rounded transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('strikeThrough')}
            className="p-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-200/80 rounded transition-colors"
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <span className="h-4 w-px bg-stone-300 mx-1" />

          {/* Quotes & Lists */}
          <button
            type="button"
            onClick={() => handleFormatBlock('blockquote')}
            className="p-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-200/80 rounded transition-colors"
            title="Pull Quote / Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-200/80 rounded transition-colors"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-200/80 rounded transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <span className="h-4 w-px bg-stone-300 mx-1" />

          {/* Embeds */}
          <button
            type="button"
            onClick={handleInsertLink}
            className="p-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-200/80 rounded transition-colors"
            title="Insert Hyperlink"
          >
            <Link className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleInsertImage}
            className="p-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-200/80 rounded transition-colors"
            title="Insert Inline Image URL"
          >
            <Image className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertHorizontalRule')}
            className="p-1.5 text-stone-700 hover:text-stone-900 hover:bg-stone-200/80 rounded transition-colors"
            title="Horizontal Divider"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="h-4 w-px bg-stone-300 mx-1" />

          {/* History */}
          <button
            type="button"
            onClick={() => executeCommand('undo')}
            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/80 rounded transition-colors"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('redo')}
            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/80 rounded transition-colors"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center bg-stone-200/80 rounded-lg p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setViewMode('visual')}
            className={`px-2.5 py-1 rounded ${
              viewMode === 'visual' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Visual Editor
          </button>
          <button
            type="button"
            onClick={() => setViewMode('html')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 ${
              viewMode === 'html' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>HTML</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 ${
              viewMode === 'preview' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Canvas Area */}
      <div className="min-h-[360px] p-4 bg-white focus-within:ring-2 focus-within:ring-stone-400">
        {viewMode === 'visual' && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onBlur={handleEditorInput}
            className="article-prose outline-none min-h-[340px] focus:outline-none"
            data-placeholder={placeholder}
          />
        )}

        {viewMode === 'html' && (
          <textarea
            value={rawHtml}
            onChange={handleRawHtmlChange}
            className="w-full h-80 font-mono text-xs text-stone-800 p-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:ring-1 focus:ring-stone-400"
            placeholder="Edit raw HTML markup..."
          />
        )}

        {viewMode === 'preview' && (
          <div className="p-4 border border-stone-100 rounded-lg bg-[#faf9f6]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-3 pb-2 border-b border-stone-200">
              Live Reader Rendering Preview
            </div>
            <div
              className="article-prose"
              dangerouslySetInnerHTML={{ __html: value || '<p className="text-stone-400 italic">No content yet.</p>' }}
            />
          </div>
        )}
      </div>

      {/* Editor Footer Help */}
      <div className="px-3 py-1.5 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-stone-400" />
          Content is automatically sanitized by the server before storage to prevent XSS.
        </span>
        <span>
          Word count: {(value || '').replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length} words
        </span>
      </div>
    </div>
  );
};
