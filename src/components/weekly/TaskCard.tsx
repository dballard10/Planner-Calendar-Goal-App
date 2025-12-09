import { useState, useEffect, useRef } from "react";
import type { Task, TaskStatus } from "../../types/weekly";
import { IconTrash } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import StatusSelector from "./StatusSelector";

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, nextStatus: TaskStatus) => void;
  onTitleChange: (taskId: string, newTitle: string) => void;
  onDelete?: (taskId: string) => void;
  onOpenDetailsSidePanel?: (taskId: string) => void;
  onOpenDetailsModal?: (taskId: string) => void;
  onOpenDetailsPage?: (taskId: string) => void;
}

const PLACEHOLDER_TEXT = "New task...";

export default function TaskCard({
  task,
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

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className="group w-full max-w-[1100px] mx-auto flex items-center gap-2 p-2 bg-slate-900 rounded border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer relative"
    >
      <div onClick={(e) => e.stopPropagation()}>
        <StatusSelector
          status={task.status}
          onChange={(nextStatus) => onStatusChange(task.id, nextStatus)}
        />
      </div>

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          onClick={(e) => e.stopPropagation()}
          placeholder={PLACEHOLDER_TEXT}
          className="flex-1 px-2 py-1 bg-slate-900 rounded text-slate-200 focus:outline-none"
        />
      ) : (
        <div className="flex-1 px-2 py-1 select-none">
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="inline-block text-slate-200 cursor-text transition-transform origin-left hover:scale-105"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {task.title}
            </ReactMarkdown>
          </div>
        </div>
      )}

      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
        <button
          onClick={handleDelete}
          className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
          aria-label="Delete task"
        >
          <IconTrash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
