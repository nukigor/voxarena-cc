"use client";

import { useState } from "react";
import { SegmentDefinition, SegmentStructure } from "@/types/debate";
import {
  GripVertical,
  Plus,
  Trash2,
  Clock,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SegmentEditorProps {
  segments: SegmentStructure;
  onChange: (segments: SegmentStructure) => void;
  totalDurationMinutes?: number;
  readOnlyMode?: boolean;  // Lock everything except duration
  templateName?: string;    // For displaying template name in message
}

export function SegmentEditor({
  segments,
  onChange,
  totalDurationMinutes,
  readOnlyMode = false,
  templateName,
}: SegmentEditorProps) {
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(
    new Set()
  );

  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expandedSegments);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSegments(newExpanded);
  };

  const updateSegment = (
    index: number,
    updates: Partial<SegmentDefinition>
  ) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], ...updates };
    onChange(newSegments);
  };

  const deleteSegment = (index: number) => {
    const newSegments = segments.filter((_, i) => i !== index);
    onChange(newSegments);
  };

  const moveSegment = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === segments.length - 1)
    ) {
      return;
    }

    const newSegments = [...segments];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSegments[index], newSegments[targetIndex]] = [
      newSegments[targetIndex],
      newSegments[index],
    ];
    onChange(newSegments);
  };

  const addSegment = () => {
    const newSegment: SegmentDefinition = {
      key: `segment_${Date.now()}`,
      title: "New Segment",
      description: "",
      durationMinutes: 5,
      required: false,
      allowsReordering: true,
    };
    onChange([...segments, newSegment]);
    setExpandedSegments(new Set([...expandedSegments, newSegment.key]));
  };

  const calculateTotalDuration = () => {
    return segments.reduce((sum, seg) => sum + seg.durationMinutes, 0);
  };

  const totalDuration = calculateTotalDuration();
  const hasExceededDuration =
    totalDurationMinutes !== undefined && totalDuration > totalDurationMinutes;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Debate Segments
            <span className="text-red-600 dark:text-red-400"> *</span>
          </h3>
          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
            {readOnlyMode
              ? `Template-based segments - Only durations can be modified`
              : 'Customize the structure and timing of your debate'}
          </p>
        </div>
        {!readOnlyMode && (
          <button
            type="button"
            onClick={addSegment}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            Add Segment
          </button>
        )}
      </div>

      {/* Duration Summary */}
      <div
        className={`p-4 rounded-lg border ${
          hasExceededDuration
            ? "bg-red-50 border-red-200"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Total Duration:
            </span>
          </div>
          <div className="text-right">
            <span
              className={`text-lg font-bold ${
                hasExceededDuration ? "text-red-600" : "text-gray-900"
              }`}
            >
              {totalDuration} min
            </span>
            {totalDurationMinutes !== undefined && (
              <span className="text-sm text-gray-500 ml-2">
                / {totalDurationMinutes} min target
              </span>
            )}
          </div>
        </div>
        {hasExceededDuration && (
          <p className="text-sm text-red-600 mt-2">
            Warning: Total segment duration exceeds target duration
          </p>
        )}
      </div>

      {/* Segments List */}
      <div className="space-y-3">
        {segments.map((segment, index) => (
          <div
            key={segment.key}
            className="border border-gray-200 rounded-lg bg-white"
          >
            {/* Segment Header */}
            <div className="flex items-center gap-3 p-4">
              {/* Drag Handle */}
              {!readOnlyMode && (
                <div className="cursor-move text-gray-400 hover:text-gray-600">
                  <GripVertical className="w-5 h-5" />
                </div>
              )}

              {/* Segment Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {segment.title}
                  </span>
                  {segment.required && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400">
                      Required
                    </span>
                  )}
                  {!segment.allowsReordering && (
                    <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  )}
                  {readOnlyMode && (
                    <Lock className="w-4 h-4 text-blue-500 dark:text-blue-400" title="Template-locked" />
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">
                  {segment.durationMinutes} minutes
                  {segment.description && ` • ${segment.description}`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {!readOnlyMode && segment.allowsReordering && (
                  <>
                    <button
                      type="button"
                      onClick={() => moveSegment(index, "up")}
                      disabled={index === 0}
                      className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSegment(index, "down")}
                      disabled={index === segments.length - 1}
                      className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => toggleExpanded(segment.key)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  {expandedSegments.has(segment.key) ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {!readOnlyMode && !segment.required && (
                  <button
                    type="button"
                    onClick={() => deleteSegment(index)}
                    className="p-1.5 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Expanded Segment Details */}
            {expandedSegments.has(segment.key) && (
              <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                      Title
                    </label>
                    <input
                      type="text"
                      value={segment.title}
                      onChange={(e) =>
                        updateSegment(index, { title: e.target.value })
                      }
                      disabled={readOnlyMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-white/5 dark:border-gray-600 dark:text-white dark:disabled:bg-gray-800"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={segment.durationMinutes}
                      onChange={(e) =>
                        updateSegment(index, {
                          durationMinutes: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-white/5 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={segment.description}
                    onChange={(e) =>
                      updateSegment(index, { description: e.target.value })
                    }
                    rows={2}
                    disabled={readOnlyMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-white/5 dark:border-gray-600 dark:text-white dark:disabled:bg-gray-800"
                  />
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6">
                  <label className={`flex items-center gap-2 ${readOnlyMode ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={segment.required}
                      onChange={(e) =>
                        updateSegment(index, { required: e.target.checked })
                      }
                      disabled={readOnlyMode}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Required segment
                    </span>
                  </label>

                  <label className={`flex items-center gap-2 ${readOnlyMode ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={segment.allowsReordering}
                      onChange={(e) =>
                        updateSegment(index, {
                          allowsReordering: e.target.checked,
                        })
                      }
                      disabled={readOnlyMode}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Allow reordering
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {segments.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">No segments added yet</p>
          <button
            type="button"
            onClick={addSegment}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add your first segment
          </button>
        </div>
      )}
    </div>
  );
}
