import { useEffect, useRef, useState } from "react";
import { IconFolders } from "@tabler/icons-react";
import type {
  WeekState,
  TaskStatus,
  WeeklyItemType,
} from "../../../types/weekly";
import WeekHeader from "../WeekHeader";
import { RightSidePanel } from "../../layout/RightSidePanel";
import PageHeader from "../../layout/PageHeader";
import { PanelToggle } from "../../layout/PanelToggle";
import DayCard from "../day/DayCard";
import TaskDetailsModal from "../details/TaskDetailsModal";
import TaskDetailsFullPage from "../details/TaskDetailsFullPage";
import TaskDetailsContent from "../details/TaskDetailsContent";
import { computeWeekStats } from "../../../lib/weekly/stats";
import { WeeklyStatsPanel } from "../WeeklyStatsPanel";
import { getDateForDayIndex } from "../utils/date";
import { getGroupsForDay, getTasksForDay } from "./selectors";
import { useWeeklyViewDetails } from "./useWeeklyViewDetails";
import { WeeklyFolderTree } from "../sidebar/WeeklyFolderTree";

interface WeeklyViewProps {
  weekState: WeekState;
  actions: {
    addTask: (dayIndex: number, title: string, groupId?: string) => void;
    addGroup: (dayIndex: number) => void;
    updateTaskStatus: (id: string, status: TaskStatus) => void;
    updateTaskTitle: (id: string, title: string) => void;
    updateTaskType: (id: string, type: WeeklyItemType) => void;
    updateTaskLinks?: (id: string, linksMarkdown?: string) => void;
    deleteTask: (id: string) => void;
    updateGroupTitle: (id: string, title: string) => void;
    deleteGroup: (id: string) => void;
    // Linking Actions
    setTaskGoals?: (taskId: string, goalIds: string[]) => void;
    setTaskCompanions?: (taskId: string, companionIds: string[]) => void;
  };
  openTaskId?: string | null;
  onOpenTaskHandled?: () => void;
  availableWeekStartsISO: string[];
  onSelectWeekStart: (iso: string) => void;
}

