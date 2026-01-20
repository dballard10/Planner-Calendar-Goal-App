import { useState, useEffect, useRef } from "react";
import type { Task, TaskStatus, Goal, Companion } from "../../../types/weekly";
import { IconTrash, IconSettings, IconCopy } from "@tabler/icons-react";
import StatusSelector from "./StatusSelector";
import {
  ITEM_TYPE_STYLES,
  INFORMATIONAL_TYPES,
} from "../../../lib/itemTypeConfig";
import AvatarStack from "../../ui/AvatarStack";
import {
  TASK_CARD_BODY,
  TASK_CARD_CONTAINER,
  TASK_CARD_INDICATORS_ROW,
  TASK_CARD_TITLE_DISPLAY,
  TASK_CARD_TITLE_INPUT,
  TASK_CARD_TITLE_WRAPPER,
  TASK_INDICATOR_GROUP,
  TASK_KIND_BADGE,
  TASK_ACTIONS_CONTAINER,
  TASK_ACTIONS_BASE_BUTTON,
  TASK_ACTIONS_STRIP,
  TASK_ACTION_ITEM_BUTTON,
  getTaskCardBaseClasses,
  getDynamicTaskCardGradientStyle,
} from "../styles";
import { InlineMarkdown } from "../shared/InlineMarkdown";
import { useAppSettings } from "../../../context/AppSettingsContext";
import CompanionAvatar from "../../ui/CompanionAvatar";

interface TaskCardProps {
  task: Task;
  goals?: Goal[];
  companions?: Companion[];
  onStatusChange: (taskId: string, nextStatus: TaskStatus) => void;
  onTitleChange: (taskId: string, newTitle: string) => void;
  onDelete?: (taskId: string) => void;
  onCopy?: (taskId: string) => void;
  onOpenDetailsSidePanel?: (taskId: string) => void;
  onOpenDetailsModal?: (taskId: string) => void;
  onOpenDetailsPage?: (taskId: string) => void;
  isHighlighted?: boolean;
}

const PLACEHOLDER_TEXT = "New task...";

