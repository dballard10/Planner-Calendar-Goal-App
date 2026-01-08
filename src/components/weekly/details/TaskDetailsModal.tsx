import { createPortal } from "react-dom";
import { useEffect } from "react";
import type {
  Task,
  TaskStatus,
  TaskLocation,
  WeeklyItemType,
  Goal,
  Companion,
} from "../../../types/weekly";
import TaskDetailsContent from "./TaskDetailsContent";
import { IconX } from "@tabler/icons-react";
import {
  TASK_MODAL_BACKDROP,
  TASK_MODAL_FRAME,
  TASK_MODAL_OVERLAY,
  TASK_MODAL_CLOSE_BUTTON,
  TASK_MODAL_VIEWPORT,
} from "../styles";

interface TaskDetailsModalProps {
  task: Task;
  goals: Goal[];
  companions: Companion[];
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (status: TaskStatus) => void;
  onTitleChange?: (title: string) => void;
  onTypeChange?: (type: WeeklyItemType) => void;
  onGoalsChange?: (goalIds: string[]) => void;
  onCompanionsChange?: (companionIds: string[]) => void;
  onLinksChange?: (linksMarkdown?: string) => void;
  onLocationChange?: (location?: TaskLocation) => void;
}

export default function TaskDetailsModal({
  task,
  goals,
  companions,
  isOpen,
  onClose,
  onStatusChange,
  onTitleChange,
  onTypeChange,
  onGoalsChange,
  onCompanionsChange,
  onLinksChange,
  onLocationChange,
}: TaskDetailsModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className={TASK_MODAL_OVERLAY}>
      <div className={TASK_MODAL_FRAME} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={TASK_MODAL_CLOSE_BUTTON}>
          <IconX className="w-5 h-5" />
        </button>
        <div className={TASK_MODAL_VIEWPORT}>
          <TaskDetailsContent
            task={task}
            goals={goals}
            companions={companions}
            onStatusChange={onStatusChange}
            onTitleChange={onTitleChange}
            onTypeChange={onTypeChange}
            onGoalsChange={onGoalsChange}
            onCompanionsChange={onCompanionsChange}
            onLinksChange={onLinksChange}
            onLocationChange={onLocationChange}
          />
        </div>
      </div>
      <div className={TASK_MODAL_BACKDROP} onClick={onClose} />
    </div>,
    document.body
  );
}