export default function WeeklyView({
  weekState,
  actions,
  openTaskId,
  onOpenTaskHandled,
  availableWeekStartsISO,
  onSelectWeekStart,
}: WeeklyViewProps) {
  const [panelMode, setPanelMode] = useState<
    "overview" | "folders" | "taskDetails"
  >("overview");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const closeDetailsTimeoutRef = useRef<number | null>(null);
  const {
    selectedTaskId,
    detailsMode,
    highlightedTaskId,
    openSidePanel,
    openModal,
    openPage,
    closeDetails,
    setHighlightedTaskId,
  } = useWeeklyViewDetails({ openTaskId, onOpenTaskHandled });

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

  const handleOpenDetailsSidePanel = (taskId: string) => {
    setPanelMode("taskDetails");
    setIsPanelOpen(true);
    openSidePanel(taskId);
  };

  const handleOpenDetailsModal = (taskId: string) => {
    setIsPanelOpen(false);
    openModal(taskId);
  };

  const handleOpenDetailsPage = (taskId: string) => {
    setIsPanelOpen(false);
    openPage(taskId);
  };

  const handleCloseDetails = () => {
    closeDetails();
  };

  const toggleOverviewPanel = () => {
    if (isPanelOpen && panelMode === "overview") {
      setIsPanelOpen(false);
      return;
    }
    if (detailsMode === "side-panel") {
      closeDetails();
    }
    setPanelMode("overview");
    setIsPanelOpen(true);
  };

  const toggleFoldersPanel = () => {
    if (isPanelOpen && panelMode === "folders") {
      setIsPanelOpen(false);
      return;
    }
    if (detailsMode === "side-panel") {
      closeDetails();
    }
    setPanelMode("folders");
    setIsPanelOpen(true);
  };

  useEffect(() => {
    if (detailsMode === "side-panel" && selectedTask) {
      setPanelMode("taskDetails");
      setIsPanelOpen(true);
      return;
    }
    if (detailsMode === null && panelMode === "taskDetails" && isPanelOpen) {
      setIsPanelOpen(false);
    }
  }, [detailsMode, selectedTask, panelMode, isPanelOpen]);

  useEffect(() => {
    return () => {
      if (closeDetailsTimeoutRef.current) {
        window.clearTimeout(closeDetailsTimeoutRef.current);
        closeDetailsTimeoutRef.current = null;
      }
    };
  }, []);

  // If in "page" mode, replace the entire view
  if (detailsMode === "page" && selectedTask) {
    const detailsProps = {
      onStatusChange: (s: TaskStatus) =>
        actions.updateTaskStatus(selectedTask.id, s),
      onTitleChange: (t: string) => actions.updateTaskTitle(selectedTask.id, t),
      onTypeChange: (type: WeeklyItemType) =>
        actions.updateTaskType(selectedTask.id, type),
      onGoalsChange: (goalIds: string[]) =>
        actions.setTaskGoals?.(selectedTask.id, goalIds),
      onCompanionsChange: (cids: string[]) =>
        actions.setTaskCompanions?.(selectedTask.id, cids),
      onLinksChange: (links?: string) =>
        actions.updateTaskLinks?.(selectedTask.id, links),
    };

    return (
      <TaskDetailsFullPage
        task={selectedTask}
        goals={weekState.goals}
        companions={weekState.companions}
        onBack={closeDetails}
        {...detailsProps}
      />
    );
  }

  const weekStartDateObj = new Date(weekState.weekStart);

  // Compute stats for the current week
  const weekStats = computeWeekStats(weekState);
  const detailsProps =
    selectedTask && {
      onStatusChange: (s: TaskStatus) =>
        actions.updateTaskStatus(selectedTask.id, s),
      onTitleChange: (t: string) => actions.updateTaskTitle(selectedTask.id, t),
      onTypeChange: (type: WeeklyItemType) =>
        actions.updateTaskType(selectedTask.id, type),
      onGoalsChange: (goalIds: string[]) =>
        actions.setTaskGoals?.(selectedTask.id, goalIds),
      onCompanionsChange: (cids: string[]) =>
        actions.setTaskCompanions?.(selectedTask.id, cids),
      onLinksChange: (links?: string) =>
        actions.updateTaskLinks?.(selectedTask.id, links),
    };

  return (
    <div className="relative min-h-screen flex flex-col">
      <PageHeader
        title="Weekly Planner"
        subtitle={<WeekHeader weekStart={weekStartDateObj} />}
        rightContent={
          <div className="flex items-center gap-2">
            <PanelToggle
              isOpen={isPanelOpen && panelMode === "folders"}
              onClick={toggleFoldersPanel}
              label="Weeks panel"
              icon={IconFolders}
            />
            <PanelToggle
              isOpen={isPanelOpen && panelMode === "overview"}
              onClick={toggleOverviewPanel}
            />
          </div>
        }
      />

      <div className="flex-1 mx-auto max-w-6xl w-full p-4 md:p-6">
        <div className="flex flex-col gap-4 mt-2">
          {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
            const dayDate = getDateForDayIndex(weekStartDateObj, dayIndex);

            // Filter data for this day
            const dayTasks = getTasksForDay(weekState.tasks, dayIndex);
            const dayGroups = getGroupsForDay(weekState.groups, dayIndex);

            return (
              <DayCard
                key={dayIndex}
                dayIndex={dayIndex}
                date={dayDate}
                tasks={dayTasks}
                groups={dayGroups}
                goals={weekState.goals}
                companions={weekState.companions}
                highlightTaskId={highlightedTaskId}
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

      <RightSidePanel
        title={
          panelMode === "overview"
            ? "Overview"
            : panelMode === "folders"
            ? "Weeks"
            : panelMode === "taskDetails"
            ? "Task Details"
            : "Panel"
        }
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);

          if (panelMode === "taskDetails") {
            // Keep the title/content during the slide-out animation, then clear selection.
            if (closeDetailsTimeoutRef.current) {
              window.clearTimeout(closeDetailsTimeoutRef.current);
            }
            closeDetailsTimeoutRef.current = window.setTimeout(() => {
              closeDetails();
              closeDetailsTimeoutRef.current = null;
            }, 500);
          }
        }}
      >
        {panelMode === "overview" && <WeeklyStatsPanel stats={weekStats} />}
        {panelMode === "folders" && (
          <WeeklyFolderTree
            selectedWeekStartISO={weekState.weekStart}
            availableWeekStartsISO={availableWeekStartsISO}
            onSelectWeekStart={(iso) => {
              onSelectWeekStart(iso);
              setPanelMode("folders");
              setIsPanelOpen(true);
            }}
          />
        )}
        {panelMode === "taskDetails" && selectedTask && detailsProps && (
          <TaskDetailsContent
            task={selectedTask}
            goals={weekState.goals}
            companions={weekState.companions}
            {...detailsProps}
          />
        )}
      </RightSidePanel>

      {/* Task Details Modal */}
      {selectedTask && detailsProps && (
        <TaskDetailsModal
          isOpen={detailsMode === "modal"}
          onClose={handleCloseDetails}
          task={selectedTask}
          goals={weekState.goals}
          companions={weekState.companions}
          {...detailsProps}
        />
      )}
    </div>
  );
}
