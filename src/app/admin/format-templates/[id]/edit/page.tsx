"use client";

import { useEffect, useState } from "react";
import { FormatTemplateForm } from "@/components/debates/format-template-form";
import { FormatTemplateWithRelations } from "@/types/debate";

export default function EditFormatTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [template, setTemplate] = useState<FormatTemplateWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unwrap params for Next.js 15
  useEffect(() => {
    params.then((p) => {
      setTemplateId(p.id);
    });
  }, [params]);

  // Fetch template data
  useEffect(() => {
    if (!templateId) return;

    const fetchTemplate = async () => {
      try {
        const response = await fetch(`/api/format-templates/${templateId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch template");
        }
        const data = await response.json();
        setTemplate(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId]);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading format...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Format not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            Edit Format
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Update your custom format
          </p>
        </div>
      </div>

      {/* Form */}
      <FormatTemplateForm mode="edit" template={template} />
    </div>
  );
}
