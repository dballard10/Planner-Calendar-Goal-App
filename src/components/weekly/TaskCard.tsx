import { useState, useEffect, useRef } from "react";
import type { Task, TaskStatus, Goal, Companion } from "../../types/weekly";
import { IconTrash } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import StatusSelector from "./StatusSelector";
import {
  ITEM_TYPE_STYLES,
  INFORMATIONAL_TYPES,
} from "../../lib/itemTypeConfig";
import EmojiCircleStack from "../ui/EmojiCircleStack";
import {
  TASK_CARD_BODY,
  TASK_CARD_CONTAINER,
  TASK_CARD_INDICATORS_ROW,
  TASK_CARD_TITLE_DISPLAY,
  TASK_CARD_TITLE_INPUT,
  TASK_CARD_TITLE_WRAPPER,
  TASK_DELETE_BUTTON,
  TASK_INDICATOR_GROUP,
  TASK_KIND_BADGE,
  getTaskCardStyleClass,
} from "./taskStyles";

interface TaskCardProps {
  task: Task;
  goals?: Goal[];
  companions?: Companion[];
  onStatusChange: (taskId: string, nextStatus: TaskStatus) => void;
  onTitleChange: (taskId: string, newTitle: string) => void;
  onDelete?: (taskId: string) => void;
  onOpenDetailsSidePanel?: (taskId: string) => void;
  onOpenDetailsModal?: (taskId: string) => void;
  onOpenDetailsPage?: (taskId: string) => void;
  isHighlighted?: boolean;
}

const PLACEHOLDER_TEXT = "New task...";

// Helper to get initials
function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TaskCard({
  task,
  goals = [],
  companions = [],
  onStatusChange,
  onTitleChange,
  onDelete,
  onOpenDetailsSidePanel,
  onOpenDetailsModal,
  onOpenDetailsPage,
  isHighlighted = false,
}: TaskCardProps) {
  const isNewTask = task.title === PLACEHOLDER_TEXT;
  const [isEditing, setIsEditing] = useState(isNewTask);
  const [editTitle, setEditTitle] = useState(task.title);
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

  // Determine text color based on type
  const baseTextClass = typeStyle.textColor || "text-slate-200";
  const highlightClass = isHighlighted
    ? "ring-2 ring-white/80 shadow-[0_0_8px_rgba(255,255,255,0.9)]"
    : "";

  const cardStyleClass = getTaskCardStyleClass({
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

        <div className="flex-1 min-w-0 flex items-center gap-2">
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
            <div className={TASK_CARD_TITLE_WRAPPER}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className={TASK_CARD_TITLE_DISPLAY}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {task.title.length > 100
                    ? `${task.title.slice(0, 100)}...`
                    : task.title}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <div className={TASK_CARD_INDICATORS_ROW}>
          {/* Indicators Row */}
          {!isEditing &&
            (taskGoals.length > 0 || taskCompanions.length > 0) && (
              <div className={TASK_INDICATOR_GROUP}>
                {taskGoals.length > 0 && (
                  <EmojiCircleStack
                    items={taskGoals.map((goal) => ({
                      id: goal.id,
                      emoji: goal.emoji,
                      label: goal.name,
                      style: {
                        backgroundColor: goal.color ?? "#475569",
                      },
                    }))}
                    maxVisible={3}
                    size={20}
                    circleClassName="border border-slate-800 text-[11px] text-white shadow-sm"
                    overflowClassName="border border-slate-800 bg-slate-900/80 text-[10px] text-slate-300"
                  />
                )}
                {taskCompanions.length > 0 && (
                  <div className="flex items-center -space-x-1.5">
                    {taskCompanions.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className="w-5 h-5 rounded-full border border-slate-800 flex items-center justify-center text-[9px] font-medium text-white shadow-sm"
                        style={{ backgroundColor: c.color || "#64748b" }}
                        title={c.name}
                      >
                        {getInitials(c.name)}
                      </div>
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

      {onDelete && (
        <button
          onClick={handleDelete}
          className={TASK_DELETE_BUTTON}
          aria-label="Delete task"
        >
          <IconTrash className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
