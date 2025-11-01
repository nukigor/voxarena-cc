"use client";

import { DebateWithRelations, DebateStatus, SegmentStructure } from "@/types/debate";
import { Clock, Users, Calendar, Play, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { calculateFormatDrift } from "@/lib/format-drift-detector";

interface DebateCardProps {
  debate: DebateWithRelations;
  onEdit?: (debate: DebateWithRelations) => void;
  onDelete?: (debate: DebateWithRelations) => void;
  onGenerate?: (debate: DebateWithRelations) => void;
}

export function DebateCard({
  debate,
  onEdit,
  onDelete,
  onGenerate,
}: DebateCardProps) {
  const getStatusBadge = (status: DebateStatus) => {
    const styles = {
      DRAFT: "bg-gray-100 text-gray-800",
      GENERATING: "bg-yellow-100 text-yellow-800 animate-pulse",
      COMPLETED: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      PUBLISHED: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          styles[status] || styles.DRAFT
        }`}
      >
        {status}
      </span>
    );
  };

  const getModeBadge = () => {
    return "bg-blue-100 text-blue-800 dark:bg-blue-400/10 dark:text-blue-400";
  };

  // Calculate drift
  const driftAnalysis = debate.formatTemplate
    ? calculateFormatDrift(
        debate.segmentStructure as SegmentStructure,
        debate.formatTemplate.segmentStructure as SegmentStructure,
        debate.formatTemplate.name
      )
    : null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link
              href={`/admin/debates/${debate.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {debate.title}
            </Link>
            <div className="flex flex-wrap gap-2 mt-2">
              {getStatusBadge(debate.status)}
              {debate.debateMode && (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getModeBadge()}`}
                >
                  {debate.debateMode.name}
                </span>
              )}
              {debate.formatTemplate ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {debate.formatTemplate.name}
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Custom Format
                </span>
              )}
              {driftAnalysis?.isDrifted && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800" title={`${driftAnalysis.driftPercentage}% match to template`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Modified
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            {debate.status === "DRAFT" && onGenerate && (
              <button
                onClick={() => onGenerate(debate)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Generate debate"
              >
                <Play className="w-5 h-5" />
              </button>
            )}
            {debate.status === "DRAFT" && onEdit && (
              <button
                onClick={() => onEdit(debate)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit debate"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            {debate.status !== "GENERATING" && onDelete && (
              <button
                onClick={() => onDelete(debate)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete debate"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Topic */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{debate.topic}</p>

        {/* Participants */}
        {debate.participants && debate.participants.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {debate.participants.slice(0, 3).map((participant) => (
                <Link
                  key={participant.id}
                  href={`/admin/personas/${participant.persona.id}`}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {participant.persona.avatarUrl && (
                    <img
                      src={participant.persona.avatarUrl}
                      alt={participant.persona.name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-700">
                    {participant.persona.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({participant.role.toLowerCase()})
                  </span>
                </Link>
              ))}
              {debate.participants.length > 3 && (
                <span className="text-sm text-gray-500">
                  +{debate.participants.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{debate.participants?.length || 0} participants</span>
          </div>
          {debate.totalDurationMinutes && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{debate.totalDurationMinutes} min</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDistanceToNow(new Date(debate.createdAt), { addSuffix: true })}</span>
          </div>
        </div>

        {/* Error Message */}
        {debate.status === "FAILED" && debate.errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{debate.errorMessage}</p>
          </div>
        )}

        {/* Generation Progress */}
        {debate.status === "GENERATING" && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Generating debate content... This may take a few minutes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
