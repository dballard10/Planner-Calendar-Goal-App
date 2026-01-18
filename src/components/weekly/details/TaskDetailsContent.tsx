import { useState, useRef, useEffect } from "react";
import type {
  Task,
  TaskStatus,
  TaskLocation,
  WeeklyItemType,
  Goal,
  Companion,
} from "../../../types/weekly";
import { IconTrash } from "@tabler/icons-react";
import StatusSelector from "../task/StatusSelector";
import TaskDetailsForm from "./TaskDetailsForm";
import { ITEM_TYPE_STYLES, INFORMATIONAL_TYPES } from "../../../lib/itemTypeConfig";
import type { ItemTypeStyle } from "../../../lib/itemTypeConfig";
import {
  TASK_DETAILS_ACTIONS_WRAPPER,
  TASK_DETAILS_DELETE_BUTTON,
  TASK_DETAILS_HEADER,
  TASK_DETAILS_HEADER_ROW,
  TASK_DETAILS_ROOT,
  TASK_DETAILS_TITLE_DISPLAY,
  TASK_DETAILS_TITLE_INPUT,
  TASK_FORM_WRAPPER,
  TASK_LINKS_GRID,
  TASK_TYPE_BUTTON_BASE,
  TASK_TYPE_BUTTON_SELECTED,
  TASK_TYPE_BUTTON_UNSELECTED,
  TASK_TYPE_SELECTOR_BUTTONS,
  TASK_TYPE_SELECTOR_LABEL,
  TASK_TYPE_SELECTOR_WRAPPER,
} from "../styles";
import { GoalMultiSelect } from "./GoalMultiSelect";
import { CompanionSelector } from "./CompanionSelector";
import { useAppSettings } from "../../../context/AppSettingsContext";

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
  onLocationChange?: (location?: TaskLocation) => void;
  onDelete?: () => void;
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
  onLocationChange,
  onDelete,
}: TaskDetailsContentProps) {
  const settings = useAppSettings();
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
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>(
    task.goalIds ?? []
  );

  // Sync internal state if task changes (e.g. switching selection)
  useEffect(() => {
    setEditTitle(task.title);
    setIsEditingTitle(false);
    setSelectedGoalIds(task.goalIds ?? []);
  }, [task.id]); // Only reset on task ID change to preserve multi-selection state during updates

  const handleGoalsChange = (goalIds: string[]) => {
    setSelectedGoalIds(goalIds);
    onGoalsChange?.(goalIds);
  };

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

  const handleCompanionsChange = (companionIds: string[]) => {
    onCompanionsChange?.(companionIds);
  };

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
                const dynamicColor = settings.itemTypeColors[optionType];
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
                        ? TASK_TYPE_BUTTON_SELECTED
                        : TASK_TYPE_BUTTON_UNSELECTED
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: `${dynamicColor}33`,
                            borderColor: `${dynamicColor}66`,
                            color: dynamicColor,
                            border: `1px solid ${dynamicColor}66`,
                          }
                        : undefined
                    }
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
          <GoalMultiSelect
            goals={goals}
            selectedGoalIds={selectedGoalIds}
            onChange={handleGoalsChange}
          />
          <CompanionSelector
            companions={companions}
            selectedIds={task.companionIds ?? []}
            onChange={handleCompanionsChange}
          />
        </div>

        {/* Form Content */}
        <div>
          <TaskDetailsForm
            initialValues={{
              description: "", // TODO: Wire up description to task model
              linksMarkdown: task.linksMarkdown,
              location: task.location,
            }}
            onChange={(values) => {
              if (values.linksMarkdown !== task.linksMarkdown) {
                onLinksChange?.(values.linksMarkdown);
              }
              // Location changes are handled via a separate callback
            }}
            onLocationChange={onLocationChange}
          />
        </div>

        {/* Delete Action */}
        {onDelete && (
          <div className={TASK_DETAILS_ACTIONS_WRAPPER}>
            <button
              type="button"
              onClick={onDelete}
              className={TASK_DETAILS_DELETE_BUTTON}
            >
              <IconTrash className="w-4 h-4" />
              Delete task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
