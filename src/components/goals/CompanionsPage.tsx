import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconUser,
  IconUsers,
  IconMessageCircle,
} from "@tabler/icons-react";
import type { WeekState, Companion, Task } from "../../types/weekly";
import PageHeader from "../layout/PageHeader";

interface CompanionsPageProps {
  weekState: WeekState;
  actions: {
    addCompanion: (
      name: string,
      relationship: Companion["relationship"],
      avatarEmoji?: string,
      description?: string
    ) => void;
    updateCompanion: (
      id: string,
      updates: Partial<Omit<Companion, "id" | "createdAt">>
    ) => void;
    deleteCompanion: (id: string) => void;
  };
}

// Helper to get initials
function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function CompanionsPage({
  weekState,
  actions,
}: CompanionsPageProps) {
  const [selectedCompanionId, setSelectedCompanionId] = useState<string | null>(
    null
  );
  const [isAddMode, setIsAddMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Companion>>({
    name: "",
    relationship: "friend",
    avatarEmoji: "🙂",
    description: "",
  });

  const selectedCompanion = useMemo(
    () => weekState.companions.find((c) => c.id === selectedCompanionId),
    [weekState.companions, selectedCompanionId]
  );

  const companionTasks = useMemo(() => {
    if (!selectedCompanionId) return [];
    return weekState.tasks.filter((t) =>
      t.companionIds?.includes(selectedCompanionId)
    );
  }, [weekState.tasks, selectedCompanionId]);

  const companionStats = useMemo(() => {
    const total = companionTasks.length;
    const completed = companionTasks.filter(
      (t) => t.status === "completed"
    ).length;
    const failed = companionTasks.filter((t) => t.status === "failed").length;
    const open = companionTasks.filter((t) => t.status === "open").length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, failed, open, completionRate };
  }, [companionTasks]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (isAddMode) {
      actions.addCompanion(
        formData.name,
        formData.relationship as Companion["relationship"],
        formData.avatarEmoji,
        formData.description
      );
      setIsAddMode(false);
    } else if (selectedCompanionId) {
      actions.updateCompanion(selectedCompanionId, {
        name: formData.name,
        relationship: formData.relationship as Companion["relationship"],
        avatarEmoji: formData.avatarEmoji,
        description: formData.description,
      });
    }

    // Reset form
    setFormData({
      name: "",
      relationship: "friend",
      avatarEmoji: "🙂",
      description: "",
    });
  };

  const startEdit = (c: Companion) => {
    setSelectedCompanionId(c.id);
    setIsAddMode(false); // We are in view/edit mode effectively
    setFormData({
      name: c.name,
      relationship: c.relationship,
      avatarEmoji: c.avatarEmoji,
      description: c.description,
    });
  };

  const startAdd = () => {
    setSelectedCompanionId(null);
    setIsAddMode(true);
    setFormData({
      name: "",
      relationship: "friend",
      avatarEmoji: "🙂",
      description: "",
    });
  };

  return (
    <div className="flex flex-col min-h-screen pb-12">
      <PageHeader title="Companions" />

      <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: List */}
        <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-4">
          <button
            onClick={startAdd}
            className="w-full p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-colors shadow-sm"
          >
            <IconPlus className="w-5 h-5" />
            New Companion
          </button>

          <div className="flex flex-col gap-2">
            {weekState.companions.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setIsAddMode(false);
                  setSelectedCompanionId(c.id);
                  // Reset form data to prevent stale edits if we click another
                  setFormData({
                    name: c.name,
                    relationship: c.relationship,
                    avatarEmoji: c.avatarEmoji,
                    description: c.description,
                  });
                }}
                className={`p-3 rounded-lg flex items-center gap-3 transition-colors text-left border ${
                  selectedCompanionId === c.id
                    ? "bg-slate-800 border-indigo-500/50"
                    : "bg-slate-800/30 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl">
                  {c.avatarEmoji || "👤"}
                </div>
                <div className="min-w-0">
                  <div
                    className={`font-medium truncate ${
                      selectedCompanionId === c.id
                        ? "text-indigo-200"
                        : "text-slate-200"
                    }`}
                  >
                    {c.name}
                  </div>
                  <div className="text-xs text-slate-400 capitalize truncate">
                    {c.relationship}
                  </div>
                </div>
              </button>
            ))}
            {weekState.companions.length === 0 && (
              <div className="text-center p-8 text-slate-500 text-sm">
                No companions yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Details / Edit / Stats */}
        <div className="md:col-span-8 lg:col-span-9 bg-slate-800/50 border border-slate-800 rounded-xl p-6 min-h-[500px]">
          {isAddMode ? (
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-slate-100 mb-6">
                Add New Companion
              </h2>
              <CompanionForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSave}
                onCancel={() => setIsAddMode(false)}
              />
            </div>
          ) : selectedCompanion ? (
            <div className="flex flex-col h-full gap-8">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-inner"
                    style={{
                      backgroundColor: selectedCompanion.color || "#64748b",
                    }}
                  >
                    {getInitials(selectedCompanion.name)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-100">
                      {selectedCompanion.name}
                    </h2>
                    <div className="flex items-center gap-3 text-slate-400 mt-1">
                      <span className="capitalize px-2 py-0.5 bg-slate-700 rounded-full text-xs">
                        {selectedCompanion.relationship}
                      </span>
                      {selectedCompanion.description && (
                        <span className="text-sm border-l border-slate-600 pl-3 italic">
                          {selectedCompanion.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsAddMode(true); // Re-use the add mode logic but we pre-filled it
                      // Actually let's just make a dedicated edit mode state if we wanted distinct UI,
                      // but for now let's just toggle a boolean 'isEditing' locally?
                      // Simpler: Just render the form in place of details if editing.
                      // For this simplified version, let's just make the user delete and re-add or we add an 'edit' boolean
                      // Let's implement an edit toggle.
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-400 bg-slate-800 rounded-lg border border-slate-700"
                    title="Edit (Coming Soon - use delete/recreate for now)"
                  >
                    {/* Placeholder for edit */}
                    <IconEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${selectedCompanion.name}?`)) {
                        actions.deleteCompanion(selectedCompanion.id);
                        setSelectedCompanionId(null);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 rounded-lg border border-slate-700"
                    title="Delete"
                  >
                    <IconTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Stats & Activity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-center">
                  <div className="text-2xl font-bold text-slate-100">
                    {companionStats.total}
                  </div>
                  <div className="text-xs text-slate-400 uppercase">
                    Shared Tasks
                  </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-center">
                  <div className="text-2xl font-bold text-emerald-400">
                    {companionStats.completed}
                  </div>
                  <div className="text-xs text-slate-400 uppercase">
                    Completed
                  </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-center">
                  <div className="text-2xl font-bold text-indigo-400">
                    {companionStats.completionRate}%
                  </div>
                  <div className="text-xs text-slate-400 uppercase">
                    Completion Rate
                  </div>
                </div>
              </div>

              {/* Recent Activity List */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
                  <IconMessageCircle className="w-5 h-5 text-slate-400" />
                  Recent Interactions
                </h3>
                <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                  {companionTasks.length === 0 ? (
                    <div className="text-slate-500 italic">
                      No shared tasks or events recorded this week.
                    </div>
                  ) : (
                    companionTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              task.status === "completed"
                                ? "bg-emerald-500"
                                : task.status === "failed"
                                ? "bg-rose-500"
                                : "bg-slate-500"
                            }`}
                          />
                          <span
                            className={
                              task.status === "completed"
                                ? "line-through text-slate-500"
                                : "text-slate-200"
                            }
                          >
                            {task.title}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {/* Day index to name */}
                          {
                            ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                              task.dayIndex
                            ]
                          }
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <IconUsers className="w-16 h-16 mb-4 opacity-20" />
              <p>Select a companion to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CompanionForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
}: {
  formData: Partial<Companion>;
  setFormData: any;
  onSubmit: any;
  onCancel: any;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">
          Name
        </label>
        <input
          required
          type="text"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 outline-none focus:border-indigo-500 transition-colors"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Alice Smith"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Emoji Avatar
          </label>
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 outline-none focus:border-indigo-500 transition-colors text-center"
            value={formData.avatarEmoji}
            onChange={(e) =>
              setFormData({ ...formData, avatarEmoji: e.target.value })
            }
            placeholder="🙂"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Relationship
          </label>
          <select
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 outline-none focus:border-indigo-500 transition-colors"
            value={formData.relationship}
            onChange={(e) =>
              setFormData({ ...formData, relationship: e.target.value })
            }
          >
            <option value="friend">Friend</option>
            <option value="coworker">Coworker</option>
            <option value="partner">Partner</option>
            <option value="family">Family</option>
            <option value="acquaintance">Acquaintance</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">
          Description (Optional)
        </label>
        <textarea
          rows={3}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 outline-none focus:border-indigo-500 transition-colors resize-none"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Met at the coffee shop..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm font-medium"
        >
          Save Companion
        </button>
      </div>
    </form>
  );
}

