import { useState } from "react";
import type {
  WeekState,
  TaskStatus,
  TaskKind,
  AnySubtype,
} from "../../types/weekly";
import WeekHeader from "./WeekHeader";
import { RightSidePanel } from "../layout/RightSidePanel";
import PageHeader from "../layout/PageHeader";
import { PanelToggle } from "../layout/PanelToggle";
import DayCard from "./DayCard";
import TaskDetailsModal from "./TaskDetailsModal";
import TaskDetailsFullPage from "./TaskDetailsFullPage";
import TaskDetailsContent from "./TaskDetailsContent";
import { computeWeekStats } from "../../lib/weekly/stats";
import { WeeklyStatsPanel } from "./WeeklyStatsPanel";

// Helper to get date for a specific day index (0-6)
function getDateForDayIndex(weekStart: Date, dayIndex: number): Date {
  const date = new Date(weekStart);
  date.setDate(weekStart.getDate() + dayIndex);
  return date;
}

interface WeeklyViewProps {
  weekState: WeekState;
  actions: {
    addTask: (dayIndex: number, title: string, groupId?: string) => void;
    addGroup: (dayIndex: number) => void;
    updateTaskStatus: (id: string, status: TaskStatus) => void;
    updateTaskTitle: (id: string, title: string) => void;
    updateTaskKind: (id: string, kind: TaskKind) => void;
    updateTaskSubtype: (id: string, subtype: AnySubtype | undefined) => void;
    deleteTask: (id: string) => void;
    updateGroupTitle: (id: string, title: string) => void;
    deleteGroup: (id: string) => void;
    // Linking Actions
    setTaskGoal?: (taskId: string, goalId: string | null) => void;
    setTaskCompanions?: (taskId: string, companionIds: string[]) => void;
  };
}

