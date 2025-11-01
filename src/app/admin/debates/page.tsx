"use client";

import { useState, useEffect } from "react";
import { DebateWithRelations, DebateStatus, DebateMode } from "@/types/debate";
import { DebateCard } from "@/components/debates/debate-card";
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { Plus, Filter } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function DebatesPage() {
  const router = useRouter();
  const [debates, setDebates] = useState<DebateWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DebateStatus | "">("");
  const [modeFilter, setModeFilter] = useState<DebateMode | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [debateToDelete, setDebateToDelete] = useState<DebateWithRelations | null>(null);
  const [deleting, setDeleting] = useState(false);
  const pageSize = 12;

  useEffect(() => {
    fetchDebates();
  }, [search, statusFilter, modeFilter, page]);

  const fetchDebates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("pageSize", "12");
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (modeFilter) params.append("mode", modeFilter);

      const response = await fetch(`/api/debates?${params}`);
      if (!response.ok) throw new Error("Failed to fetch debates");

      const data = await response.json();
      setDebates(data.debates);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error("Error fetching debates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (debate: DebateWithRelations) => {
    router.push(`/admin/debates/${debate.id}/edit`);
  };

  const handleDeleteClick = (debate: DebateWithRelations) => {
    setDebateToDelete(debate);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!debateToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/debates/${debateToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete debate");

      // Refresh the list
      fetchDebates();
      setShowDeleteDialog(false);
      setDebateToDelete(null);
    } catch (error) {
      console.error("Error deleting debate:", error);
      alert("Failed to delete debate. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleGenerate = async (debate: DebateWithRelations) => {
    if (
      !confirm(
        `Start generating "${debate.title}"? This will begin the AI generation process.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/debates/${debate.id}/generate`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to start generation");

      // Refresh the list to show updated status
      fetchDebates();
    } catch (error) {
      console.error("Error starting generation:", error);
      alert("Failed to start generation. Please try again.");
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            Debates
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage and create AI-generated debates
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/admin/debates/new"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
          >
            Create debate
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative sm:max-w-xs flex-1">
          <input
            id="search"
            type="text"
            placeholder="Search debates..."
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

        {/* Status Filter */}
        <div className="relative sm:max-w-xs flex-1 grid grid-cols-1">
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DebateStatus | "")}
            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:*:bg-gray-800 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="GENERATING">Generating</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="PUBLISHED">Published</option>
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
      </div>

      {/* Debates List */}
      {loading ? (
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading debates...</p>
        </div>
      ) : debates.length === 0 ? (
        <div className="mt-8 text-center">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No debates found
            </h3>
            <p className="text-gray-500 mb-6">
              {search || statusFilter || modeFilter
                ? "Try adjusting your filters or search query"
                : "Get started by creating your first debate"}
            </p>
            {!search && !statusFilter && !modeFilter && (
              <Link
                href="/admin/debates/new"
                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
              >
                <Plus className="w-5 h-5" />
                Create Debate
              </Link>
            )}
          </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-6">
              {debates.map((debate) => (
                <DebateCard
                  key={debate.id}
                  debate={debate}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onGenerate={handleGenerate}
                />
              ))}
          </div>

          {/* Pagination */}
          {!loading && debates.length > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              itemsPerPage={pageSize}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Debate"
        message={`Are you sure you want to delete "${debateToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}
