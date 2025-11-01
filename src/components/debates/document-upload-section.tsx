'use client'

import React from 'react'
import { CloudArrowUpIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { formatFileSize, getFileTypeDisplay } from '@/lib/r2/document-upload'

interface DocumentUploadSectionProps {
  documentUrl: string | null
  documentName: string | null
  documentSize: number | null
  documentType: string | null
  uploadingDocument: boolean
  documentError: string | null
  onDocumentUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDocumentRemove: () => void
}

export function DocumentUploadSection({
  documentUrl,
  documentName,
  documentSize,
  documentType,
  uploadingDocument,
  documentError,
  onDocumentUpload,
  onDocumentRemove,
}: DocumentUploadSectionProps) {
  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl dark:bg-gray-800 dark:ring-white/10">
      <div className="px-4 py-6 sm:p-8">
        <h2 className="text-base font-semibold text-gray-900 mb-2 dark:text-white">
          Review Document
        </h2>
        <p className="text-sm text-gray-600 mb-6 dark:text-gray-400">
          Upload a PDF or Word document for the expert panel to review and discuss.
        </p>

        {/* Document Upload Area */}
        {!documentUrl ? (
          <div className="space-y-4">
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-white/10">
              <div className="space-y-1 text-center">
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="document-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 dark:bg-transparent dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    <span>Upload a document</span>
                    <input
                      id="document-upload"
                      name="document-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="sr-only"
                      onChange={onDocumentUpload}
                      disabled={uploadingDocument}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  PDF, DOC, DOCX up to 10MB
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md dark:bg-white/5">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {documentName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {documentSize && formatFileSize(documentSize)} • {documentType && getFileTypeDisplay(documentType)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onDocumentRemove}
              disabled={uploadingDocument}
              className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/10 dark:text-red-400 dark:ring-red-500/20 dark:hover:bg-red-500/10"
            >
              Remove
            </button>
          </div>
        )}

        {/* Upload Status */}
        {uploadingDocument && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading document...
            </div>
          </div>
        )}

        {/* Error Message */}
        {documentError && (
          <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-500/10">
            <div className="flex">
              <div className="flex-shrink-0">
                <XMarkIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {documentError}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}