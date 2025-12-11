import { useState, useEffect, useRef } from "react";
import type { Task, TaskStatus, Goal, Companion } from "../../types/weekly";
import { IconTrash } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import StatusSelector from "./StatusSelector";
import { getSubtypeStyle } from "./subtypeStyles";

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

  const kind = task.kind ?? "task";
  const subtypeStyle = getSubtypeStyle(task.subtype);

  // Determine base classes (background & text) based on kind
  const baseClasses =
    kind === "event"
      ? "bg-sky-900/30 text-slate-200"
      : "bg-slate-900 text-slate-200";

  // Determine border classes
  // Default borders based on kind
  let borderClass =
    kind === "event"
      ? "border-sky-700/50 hover:border-sky-500"
      : "border-slate-700 hover:border-slate-600";

  // If subtype exists and has a border defined, override it.
  if (subtypeStyle?.border) {
    borderClass = subtypeStyle.border;
  }

  const cardStyleClass = `${baseClasses} ${borderClass} shadow-sm`;

  // Resolve Linked Goal
  const linkedGoal = task.goalId
    ? goals.find((g) => g.id === task.goalId)
    : null;
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
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className={`group relative w-full max-w-[1100px] mx-auto rounded border cursor-pointer overflow-hidden transition-all ${cardStyleClass}`}
    >
      <div className="flex items-center gap-2 w-full p-2 pr-8">
        <div onClick={(e) => e.stopPropagation()}>
          <StatusSelector
            status={task.status}
            onChange={(nextStatus) => onStatusChange(task.id, nextStatus)}
          />
        </div>

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
              className="flex-1 w-full px-2 py-1 bg-transparent rounded text-inherit focus:outline-none"
            />
          ) : (
            <div className="flex-1 px-2 py-1 select-none truncate">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="inline-block text-inherit cursor-text transition-transform origin-left hover:scale-105"
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

        <div className="flex items-center gap-2 transition-transform duration-200 ease-out group-hover:-translate-x-3 group-focus-within:-translate-x-3">
          {/* Indicators Row */}
          {!isEditing && (linkedGoal || taskCompanions.length > 0) && (
            <div className="flex items-center gap-2 px-2 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
              {linkedGoal && (
                <div className="flex items-center gap-1 text-[10px] bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-700/50 text-slate-300">
                  <span>{linkedGoal.emoji}</span>
                  <span className="truncate max-w-[80px]">
                    {linkedGoal.name}
                  </span>
                </div>
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

          {subtypeStyle?.label && (
            <div className="flex-shrink-0 h-6 flex items-center justify-end min-w-[40px]">
              <span
                className={`text-xs font-semibold select-none ${
                  subtypeStyle.text || "text-slate-400"
                }`}
              >
                {subtypeStyle.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {onDelete && (
        <button
          onClick={handleDelete}
          className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded transition-all duration-200 ease-out
            text-slate-400 hover:text-red-400 hover:bg-slate-800
            opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
            pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto`}
          aria-label="Delete task"
        >
          <IconTrash className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