export default function WeeklyView({ weekState, actions }: WeeklyViewProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Details View State
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [detailsMode, setDetailsMode] = useState<
    "side-panel" | "modal" | "page" | null
  >(null);

  // Derived state
  const selectedTask = selectedTaskId
    ? weekState.tasks.find((t) => t.id === selectedTaskId)
    : undefined;

  // Handler to add a new task (day level)
  const handleAddTask = (dayIndex: number, title: string) => {
    actions.addTask(dayIndex, title);
  };

  // Handler to add a new task to a specific group
  const handleAddTaskToGroup = (
    dayIndex: number,
    groupId: string,
    title: string
  ) => {
    actions.addTask(dayIndex, title, groupId);
  };

  // Details View Handlers
  const handleOpenDetailsSidePanel = (taskId: string) => {
    setSelectedTaskId(taskId);
    setDetailsMode("side-panel");
    setIsPanelOpen(false); // Close generic panel if open
  };

  const handleOpenDetailsModal = (taskId: string) => {
    setSelectedTaskId(taskId);
    setDetailsMode("modal");
  };

  const handleOpenDetailsPage = (taskId: string) => {
    setSelectedTaskId(taskId);
    setDetailsMode("page");
  };

  const handleCloseDetails = () => {
    setDetailsMode(null);
    setSelectedTaskId(null);
  };

  // If in "page" mode, replace the entire view
  if (detailsMode === "page" && selectedTask) {
    return (
      <TaskDetailsFullPage
        task={selectedTask}
        goals={weekState.goals}
        companions={weekState.companions}
        onBack={handleCloseDetails}
        onStatusChange={(s) => actions.updateTaskStatus(selectedTask.id, s)}
        onTitleChange={(t) => actions.updateTaskTitle(selectedTask.id, t)}
        onKindChange={(k) => actions.updateTaskKind(selectedTask.id, k)}
        onSubtypeChange={(st) => actions.updateTaskSubtype(selectedTask.id, st)}
        onGoalChange={(gid) => actions.setTaskGoal?.(selectedTask.id, gid)}
        onCompanionsChange={(cids) =>
          actions.setTaskCompanions?.(selectedTask.id, cids)
        }
      />
    );
  }

  const weekStartDateObj = new Date(weekState.weekStart);

  // Compute stats for the current week
  const weekStats = computeWeekStats(weekState);

  return (
    <div className="relative min-h-screen flex flex-col">
      <PageHeader
        title="Weekly Planner"
        rightContent={
          <PanelToggle
            isOpen={isPanelOpen}
            onClick={() => {
              if (isPanelOpen) {
                setIsPanelOpen(false);
              } else {
                setIsPanelOpen(true);
                // If we open main panel, close details panel
                if (detailsMode === "side-panel") setDetailsMode(null);
              }
            }}
          />
        }
      />

      <div className="flex-1 mx-auto max-w-6xl w-full p-4 md:pr-12">
        <WeekHeader weekStart={weekStartDateObj} />
        <div className="flex flex-col gap-4 mt-4">
          {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
            const dayDate = getDateForDayIndex(weekStartDateObj, dayIndex);

            // Filter data for this day
            const dayTasks = weekState.tasks
              .filter((t) => t.dayIndex === dayIndex)
              .sort((a, b) => a.position - b.position);

            const dayGroups = weekState.groups
              .filter((g) => g.dayIndex === dayIndex)
              .sort((a, b) => a.position - b.position);

            return (
              <DayCard
                key={dayIndex}
                dayIndex={dayIndex}
                date={dayDate}
                tasks={dayTasks}
                groups={dayGroups}
                goals={weekState.goals}
                companions={weekState.companions}
                onAddTask={handleAddTask}
                onAddGroup={actions.addGroup}
                onAddTaskToGroup={handleAddTaskToGroup}
                onUpdateTaskStatus={actions.updateTaskStatus}
                onUpdateTaskTitle={actions.updateTaskTitle}
                onDeleteTask={actions.deleteTask}
                onUpdateGroupTitle={actions.updateGroupTitle}
                onDeleteGroup={actions.deleteGroup}
                // Pass details handlers
                onOpenDetailsSidePanel={handleOpenDetailsSidePanel}
                onOpenDetailsModal={handleOpenDetailsModal}
                onOpenDetailsPage={handleOpenDetailsPage}
              />
            );
          })}
        </div>
      </div>

      {/* Generic Panel (Tools & Notes) */}
      <RightSidePanel
        title="Tools & Notes"
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      >
        <WeeklyStatsPanel stats={weekStats} />
      </RightSidePanel>

      {/* Task Details Side Panel */}
      <RightSidePanel
        title="Task Details"
        isOpen={detailsMode === "side-panel" && !!selectedTask}
        onClose={handleCloseDetails}
      >
        {selectedTask && (
          <TaskDetailsContent
            task={selectedTask}
            goals={weekState.goals}
            companions={weekState.companions}
            onStatusChange={(s) => actions.updateTaskStatus(selectedTask.id, s)}
            onTitleChange={(t) => actions.updateTaskTitle(selectedTask.id, t)}
            onKindChange={(k) => actions.updateTaskKind(selectedTask.id, k)}
            onSubtypeChange={(st) =>
              actions.updateTaskSubtype(selectedTask.id, st)
            }
            onGoalChange={(gid) => actions.setTaskGoal?.(selectedTask.id, gid)}
            onCompanionsChange={(cids) =>
              actions.setTaskCompanions?.(selectedTask.id, cids)
            }
          />
        )}
      </RightSidePanel>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          isOpen={detailsMode === "modal"}
          onClose={handleCloseDetails}
          task={selectedTask}
          goals={weekState.goals}
          companions={weekState.companions}
          onStatusChange={(s) => actions.updateTaskStatus(selectedTask.id, s)}
          onTitleChange={(t) => actions.updateTaskTitle(selectedTask.id, t)}
          onKindChange={(k) => actions.updateTaskKind(selectedTask.id, k)}
          onSubtypeChange={(st) =>
            actions.updateTaskSubtype(selectedTask.id, st)
          }
          onGoalChange={(gid) => actions.setTaskGoal?.(selectedTask.id, gid)}
          onCompanionsChange={(cids) =>
            actions.setTaskCompanions?.(selectedTask.id, cids)
          }
        />
      )}
    </div>
  );
}
