import { IconArrowLeft } from "@tabler/icons-react";
import type {
  Task,
  TaskStatus,
  TaskKind,
  AnySubtype,
  Goal,
  Companion,
} from "../../types/weekly";
import TaskDetailsContent from "./TaskDetailsContent";

interface TaskDetailsFullPageProps {
  task: Task;
  goals: Goal[];
  companions: Companion[];
  onBack: () => void;
  onStatusChange?: (status: TaskStatus) => void;
  onTitleChange?: (title: string) => void;
  onKindChange?: (kind: TaskKind) => void;
  onSubtypeChange?: (subtype: AnySubtype | undefined) => void;
  onGoalChange?: (goalId: string | null) => void;
  onCompanionsChange?: (companionIds: string[]) => void;
}

export default function TaskDetailsFullPage({
  task,
  goals,
  companions,
  onBack,
  onStatusChange,
  onTitleChange,
  onKindChange,
  onSubtypeChange,
  onGoalChange,
  onCompanionsChange,
}: TaskDetailsFullPageProps) {
  return (
    <div className="flex flex-col h-full bg-slate-950 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="sticky top-0 z-10 flex items-center gap-4 p-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800 hover:text-slate-100 transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          Back to Weekly View
        </button>
        <h1 className="text-lg font-semibold text-slate-100">Task Details</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 min-h-full">
          <TaskDetailsContent
            task={task}
            goals={goals}
            companions={companions}
            onStatusChange={onStatusChange}
            onTitleChange={onTitleChange}
            onKindChange={onKindChange}
            onSubtypeChange={onSubtypeChange}
            onGoalChange={onGoalChange}
            onCompanionsChange={onCompanionsChange}
          />
        </div>
      </div>
    </div>
  );
}
