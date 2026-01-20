import { createPortal } from "react-dom";
import { useEffect } from "react";
import type {
  Task,
  TaskStatus,
  TaskLocation,
  WeeklyItemType,
  Goal,
  Companion,
  RecurrenceRule,
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
  recurrences?: Record<string, RecurrenceRule>;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (status: TaskStatus) => void;
  onTitleChange?: (title: string) => void;
  onTypeChange?: (type: WeeklyItemType) => void;
  onGoalsChange?: (goalIds: string[]) => void;
  onCompanionsChange?: (companionIds: string[]) => void;
  onLinksChange?: (linksMarkdown?: string) => void;
  onNotesChange?: (notesMarkdown?: string) => void;
  onLocationChange?: (location?: TaskLocation) => void;
  onScheduleChange?: (schedule: {
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
  }) => void;
  onRecurrenceChange?: (
    rule: Omit<
      RecurrenceRule,
      | "id"
      | "title"
      | "type"
      | "goalIds"
      | "companionIds"
      | "linksMarkdown"
      | "location"
      | "groupId"
    > | null
  ) => void;
  onDelete?: () => void;
}

export default function TaskDetailsModal({
  task,
  goals,
  companions,
  recurrences,
  isOpen,
  onClose,
  onStatusChange,
  onTitleChange,
  onTypeChange,
  onGoalsChange,
  onCompanionsChange,
  onLinksChange,
  onLocationChange,
  onScheduleChange,
  onRecurrenceChange,
  onDelete,
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
            recurrences={recurrences}
            onStatusChange={onStatusChange}
            onTitleChange={onTitleChange}
            onTypeChange={onTypeChange}
            onGoalsChange={onGoalsChange}
            onCompanionsChange={onCompanionsChange}
            onLinksChange={onLinksChange}
            onNotesChange={onNotesChange}
            onLocationChange={onLocationChange}
            onScheduleChange={onScheduleChange}
            onRecurrenceChange={onRecurrenceChange}
            onDelete={onDelete}
          />
        </div>
      </div>
      <div className={TASK_MODAL_BACKDROP} onClick={onClose} />
    </div>,
    document.body
  );
}
