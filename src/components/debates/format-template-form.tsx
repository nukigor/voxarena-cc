"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FormatTemplateWithRelations,
  FormatCategory,
  DebateMode,
  SegmentStructure,
} from "@/types/debate";
import { SegmentEditor } from "./segment-editor";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDebateModes } from "@/hooks/use-debate-modes";

interface FormatTemplateFormProps {
  template?: FormatTemplateWithRelations;
  mode: "create" | "edit";
}

export function FormatTemplateForm({ template, mode }: FormatTemplateFormProps) {
  const router = useRouter();
  const { data: modesData, isLoading: modesLoading } = useDebateModes({ pageSize: 100 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const isEditing = mode === "edit";

  // Helper function to map mode slug to enum (for backward compatibility with FormatTemplate table)
  const mapModeSlugToEnum = (slug: string): DebateMode => {
    return slug === 'podcast-mode' ? 'PODCAST' : 'DEBATE';
  };

  // Form state
  const [name, setName] = useState(template?.name || "");
  const [description, setDescription] = useState(template?.description || "");
  const [category, setCategory] = useState<FormatCategory>(template?.category || "PROFESSIONAL");
  const [selectedModeId, setSelectedModeId] = useState<string>('');
  const [minParticipants, setMinParticipants] = useState(template?.minParticipants || 2);
  const [maxParticipants, setMaxParticipants] = useState(template?.maxParticipants || 4);
  const [requiresModerator, setRequiresModerator] = useState(template?.requiresModerator || false);
  const [allowsDocumentUpload, setAllowsDocumentUpload] = useState(template?.allowsDocumentUpload || false);
  const [durationMinutes, setDurationMinutes] = useState(template?.durationMinutes || 60);
  const [flexibleTiming, setFlexibleTiming] = useState(template?.flexibleTiming ?? true);
  const [segmentStructure, setSegmentStructure] = useState<SegmentStructure>(
    (template?.segmentStructure as SegmentStructure) || []
  );
  const [bestFor, setBestFor] = useState(template?.bestFor || "");
  const [personaRecommendations, setPersonaRecommendations] = useState(
    template?.personaRecommendations || ""
  );

  // Set initial mode when modesData is loaded
  useEffect(() => {
    if (modesData?.modes && !selectedModeId) {
      if (template?.mode) {
        // Editing: find mode based on template's mode enum
        const modeSlug = template.mode === 'PODCAST' ? 'podcast-mode' : 'debate-mode';
        const foundMode = modesData.modes.find(m => m.slug === modeSlug);
        if (foundMode) {
          setSelectedModeId(foundMode.id);
        }
      } else {
        // Creating: default to first mode (preferably debate-mode)
        const defaultMode = modesData.modes.find(m => m.slug === 'debate-mode') || modesData.modes[0];
        if (defaultMode) {
          setSelectedModeId(defaultMode.id);
        }
      }
    }
  }, [modesData, selectedModeId, template]);

  const handleCancelConfirm = () => {
    setShowCancelDialog(false);
    router.push("/admin/format-templates");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSubmitDialog(true);
  };

  const handleSubmitConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate segments
      if (segmentStructure.length === 0) {
        throw new Error("At least one segment is required. Please add a segment to continue.");
      }

      // Find the selected mode and convert to enum for backward compatibility
      const selectedMode = modesData?.modes.find(m => m.id === selectedModeId);
      if (!selectedMode) {
        throw new Error("Please select a mode");
      }
      const debateModeEnum = mapModeSlugToEnum(selectedMode.slug);

      const url =
        mode === "create" ? "/api/format-templates" : `/api/format-templates/${template?.id}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          category,
          mode: debateModeEnum,
          minParticipants,
          maxParticipants,
          requiresModerator,
          allowsDocumentUpload,
          durationMinutes,
          flexibleTiming,
          segmentStructure,
          bestFor: bestFor || null,
          personaRecommendations: personaRecommendations || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${mode} template`);
      }

      // Success - redirect to format templates list
      router.push("/admin/format-templates");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setShowSubmitDialog(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form id="format-template-form" onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl dark:bg-gray-800 dark:ring-white/10">
          <div className="px-4 py-6 sm:p-8">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="col-span-full">
                <label
                  htmlFor="name"
                  className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                >
                  Format Name
                  <span className="text-red-600 dark:text-red-400"> *</span>
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="description"
                  className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                >
                  Description
                  <span className="text-red-600 dark:text-red-400"> *</span>
                </label>
                <div className="mt-2">
                  <textarea
                    id="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="category"
                  className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                >
                  Category
                </label>
                <div className="mt-2">
                  <div className="grid grid-cols-1">
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as FormatCategory)}
                      className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:*:bg-gray-800 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                    >
                      <option value="ACADEMIC">Academic</option>
                      <option value="PROFESSIONAL">Professional</option>
                      <option value="CASUAL">Casual</option>
                      <option value="CULTURAL">Cultural</option>
                    </select>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      aria-hidden="true"
                      className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="mode"
                  className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                >
                  Mode
                  <span className="text-red-600 dark:text-red-400"> *</span>
                </label>
                <div className="mt-2">
                  {modesLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600 dark:border-gray-600 dark:border-t-indigo-500"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1">
                      <select
                        id="mode"
                        value={selectedModeId}
                        onChange={(e) => setSelectedModeId(e.target.value)}
                        required
                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:*:bg-gray-800 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                      >
                        <option value="">Select a mode...</option>
                        {modesData?.modes.map((mode) => (
                          <option key={mode.id} value={mode.id}>
                            {mode.name}
                          </option>
                        ))}
                      </select>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        aria-hidden="true"
                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Participants & Duration */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl dark:bg-gray-800 dark:ring-white/10">
          <div className="px-4 py-6 sm:p-8">
            <h2 className="text-base font-semibold text-gray-900 mb-6 dark:text-white">
              Participants & Duration
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label
                  htmlFor="minParticipants"
                  className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                >
                  Min Participants
                  <span className="text-red-600 dark:text-red-400"> *</span>
                </label>
                <div className="mt-2">
                  <input
                    type="number"
                    id="minParticipants"
                    min="1"
                    value={minParticipants}
                    onChange={(e) => setMinParticipants(parseInt(e.target.value) || 1)}
                    required
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="maxParticipants"
                  className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                >
                  Max Participants
                  <span className="text-red-600 dark:text-red-400"> *</span>
                </label>
                <div className="mt-2">
                  <input
                    type="number"
                    id="maxParticipants"
                    min="1"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 1)}
                    required
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="durationMinutes"
                  className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                >
                  Duration (minutes)
                  <span className="text-red-600 dark:text-red-400"> *</span>
                </label>
                <div className="mt-2">
                  <input
                    type="number"
                    id="durationMinutes"
                    min="1"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 1)}
                    required
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="requiresModerator"
                    checked={requiresModerator}
                    onChange={(e) => setRequiresModerator(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="requiresModerator"
                    className="text-sm/6 font-medium text-gray-900 dark:text-white"
                  >
                    Requires Moderator
                  </label>
                </div>
              </div>

              <div className="sm:col-span-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="allowsDocumentUpload"
                    checked={allowsDocumentUpload}
                    onChange={(e) => setAllowsDocumentUpload(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="allowsDocumentUpload"
                    className="text-sm/6 font-medium text-gray-900 dark:text-white"
                  >
                    Allow Document Upload
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enable document upload for debates using this format
                </p>
              </div>

              <div className="sm:col-span-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="flexibleTiming"
                    checked={flexibleTiming}
                    onChange={(e) => setFlexibleTiming(e.target.checked)}
                    className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="flexibleTiming"
                    className="text-sm/6 font-medium text-gray-900 dark:text-white"
                  >
                    Flexible Timing
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Segment Structure */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl dark:bg-gray-800 dark:ring-white/10">
          <div className="px-4 py-6 sm:p-8">
            <SegmentEditor
              segments={segmentStructure}
              onChange={setSegmentStructure}
              totalDurationMinutes={flexibleTiming ? undefined : durationMinutes}
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl dark:bg-gray-800 dark:ring-white/10">
          <div className="px-4 py-6 sm:p-8">
            <h2 className="text-base font-semibold text-gray-900 mb-6 dark:text-white">
              Additional Information
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-8">
              <div>
                <label
                  htmlFor="bestFor"
                  className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                >
                  Best For (Optional)
                </label>
                <div className="mt-2">
                  <textarea
                    id="bestFor"
                    rows={4}
                    value={bestFor}
                    onChange={(e) => setBestFor(e.target.value)}
                    placeholder="Describe the ideal use cases for this format..."
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="personaRecommendations"
                  className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                >
                  Persona Recommendations (Optional)
                </label>
                <div className="mt-2">
                  <textarea
                    id="personaRecommendations"
                    rows={4}
                    value={personaRecommendations}
                    onChange={(e) => setPersonaRecommendations(e.target.value)}
                    placeholder="Suggest types of personas that work well with this format..."
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Form Actions */}
      <div className="max-w-4xl mx-auto mt-6 flex items-center justify-end gap-x-3">
        <button
          type="button"
          onClick={() => setShowCancelDialog(true)}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs border border-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:border-white/10 dark:hover:bg-white/20"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          form="format-template-form"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          {loading ? "Saving..." : mode === "create" ? "Create Format" : "Update Format"}
        </button>
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelConfirm}
        title="Discard changes?"
        message={
          isEditing
            ? "Are you sure you want to cancel? Any unsaved changes to this format will be lost."
            : "Are you sure you want to cancel? All entered information will be discarded."
        }
        confirmText="Discard"
        cancelText="Keep editing"
        variant="warning"
      />

      {/* Submit Confirmation Dialog */}
      <ConfirmDialog
        open={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
        onConfirm={handleSubmitConfirm}
        title={isEditing ? "Update Format" : "Create Format"}
        message={
          isEditing
            ? `Are you sure you want to update "${name}"? This will save all changes to this format.`
            : `Are you sure you want to create the format "${name}"?`
        }
        confirmText={isEditing ? "Update" : "Create"}
        cancelText="Cancel"
        variant="success"
        isLoading={loading}
      />
    </>
  );
}
