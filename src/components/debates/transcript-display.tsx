'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface TranscriptDisplayProps {
  transcript: string
}

export function TranscriptDisplay({ transcript }: TranscriptDisplayProps) {

  return (
    <div className="space-y-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-semibold mt-6 mb-4 text-gray-900 dark:text-gray-100">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mt-5 mb-3 text-gray-900 dark:text-gray-100">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed text-gray-800 dark:text-gray-200">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900 dark:text-gray-100">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-800 dark:text-gray-200">
              {children}
            </em>
          ),
          hr: () => (
            <hr className="my-6 border-gray-300 dark:border-gray-700" />
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-6 mb-3 space-y-1" style={{ listStylePosition: 'outside' }}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-6 mb-3 space-y-1" style={{ listStylePosition: 'outside' }}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-800 dark:text-gray-200">
              {children}
            </li>
          ),
          pre: ({ children }) => {
            // Filter out empty pre blocks
            const childText = typeof children === 'string' ? children : children?.toString() || ''
            if (!childText.trim()) return null

            return (
              <pre className="my-4 rounded-md bg-gray-100 dark:bg-gray-800 p-4 overflow-x-auto">
                {children}
              </pre>
            )
          },
          code: ({ children, className }) => {
            // Filter out empty code blocks
            const childText = typeof children === 'string' ? children : children?.toString() || ''
            if (!childText.trim()) return null

            // Inline code
            if (!className) {
              return (
                <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-sm font-mono text-gray-900 dark:text-gray-100">
                  {children}
                </code>
              )
            }

            // Code block
            return (
              <code className={`${className} text-sm font-mono text-gray-900 dark:text-gray-100`}>
                {children}
              </code>
            )
          },
        }}
      >
        {transcript}
      </ReactMarkdown>
    </div>
  )
}
