"use client";

import { FormatTemplateWithRelations } from "@/types/debate";
import { Clock, Users, Mic, LayoutTemplate } from "lucide-react";
import { useDebateModes } from "@/hooks/use-debate-modes";

interface FormatTemplateCardProps {
  template: FormatTemplateWithRelations;
  onSelect?: (template: FormatTemplateWithRelations) => void;
  isSelected?: boolean;
  onEdit?: (template: FormatTemplateWithRelations) => void;
  onDelete?: (template: FormatTemplateWithRelations) => void;
  selected?: boolean;
}

export function FormatTemplateCard({
  template,
  onSelect,
  isSelected = false,
  selected = false,
  onEdit,
  onDelete,
}: FormatTemplateCardProps) {
  // Fetch modes from database
  const { data: modesData } = useDebateModes({ pageSize: 100 });

  // Map template's mode enum to Mode database record
  const getModeName = () => {
    if (!modesData?.modes) return template.mode;
    const modeSlug = template.mode === 'PODCAST' ? 'podcast-mode' : 'debate-mode';
    const mode = modesData.modes.find(m => m.slug === modeSlug);
    return mode?.name || template.mode;
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect(template);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(template);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(template);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    return "bg-gray-100 text-gray-600 dark:bg-gray-400/10 dark:text-gray-300";
  };

  const getModeBadgeColor = () => {
    return "bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400";
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative rounded-lg border-2 p-6 transition-all cursor-pointer flex flex-col
        ${
          isSelected
            ? "border-blue-500 bg-blue-50 shadow-lg"
            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
        }
      `}
    >
      {/* Content wrapper that grows to push buttons to bottom */}
      <div className="flex-grow">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {template.name}
          </h3>
          {template._count && template._count.debates > 0 && (
            <span className="inline-flex shrink-0 items-center rounded-md bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-400/10 dark:text-red-400">
              {template._count.debates} debate{template._count.debates !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span
            className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ${getCategoryBadgeColor(
              template.category
            )}`}
          >
            {template.category}
          </span>
          <span
            className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ${getModeBadgeColor()}`}
          >
            {getModeName()}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {template.description}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center text-gray-600">
          <Users className="w-4 h-4 mr-2" />
          <span>
            {template.minParticipants === template.maxParticipants
              ? `${template.minParticipants} participants`
              : `${template.minParticipants}-${template.maxParticipants} participants`}
          </span>
        </div>
        <div className="flex items-center text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span>{template.durationMinutes} min</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Mic className="w-4 h-4 mr-2" />
          <span>
            {template.requiresModerator ? "With moderator" : "Optional moderator"}
          </span>
        </div>
        <div className="flex items-center text-gray-600">
          <LayoutTemplate className="w-4 h-4 mr-2" />
          <span>
            {Array.isArray(template.segmentStructure)
              ? template.segmentStructure.length
              : 0}{" "}
            segments
          </span>
        </div>
      </div>

      {/* Best For */}
      {template.bestFor && (
        <div className="pt-4 border-t border-gray-200 mb-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Best for:</p>
          <p className="text-xs text-gray-600 line-clamp-2">
            {template.bestFor}
          </p>
        </div>
      )}
      </div>

      {/* Action Buttons */}
      {(onEdit || onDelete) && (
        <div className="-mx-6 -mb-6 border-t border-gray-200 grid grid-cols-2 gap-0">
          <button
            onClick={handleEdit}
            disabled={!onEdit}
            className="py-4 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-r border-gray-200"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={!onDelete || template.isPreset}
            className="py-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={template.isPreset ? "Cannot delete preset templates" : "Delete template"}
          >
            Delete
          </button>
        </div>
      )}

      {/* Selected Indicator */}
      {(isSelected || selected) && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}
