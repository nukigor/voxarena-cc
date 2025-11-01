"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormatTemplateWithRelations, FormatCategory, DebateMode } from "@/types/debate";
import { FormatTemplateCard } from "@/components/debates/format-template-card";
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { Filter } from "lucide-react";

export default function FormatTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<FormatTemplateWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<FormatCategory | "">("");
  const [modeFilter, setModeFilter] = useState<DebateMode | "">("");
  const [presetFilter, setPresetFilter] = useState<"all" | "preset" | "custom">(
    "all"
  );

  useEffect(() => {
    fetchTemplates();
  }, [search, categoryFilter, modeFilter, presetFilter]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (categoryFilter) params.append("category", categoryFilter);
      if (modeFilter) params.append("mode", modeFilter);
      if (presetFilter !== "all") {
        params.append("isPreset", presetFilter === "preset" ? "true" : "false");
      }

      const response = await fetch(`/api/format-templates?${params}`);
      if (!response.ok) throw new Error("Failed to fetch templates");

      const data = await response.json();
      setTemplates(data.templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: FormatTemplateWithRelations) => {
    router.push(`/admin/format-templates/${template.id}/edit`);
  };

  const handleDelete = async (template: FormatTemplateWithRelations) => {
    if (template.isPreset) {
      alert("Cannot delete preset templates");
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete "${template.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/format-templates/${template.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete template");
      }

      // Refresh the list
      await fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      alert(error instanceof Error ? error.message : "Failed to delete template");
    }
  };

  const handleSelect = (template: FormatTemplateWithRelations) => {
    window.location.href = `/admin/debates/new?templateId=${template.id}`;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            Formats
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Choose a debate format to structure your conversations
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => router.push('/admin/format-templates/new')}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
          >
            Create format
          </button>
        </div>
      </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative sm:max-w-xs flex-1">
            <input
              id="search"
              type="text"
              placeholder="Search formats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-md bg-white px-3 py-1.5 pr-10 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                  <span className="sr-only">Clear search</span>
                </button>
              ) : (
                <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="relative sm:max-w-xs flex-1 grid grid-cols-1">
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as FormatCategory | "")}
              className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:*:bg-gray-800 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              <option value="ACADEMIC">Academic</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="CASUAL">Casual</option>
              <option value="CULTURAL">Cultural</option>
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
            />
          </div>

          {/* Mode Filter */}
          <div className="relative sm:max-w-xs flex-1 grid grid-cols-1">
            <select
              id="modeFilter"
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value as DebateMode | "")}
              className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:*:bg-gray-800 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
            >
              <option value="">All Modes</option>
              <option value="DEBATE">Debate</option>
              <option value="PODCAST">Podcast</option>
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
            />
          </div>

          {/* Preset Filter */}
          <div className="relative sm:max-w-xs flex-1 grid grid-cols-1">
            <select
              id="presetFilter"
              value={presetFilter}
              onChange={(e) => setPresetFilter(e.target.value as "all" | "preset" | "custom")}
              className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:*:bg-gray-800 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
            >
              <option value="all">All Formats</option>
              <option value="preset">Preset Only</option>
              <option value="custom">Custom Only</option>
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
            />
          </div>
        </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading formats...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="mt-8 text-center">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No formats found
          </h3>
          <p className="text-gray-500">
            Try adjusting your filters or search query
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <FormatTemplateCard
              key={template.id}
              template={template}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
