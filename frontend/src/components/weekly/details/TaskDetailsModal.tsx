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
import { IconX, IconCheck } from "@tabler/icons-react";
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
  isDirty?: boolean;
  onSave?: () => void;
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
  onNotesChange,
  onLocationChange,
  onScheduleChange,
  onRecurrenceChange,
  onDelete,
  isDirty,
  onSave,
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
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <button
            type="button"
            onClick={isDirty ? onSave : undefined}
            disabled={!isDirty}
            className={`p-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
              isDirty
                ? "text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 hover:scale-110 active:scale-95"
                : "text-slate-500 opacity-40 cursor-default"
            }`}
            title={isDirty ? "Save changes" : "No pending changes"}
            aria-label="Save changes"
          >
            <IconCheck className="w-5 h-5" />
          </button>
          <button onClick={onClose} className={TASK_MODAL_CLOSE_BUTTON}>
            <IconX className="w-5 h-5" />
          </button>
        </div>
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
