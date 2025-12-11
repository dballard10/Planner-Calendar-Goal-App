import { useState, useRef, useEffect, useMemo } from "react";
import type {
  Task,
  TaskStatus,
  TaskKind,
  AnySubtype,
  Goal,
  Companion,
} from "../../types/weekly";
import StatusSelector from "./StatusSelector";
import TaskDetailsForm from "./TaskDetailsForm";
import {
  IconTarget,
  IconUsers,
  IconX,
  IconSearch,
  IconChevronDown,
  IconCheck,
} from "@tabler/icons-react";

interface TaskDetailsContentProps {
  task: Task;
  goals: Goal[];
  companions: Companion[];
  onStatusChange?: (status: TaskStatus) => void;
  onTitleChange?: (title: string) => void;
  onKindChange?: (kind: TaskKind) => void;
  onSubtypeChange?: (subtype: AnySubtype | undefined) => void;
  onGoalChange?: (goalId: string | null) => void;
  onCompanionsChange?: (companionIds: string[]) => void;
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

export default function TaskDetailsContent({
  task,
  goals,
  companions,
  onStatusChange,
  onTitleChange,
  onKindChange,
  onSubtypeChange,
  onGoalChange,
  onCompanionsChange,
}: TaskDetailsContentProps) {
  // We can initialize the form with data from the task later.
  // For now, we just pass the task title if we want, or rely on internal form state.

  const kind = task.kind ?? "task";

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Goal Selection State
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);
  const [isGoalDropdownOpen, setIsGoalDropdownOpen] = useState(false);
  const goalDropdownRef = useRef<HTMLDivElement>(null);

