"use client";

import { FormatTemplateForm } from "@/components/debates/format-template-form";

export default function NewFormatTemplatePage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            Create Format
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Create a custom format for your debates
          </p>
        </div>
      </div>

      {/* Form */}
      <FormatTemplateForm mode="create" />
    </div>
  );
}
