import { IconArrowLeft } from "@tabler/icons-react";
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
import {
  TASK_DETAILS_PAGE_CONTAINER,
  TASK_DETAILS_PAGE_CONTENT_WRAPPER,
  TASK_DETAILS_PAGE_HEADER,
  TASK_DETAILS_PAGE_HEADER_BUTTON,
} from "../styles";

interface TaskDetailsFullPageProps {
  task: Task;
  goals: Goal[];
  companions: Companion[];
  recurrences?: Record<string, RecurrenceRule>;
  onBack: () => void;
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

export default function TaskDetailsFullPage({
  task,
  goals,
  companions,
  recurrences,
  onBack,
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
}: TaskDetailsFullPageProps) {
  return (
    <div className={TASK_DETAILS_PAGE_CONTAINER}>
      <div className={TASK_DETAILS_PAGE_HEADER}>
        <button onClick={onBack} className={TASK_DETAILS_PAGE_HEADER_BUTTON}>
          <IconArrowLeft className="w-4 h-4" />
          Back to Weekly View
        </button>
        <h1 className="text-lg font-semibold text-slate-100">Task Details</h1>
      </div>
      <div className={TASK_DETAILS_PAGE_CONTENT_WRAPPER}>
        <div className="max-w-4xl mx-auto p-6 min-h-full">
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
    </div>
  );
}