  // Companion Search & Selection State
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllCompanions, setShowAllCompanions] = useState(false);
  const [isCompanionDropdownOpen, setIsCompanionDropdownOpen] = useState(false);
  const companionDropdownRef = useRef<HTMLDivElement>(null);

  // Sync internal state if task changes (e.g. switching selection)
  useEffect(() => {
    setEditTitle(task.title);
    setIsEditingTitle(false);

    // Reset goals for new task
    if (task.goalId) {
      setSelectedGoalIds([task.goalId]);
    } else {
      setSelectedGoalIds([]);
    }

    // Reset search/dropdowns when switching tasks
    setSearchQuery("");
    setShowAllCompanions(false);
    setIsGoalDropdownOpen(false);
  }, [task.id]); // Only reset on task ID change to preserve multi-selection state during updates

  // Handle click outside for goal dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        goalDropdownRef.current &&
        !goalDropdownRef.current.contains(event.target as Node)
      ) {
        setIsGoalDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle click outside for companion dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        companionDropdownRef.current &&
        !companionDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCompanionDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleGoal = (goalId: string) => {
    let newSelection: string[];
    if (selectedGoalIds.includes(goalId)) {
      newSelection = selectedGoalIds.filter((id) => id !== goalId);
    } else {
      newSelection = [...selectedGoalIds, goalId];
    }

    setSelectedGoalIds(newSelection);

    // Bridge to single-goal data model: pick first or null
    const primaryGoalId = newSelection.length > 0 ? newSelection[0] : null;
    onGoalChange?.(primaryGoalId);
  };

  // Derived Companion Lists
  const selectedGoals = useMemo(() => {
    return selectedGoalIds
      .map((id) => goals.find((g) => g.id === id))
      .filter((g): g is Goal => !!g);
  }, [selectedGoalIds, goals]);

  const selectedCompanions = useMemo(() => {
    const ids = task.companionIds || [];
    // Map IDs to companion objects, filtering out any that might not exist in the props list
    return ids
      .map((id) => companions.find((c) => c.id === id))
      .filter((c): c is Companion => !!c);
  }, [task.companionIds, companions]);

  const availableCompanions = useMemo(() => {
    const selectedIds = new Set(task.companionIds || []);
    return companions.filter((c) => !selectedIds.has(c.id));
  }, [companions, task.companionIds]);

  const filteredAvailableCompanions = useMemo(() => {
    if (!searchQuery.trim()) return availableCompanions;
    const lowerQuery = searchQuery.toLowerCase();
    return availableCompanions.filter((c) =>
      c.name.toLowerCase().includes(lowerQuery)
    );
  }, [availableCompanions, searchQuery]);

  // Focus and select all text when entering edit mode
  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const saveTitle = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== task.title) {
      onTitleChange?.(trimmed);
    } else if (!trimmed) {
      // Revert if empty
      setEditTitle(task.title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveTitle();
    } else if (e.key === "Escape") {
      setEditTitle(task.title);
      setIsEditingTitle(false);
    }
  };

  const handleToggleCompanion = (companionId: string) => {
    const currentIds = task.companionIds || [];
    if (currentIds.includes(companionId)) {
      onCompanionsChange?.(currentIds.filter((id) => id !== companionId));
    } else {
      onCompanionsChange?.([...currentIds, companionId]);
    }
  };

  const companionSuggestions = searchQuery.trim()
    ? filteredAvailableCompanions
    : availableCompanions.slice(0, 5);

  return (
    <div className="flex flex-col h-full">
      {/* Header Section - stays fixed while the rest scrolls */}
      <div className="sticky top-0 z-10 flex flex-col gap-4 border-b border-slate-700 bg-slate-900/95 backdrop-blur-sm px-4 pt-4 pb-4">
        <div className="flex items-start gap-3">
          {/* Status Selector reused here */}
          <div className="mt-1">
            <StatusSelector
              status={task.status}
              onChange={(newStatus) => onStatusChange?.(newStatus)}
            />
          </div>

          {/* Title - Editable */}
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <input
                ref={inputRef}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={handleTitleKeyDown}
                className="text-xl font-bold text-slate-100 leading-tight bg-transparent border-none outline-none p-0 mt-1.5 focus:ring-0 w-full placeholder-slate-500"
                placeholder="Task title"
              />
            ) : (
              <h2
                onClick={() => setIsEditingTitle(true)}
                className="text-xl font-bold text-slate-100 leading-tight break-words cursor-text hover:text-white mt-1.5 transition-colors"
              >
                {task.title}
              </h2>
            )}
          </div>
        </div>

        {/* Metadata & Kind Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Type
            </span>
            <div className="flex bg-slate-800 rounded p-0.5 border border-slate-700">
              <button
                onClick={() => onKindChange?.("task")}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  kind === "task"
                    ? "bg-slate-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Task
              </button>
              <button
                onClick={() => onKindChange?.("event")}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  kind === "event"
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Event
              </button>
            </div>
          </div>

          {task.groupId && (
            <div className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 w-fit text-xs border border-slate-700">
              Group ID: {task.groupId.slice(0, 8)}...
            </div>
          )}
        </div>
      </div>

      {/* Content below the header - scrolls with the sidebar/modal */}
      <div className="flex-1 px-4 pb-4 pt-6 space-y-6">
        {/* Linking Section (Goals & Companions) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-700 pb-6">
          {/* Goals Selector */}
          <div className="space-y-2 relative" ref={goalDropdownRef}>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
              <IconTarget className="w-4 h-4" />
              Linked Goal
            </div>

            {/* Custom Multi-Select Trigger */}
            <div
              onClick={() => setIsGoalDropdownOpen(!isGoalDropdownOpen)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 outline-none hover:border-slate-600 cursor-pointer flex items-center justify-between transition-colors min-h-[38px]"
            >
              <span className="text-slate-400 select-none">
                {selectedGoals.length > 0
                  ? `${selectedGoals.length} goal${
                      selectedGoals.length === 1 ? "" : "s"
                    } linked`
                  : "Select goals..."}
              </span>
              <IconChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform ${
                  isGoalDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* Dropdown Menu */}
            {isGoalDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto z-30 ring-1 ring-slate-800 animate-in fade-in zoom-in-95 duration-100">
                <div className="p-1 space-y-0.5">
                  {goals.length > 0 ? (
                    goals.map((g) => {
                      const isSelected = selectedGoalIds.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          onClick={() => handleToggleGoal(g.id)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-left group ${
                            isSelected
                              ? "bg-indigo-600/10 text-indigo-200"
                              : "hover:bg-slate-800 text-slate-300 hover:text-slate-100"
                          }`}
                        >
                          <span className="flex-shrink-0 w-5 text-center">
                            {g.emoji}
                          </span>
                          <span className="flex-1 truncate">{g.name}</span>
                          {isSelected && (
                            <IconCheck className="w-4 h-4 text-indigo-400" />
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-3 text-xs text-slate-500 text-center italic">
                      No goals available
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selected Goals Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedGoals.length > 0 ? (
                selectedGoals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleToggleGoal(g.id)}
                    className="group flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border bg-indigo-600/20 border-indigo-500/50 text-indigo-200 hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-200 transition-all"
                    title={`Unlink ${g.name}`}
                  >
                    <span>{g.emoji}</span>
                    <span>{g.name}</span>
                    <IconX className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                  </button>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic">
                  No goal linked.
                </div>
              )}
            </div>
          </div>

          {/* Companions Selector */}
          <div className="space-y-3 relative">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
              <IconUsers className="w-4 h-4" />
              Companions
            </div>

            {/* Search Input with Autocomplete Dropdown */}
            <div className="relative z-20" ref={companionDropdownRef}>
              <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search to add..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsCompanionDropdownOpen(true)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />

              {/* Dropdown Results */}
              {isCompanionDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto z-30 ring-1 ring-slate-800">
                  {companionSuggestions.length > 0 ? (
                    <div className="p-1 space-y-0.5">
                      {companionSuggestions.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            handleToggleCompanion(c.id);
                            setSearchQuery(""); // Clear search after adding
                            // Keep dropdown open so user can quickly add more
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800 rounded transition-colors text-left group"
                        >
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                            style={{ backgroundColor: c.color || "#64748b" }}
                          >
                            {getInitials(c.name)}
                          </div>
                          <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">
                            {c.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-xs text-slate-500 text-center italic">
                      No companions available to add
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Companions List (Attached) */}
            <div className="flex flex-wrap gap-2">
              {selectedCompanions.length > 0 ? (
                <>
                  {selectedCompanions
                    .slice(0, showAllCompanions ? undefined : 5)
                    .map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleToggleCompanion(c.id)}
                        className="group flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border bg-indigo-600/20 border-indigo-500/50 text-indigo-200 hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-200 transition-all"
                        title={`Remove ${c.name}`}
                      >
                        <div className="relative w-4 h-4 flex items-center justify-center">
                          {/* Default: Initials Avatar */}
                          <div
                            className="absolute inset-0 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-sm transition-opacity group-hover:opacity-0"
                            style={{ backgroundColor: c.color || "#64748b" }}
                          >
                            {getInitials(c.name)}
                          </div>
                          {/* Hover: X Icon */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <IconX className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <span>{c.name}</span>
                      </button>
                    ))}

                  {/* Expand/Collapse Button */}
                  {selectedCompanions.length > 5 && (
                    <button
                      onClick={() => setShowAllCompanions(!showAllCompanions)}
                      className="px-2 py-1 rounded-full text-xs font-medium border bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
                    >
                      {showAllCompanions
                        ? "Show Less"
                        : `+${selectedCompanions.length - 5} more`}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  No companions linked.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div>
          <TaskDetailsForm
            kind={kind}
            initialValues={{
              subtype: task.subtype,
              description: "", // TODO: Wire up description to task model
            }}
            onChange={(values) => {
              if (values.subtype !== task.subtype) {
                onSubtypeChange?.(values.subtype);
              }
              // Placeholder for other fields
            }}
          />
        </div>
      </div>
    </div>
  );
}
