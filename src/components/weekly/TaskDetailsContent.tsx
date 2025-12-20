import { useState, useRef, useEffect, useMemo } from "react";
import type {
  Task,
  TaskStatus,
  WeeklyItemType,
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
import {
  ITEM_TYPE_STYLES,
  INFORMATIONAL_TYPES,
} from "../../lib/itemTypeConfig";
import type { ItemTypeStyle } from "../../lib/itemTypeConfig";
import {
  TASK_COMPANION_AVATAR,
  TASK_COMPANION_INPUT,
  TASK_COMPANION_INPUT_WRAPPER,
  TASK_COMPANION_LABEL,
  TASK_COMPANION_PILL,
  TASK_COMPANION_PILL_AVATAR,
  TASK_COMPANION_PILL_ICON,
  TASK_COMPANION_SELECTED_LIST,
  TASK_COMPANION_SELECTOR,
  TASK_COMPANION_SHOW_MORE_BUTTON,
  TASK_COMPANION_SUGGESTION,
  TASK_COMPANION_DROPDOWN,
  TASK_DETAILS_HEADER,
  TASK_DETAILS_HEADER_ROW,
  TASK_DETAILS_ROOT,
  TASK_DETAILS_TITLE_DISPLAY,
  TASK_DETAILS_TITLE_INPUT,
  TASK_FORM_WRAPPER,
  TASK_GOAL_BUTTON,
  TASK_GOAL_BUTTON_SELECTED,
  TASK_GOAL_BUTTON_UNSELECTED,
  TASK_GOAL_DROPDOWN,
  TASK_GOAL_PILL,
  TASK_GOAL_PILL_AVATAR_BORDER,
  TASK_GOAL_PILL_REMOVE_ICON,
  TASK_GOAL_PILLS_WRAP,
  TASK_GOAL_SELECTOR,
  TASK_GOAL_SELECTOR_LABEL,
  TASK_GOAL_TRIGGER,
  TASK_LINKS_GRID,
  TASK_TYPE_BUTTON_BASE,
  TASK_TYPE_BUTTON_SELECTED,
  TASK_TYPE_BUTTON_UNSELECTED,
  TASK_TYPE_SELECTOR_BUTTONS,
  TASK_TYPE_SELECTOR_LABEL,
  TASK_TYPE_SELECTOR_WRAPPER,
} from "./taskStyles";

interface TaskDetailsContentProps {
  task: Task;
  goals: Goal[];
  companions: Companion[];
  onStatusChange?: (status: TaskStatus) => void;
  onTitleChange?: (title: string) => void;
  onTypeChange?: (type: WeeklyItemType) => void;
  onGoalsChange?: (goalIds: string[]) => void;
  onCompanionsChange?: (companionIds: string[]) => void;
  onLinksChange?: (linksMarkdown?: string) => void;
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
  onTypeChange,
  onGoalsChange,
  onCompanionsChange,
  onLinksChange,
}: TaskDetailsContentProps) {
  // We can initialize the form with data from the task later.
  // For now, we just pass the task title if we want, or rely on internal form state.

  const type = task.type;
  const showStatusSelector = !INFORMATIONAL_TYPES.includes(type);
  const typeOptions = Object.entries(ITEM_TYPE_STYLES) as [
    WeeklyItemType,
    ItemTypeStyle
  ][];

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
    setSelectedGoalIds(task.goalIds ?? []);

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
    onGoalsChange?.(newSelection);
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
    <div className={TASK_DETAILS_ROOT}>
      {/* Header Section */}
      <div className={TASK_DETAILS_HEADER}>
        <div className={TASK_DETAILS_HEADER_ROW}>
          {showStatusSelector && (
            <div className="mt-1">
              <StatusSelector
                status={task.status}
                onChange={(newStatus) => onStatusChange?.(newStatus)}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <input
                ref={inputRef}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={handleTitleKeyDown}
                className={TASK_DETAILS_TITLE_INPUT}
                placeholder="Task title"
              />
            ) : (
              <h2
                onClick={() => setIsEditingTitle(true)}
                className={TASK_DETAILS_TITLE_DISPLAY}
              >
                {task.title}
              </h2>
            )}
          </div>
        </div>

        {/* Type Selector */}
        <div className={TASK_TYPE_SELECTOR_WRAPPER}>
          <div className={TASK_TYPE_SELECTOR_LABEL}>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Type
            </span>
            <div className={TASK_TYPE_SELECTOR_BUTTONS}>
              {typeOptions.map(([optionType, style]) => {
                const isSelected = type === optionType;
                return (
                  <button
                    key={optionType}
                    onClick={() => {
                      if (optionType !== type) {
                        onTypeChange?.(optionType);
                      }
                    }}
                    className={`${TASK_TYPE_BUTTON_BASE} ${
                      isSelected
                        ? `${style.pillBackground} ${style.badgeText} ${TASK_TYPE_BUTTON_SELECTED}`
                        : TASK_TYPE_BUTTON_UNSELECTED
                    }`}
                    title={style.label}
                  >
                    {style.label}
                  </button>
                );
              })}
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
      <div className={TASK_FORM_WRAPPER}>
        {/* Linking Section (Goals & Companions) */}
        <div className={TASK_LINKS_GRID}>
          {/* Goals Selector */}
          <div className={TASK_GOAL_SELECTOR} ref={goalDropdownRef}>
            <div className={TASK_GOAL_SELECTOR_LABEL}>
              <IconTarget className="w-4 h-4" />
              Linked Goal
            </div>

            {/* Custom Multi-Select Trigger */}
            <div
              onClick={() => setIsGoalDropdownOpen(!isGoalDropdownOpen)}
              className={TASK_GOAL_TRIGGER}
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
              <div className={TASK_GOAL_DROPDOWN}>
                <div className="p-1 space-y-0.5">
                  {goals.length > 0 ? (
                    goals.map((g) => {
                      const isSelected = selectedGoalIds.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          onClick={() => handleToggleGoal(g.id)}
                          className={`${TASK_GOAL_BUTTON} ${
                            isSelected
                              ? TASK_GOAL_BUTTON_SELECTED
                              : TASK_GOAL_BUTTON_UNSELECTED
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
            <div className={TASK_GOAL_PILLS_WRAP}>
              {selectedGoals.length > 0 ? (
                selectedGoals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleToggleGoal(g.id)}
                    className={TASK_GOAL_PILL}
                    title={`Unlink ${g.name}`}
                  >
                    <div className="relative w-5 h-5">
                      <div
                        className={TASK_GOAL_PILL_AVATAR_BORDER}
                        style={{ backgroundColor: g.color ?? "#475569" }}
                      >
                        <span className="text-[11px] leading-none">
                          {g.emoji}
                        </span>
                      </div>
                      <div className={TASK_GOAL_PILL_REMOVE_ICON}>
                        <IconX className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                    <span>{g.name}</span>
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
          <div className={TASK_COMPANION_SELECTOR}>
            <div className={TASK_COMPANION_LABEL}>
              <IconUsers className="w-4 h-4" />
              Companions
            </div>

            {/* Search Input with Autocomplete Dropdown */}
            <div
              className={TASK_COMPANION_INPUT_WRAPPER}
              ref={companionDropdownRef}
            >
              <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search to add..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsCompanionDropdownOpen(true)}
                className={TASK_COMPANION_INPUT}
              />

              {/* Dropdown Results */}
              {isCompanionDropdownOpen && (
                <div className={TASK_COMPANION_DROPDOWN}>
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
                          className={TASK_COMPANION_SUGGESTION}
                        >
                          <div
                            className={TASK_COMPANION_AVATAR}
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
            <div className={TASK_COMPANION_SELECTED_LIST}>
              {selectedCompanions.length > 0 ? (
                <>
                  {selectedCompanions
                    .slice(0, showAllCompanions ? undefined : 5)
                    .map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleToggleCompanion(c.id)}
                        className={TASK_COMPANION_PILL}
                        title={`Remove ${c.name}`}
                      >
                        <div className="relative w-4 h-4 flex items-center justify-center">
                          {/* Default: Initials Avatar */}
                          <div
                            className={TASK_COMPANION_PILL_AVATAR}
                            style={{ backgroundColor: c.color || "#64748b" }}
                          >
                            {getInitials(c.name)}
                          </div>
                          {/* Hover: X Icon */}
                          <div className={TASK_COMPANION_PILL_ICON}>
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
                      className={TASK_COMPANION_SHOW_MORE_BUTTON}
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
            initialValues={{
              description: "", // TODO: Wire up description to task model
              linksMarkdown: task.linksMarkdown,
            }}
            onChange={(values) => {
              if (values.linksMarkdown !== task.linksMarkdown) {
                onLinksChange?.(values.linksMarkdown);
              }
              // Placeholder for other fields
            }}
          />
        </div>
      </div>
    </div>
  );
}