export default function TaskCard({
  task,
  goals = [],
  companions = [],
  onStatusChange,
  onTitleChange,
  onDelete,
  onCopy,
  onOpenDetailsSidePanel,
  isHighlighted = false,
}: TaskCardProps) {
  const settings = useAppSettings();
  const isNewTask = task.title === PLACEHOLDER_TEXT;
  const [isEditing, setIsEditing] = useState(isNewTask);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isActionsExpanded, setIsActionsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text only for new tasks
      if (isNewTask) {
        inputRef.current.select();
      }
    }
  }, [isEditing, isNewTask]);

  const handleTitleBlur = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onTitleChange(task.id, editTitle.trim());
    } else if (!editTitle.trim()) {
      // If empty, restore original title or placeholder
      setEditTitle(task.title || PLACEHOLDER_TEXT);
    } else {
      setEditTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    } else if (e.key === "Escape") {
      setEditTitle(task.title);
      setIsEditing(false);
    }
    e.stopPropagation(); // Prevent card activation on Enter
  };

  const handleCardClick = () => {
    if (!isEditing && onOpenDetailsSidePanel) {
      onOpenDetailsSidePanel(task.id);
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (
      !isEditing &&
      (e.key === "Enter" || e.key === " ") &&
      onOpenDetailsSidePanel &&
      e.target === e.currentTarget
    ) {
      e.preventDefault();
      onOpenDetailsSidePanel(task.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(task.id);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCopy) {
      onCopy(task.id);
    }
  };

  const markdownComponents = {
    p: ({ node, ...props }: any) => <span {...props} />,
    strong: ({ node, ...props }: any) => (
      <strong className="font-bold" {...props} />
    ),
    em: ({ node, ...props }: any) => <em className="italic" {...props} />,
    h1: ({ node, ...props }: any) => (
      <span className="font-bold text-lg" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <span className="font-bold text-lg" {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <span className="font-bold text-lg" {...props} />
    ),
    h4: ({ node, ...props }: any) => (
      <span className="font-bold text-lg" {...props} />
    ),
    h5: ({ node, ...props }: any) => (
      <span className="font-bold text-lg" {...props} />
    ),
    h6: ({ node, ...props }: any) => (
      <span className="font-bold text-lg" {...props} />
    ),
  };

  const type = task.type ?? "task";
  const typeStyle = ITEM_TYPE_STYLES[type] ?? ITEM_TYPE_STYLES.task;
  const showStatusSelector = !INFORMATIONAL_TYPES.includes(type);

  // Get dynamic color from settings
  const dynamicColor = settings.itemTypeColors[type];
  const gradientStyle = getDynamicTaskCardGradientStyle(dynamicColor);

  // Determine text color based on type
  const baseTextClass = typeStyle.textColor || "text-slate-200";
  const highlightClass = isHighlighted
    ? "ring-2 ring-white/80 shadow-[0_0_8px_rgba(255,255,255,0.9)]"
    : "";

  const cardStyleClass = getTaskCardBaseClasses({
    itemType: type,
    textClass: baseTextClass,
    isClickable: true,
  });

  const taskGoals = (task.goalIds ?? [])
    .map((goalId) => goals.find((g) => g.id === goalId))
    .filter((g): g is Goal => !!g);
  // Resolve Companions
  const taskCompanions = task.companionIds
    ? (task.companionIds
        .map((cid) => companions.find((c) => c.id === cid))
        .filter(Boolean) as Companion[])
    : [];

  return (
    <div
      role="button"
      tabIndex={0}
      data-task-id={task.id}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className={`${TASK_CARD_CONTAINER} ${cardStyleClass} ${highlightClass}`}
      style={gradientStyle}
    >
      <div className={TASK_CARD_BODY}>
        {showStatusSelector && (
          <div onClick={(e) => e.stopPropagation()}>
            <StatusSelector
              status={task.status}
              onChange={(nextStatus) => onStatusChange(task.id, nextStatus)}
            />
          </div>
        )}

        <div className="flex-1 min-w-0 flex items-center gap-2 transition-all duration-700">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              maxLength={70}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              onClick={(e) => e.stopPropagation()}
              placeholder={PLACEHOLDER_TEXT}
              className={TASK_CARD_TITLE_INPUT}
            />
          ) : (
            <div
              className={`${TASK_CARD_TITLE_WRAPPER} ${
                isActionsExpanded ? "-translate-x-3" : "translate-x-0"
              }`}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className={TASK_CARD_TITLE_DISPLAY}
              >
                <InlineMarkdown
                  content={
                    task.title.length > 100
                      ? `${task.title.slice(0, 100)}...`
                      : task.title
                  }
                />
              </div>
            </div>
          )}
        </div>

        <div
          className={`${TASK_CARD_INDICATORS_ROW} transition-all duration-300 ${
            isActionsExpanded ? "pr-20" : "pr-0"
          }`}
        >
          {/* Indicators Row */}
          {!isEditing &&
            (taskGoals.length > 0 || taskCompanions.length > 0) && (
              <div className={TASK_INDICATOR_GROUP}>
                {taskGoals.length > 0 && (
                  <AvatarStack
                    items={taskGoals.map((goal) => ({
                      id: goal.id,
                      content: goal.emoji || "🎯",
                      label: goal.name,
                      bgColor: goal.color ?? "#475569",
                    }))}
                    maxVisible={3}
                    size={22}
                  />
                )}
                {taskCompanions.length > 0 && (
                  <div className="flex items-center -space-x-1.5">
                    {taskCompanions.slice(0, 3).map((c) => (
                      <CompanionAvatar
                        key={c.id}
                        name={c.name}
                        color={c.color}
                        size="sm"
                        className="border border-slate-800"
                      />
                    ))}
                    {taskCompanions.length > 3 && (
                      <div className="w-5 h-5 rounded-full bg-slate-700 border border-slate-800 flex items-center justify-center text-[8px] text-slate-400 font-medium">
                        +{taskCompanions.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          <div className={TASK_KIND_BADGE}>
            <span
              className={`text-xs font-semibold select-none ${
                typeStyle.badgeText || "text-slate-400"
              }`}
            >
              {typeStyle.label}
            </span>
          </div>
        </div>
      </div>

      {(onDelete || onCopy) && (
        <div
          className={TASK_ACTIONS_CONTAINER}
          onMouseEnter={() => setIsActionsExpanded(true)}
          onMouseLeave={() => setIsActionsExpanded(false)}
          onFocusCapture={() => setIsActionsExpanded(true)}
          onBlurCapture={() => setIsActionsExpanded(false)}
        >
          <div className={TASK_ACTIONS_STRIP}>
            {onCopy && (
              <button
                onClick={handleCopy}
                className={TASK_ACTION_ITEM_BUTTON}
                aria-label="Copy task"
                title="Copy task"
              >
                <IconCopy className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className={`${TASK_ACTION_ITEM_BUTTON} hover:!text-red-400`}
                aria-label="Delete task"
                title="Delete task"
              >
                <IconTrash className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            className={TASK_ACTIONS_BASE_BUTTON}
            aria-label="Task actions"
            onClick={(e) => e.stopPropagation()}
          >
            <IconSettings className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
