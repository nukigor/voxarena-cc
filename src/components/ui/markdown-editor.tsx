'use client'

import { useState, useRef, TextareaHTMLAttributes } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownEditorProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  label?: string
  optional?: boolean
  error?: string
  showPreview?: boolean
}

interface ToolbarButton {
  icon: string
  label: string
  action: (textarea: HTMLTextAreaElement) => void
}

export function MarkdownEditor({
  value = '',
  onChange,
  label,
  optional,
  error,
  showPreview = true,
  disabled,
  placeholder,
  rows = 6,
  ...props
}: MarkdownEditorProps) {
  const [isPreviewVisible, setIsPreviewVisible] = useState(showPreview)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value)
  }

  const insertMarkdown = (before: string, after: string = '', placeholder: string = 'text') => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Save scroll position
    const scrollTop = textarea.scrollTop
    const scrollLeft = textarea.scrollLeft

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selectedText = text.substring(start, end)

    const newText = selectedText || placeholder
    const replacement = `${before}${newText}${after}`

    const newValue = text.substring(0, start) + replacement + text.substring(end)
    onChange?.(newValue)

    // Restore scroll position and cursor after React re-renders
    setTimeout(() => {
      const newCursorPos = start + before.length + newText.length + after.length
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.scrollTop = scrollTop
      textarea.scrollLeft = scrollLeft
    }, 0)
  }

  const insertAtLineStart = (prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Save scroll position
    const scrollTop = textarea.scrollTop
    const scrollLeft = textarea.scrollLeft

    const start = textarea.selectionStart
    const text = textarea.value

    // Find the start of the current line
    const lineStart = text.lastIndexOf('\n', start - 1) + 1
    const newValue = text.substring(0, lineStart) + prefix + text.substring(lineStart)

    onChange?.(newValue)

    // Restore scroll position and cursor after React re-renders
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(lineStart + prefix.length, lineStart + prefix.length)
      textarea.scrollTop = scrollTop
      textarea.scrollLeft = scrollLeft
    }, 0)
  }

  const toolbarButtons: ToolbarButton[] = [
    {
      icon: 'B',
      label: 'Bold',
      action: () => insertMarkdown('**', '**', 'bold text'),
    },
    {
      icon: 'I',
      label: 'Italic',
      action: () => insertMarkdown('*', '*', 'italic text'),
    },
    {
      icon: 'U',
      label: 'Underline',
      action: () => insertMarkdown('<u>', '</u>', 'underlined text'),
    },
    {
      icon: '•',
      label: 'Bullet List',
      action: () => insertAtLineStart('- '),
    },
    {
      icon: '1.',
      label: 'Numbered List',
      action: () => insertAtLineStart('1. '),
    },
  ]

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
          {label}
          {optional && <span className="ml-1 text-gray-500 dark:text-gray-400">(optional)</span>}
        </label>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border border-gray-300 rounded-t-md bg-gray-50 dark:bg-gray-800 dark:border-white/10">
        {toolbarButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={() => button.action(textareaRef.current!)}
            disabled={disabled}
            title={button.label}
            className="px-2 py-1 text-sm font-semibold rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-gray-700 dark:text-white"
          >
            {button.icon}
          </button>
        ))}

        <div className="flex-1" />

        {/* Toggle Preview Button */}
        <button
          type="button"
          onClick={() => setIsPreviewVisible(!isPreviewVisible)}
          disabled={disabled}
          className="px-2 py-1 text-xs font-medium rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-gray-700 dark:text-gray-300"
        >
          {isPreviewVisible ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      {/* Editor and Preview */}
      <div className={`grid gap-2 ${isPreviewVisible ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Textarea */}
        <div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            rows={rows}
            className="block w-full rounded-md rounded-t-none bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 border-t-0 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500 font-mono"
            {...props}
          />
        </div>

        {/* Preview */}
        {isPreviewVisible && (
          <div
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 min-h-[150px] overflow-auto dark:bg-white/5 dark:text-white dark:border-white/10"
            style={{ height: `${(rows || 6) * 24 + 12}px` }}
          >
            {value ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc ml-4 mb-2 last:mb-0">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 last:mb-0">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  u: ({ children }) => <u>{children}</u>,
                }}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 text-sm">Preview appears here...</span>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <p className="text-xs text-gray-600 dark:text-gray-400">
        Supports **bold**, *italic*, <u>underline</u>, bullet lists, and numbered lists. Press Enter twice for new paragraph.
      </p>
    </div>
  )
}
