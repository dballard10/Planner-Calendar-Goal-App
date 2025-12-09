import { useState } from "react";
import type { WeekState, Task, TaskStatus, Group } from "../../types/weekly";
import WeekHeader from "./WeekHeader";
import { RightSidePanel } from "../layout/RightSidePanel";
import PageHeader from "../layout/PageHeader";
import { PanelToggle } from "../layout/PanelToggle";
import DayCard from "./DayCard";
import TaskDetailsModal from "./TaskDetailsModal";
import TaskDetailsFullPage from "./TaskDetailsFullPage";
import TaskDetailsContent from "./TaskDetailsContent";

// Helper to get the most recent Sunday
function getMostRecentSunday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - daysToSubtract);
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

// Helper to format date as ISO string (YYYY-MM-DD)
function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Helper to get date for a specific day index (0-6)
function getDateForDayIndex(weekStart: Date, dayIndex: number): Date {
  const date = new Date(weekStart);
  date.setDate(weekStart.getDate() + dayIndex);
  return date;
}

// Mock tasks for initial state
function createMockData(weekStart: string): { tasks: Task[]; groups: Group[] } {
  const baseDate = new Date(weekStart);
  return {
    tasks: [
      {
        id: "1",
        title: "Gym workout",
        status: "open",
        dayIndex: 1, // Monday
        position: 0,
        createdAt: new Date(
          baseDate.getTime() + 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: "2",
        title: "Guitar practice",
        status: "open",
        dayIndex: 2, // Tuesday
        position: 0,
        createdAt: new Date(
          baseDate.getTime() + 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ],
    groups: [],
  };
}

export default function WeeklyView() {
  const weekStartDate = getMostRecentSunday();
  const weekStartISO = formatDateISO(weekStartDate);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Details View State
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [detailsMode, setDetailsMode] = useState<
    "side-panel" | "modal" | "page" | null
  >(null);

  const [weekState, setWeekState] = useState<WeekState>({
    weekStart: weekStartISO,
    ...createMockData(weekStartISO),
  });

  // Derived state
  const selectedTask = selectedTaskId
    ? weekState.tasks.find((t) => t.id === selectedTaskId)
    : undefined;

  // Helper to create a task ID (UUID-like)
  const generateId = () => crypto.randomUUID();

  // Unified task creation logic
  const addTask = (dayIndex: number, title: string, groupId?: string) => {
    // Find max position in the target context (day or group)
    const contextTasks = weekState.tasks.filter(
      (t) => t.dayIndex === dayIndex && t.groupId === (groupId || undefined)
    );
    const maxPosition =
      contextTasks.length > 0
        ? Math.max(...contextTasks.map((t) => t.position))
        : -1;

    const newTask: Task = {
      id: generateId(),
      title: title || "New task...",
      status: "open",
      dayIndex,
      position: maxPosition + 1,
      createdAt: new Date().toISOString(),
      groupId: groupId || undefined,
    };

    setWeekState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
  };

  // Handler to add a new task (day level)
  const handleAddTask = (dayIndex: number, title: string) => {
    addTask(dayIndex, title);
  };

  // Handler to add a new task to a specific group
  const handleAddTaskToGroup = (
    dayIndex: number,
    groupId: string,
    title: string
  ) => {
    addTask(dayIndex, title, groupId);
  };

  // Handler to add a new group
  const handleAddGroup = (dayIndex: number) => {
    // Find position: after all existing groups and root tasks?
    // Or just append to list of groups?
    // Let's say we append to the end of the day's "items".
    // For simplicity, we track group positions separately or mixed.
    // Let's just append to the groups list for that day.
    const dayGroups = weekState.groups.filter((g) => g.dayIndex === dayIndex);
    const maxGroupPos =
      dayGroups.length > 0 ? Math.max(...dayGroups.map((g) => g.position)) : -1;

    const newGroup: Group = {
      id: generateId(),
      title: "New Group",
      dayIndex,
      position: maxGroupPos + 1,
      createdAt: new Date().toISOString(),
    };

    setWeekState((prev) => ({
      ...prev,
      groups: [...prev.groups, newGroup],
    }));
  };

  // Handler to update task status
  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setWeekState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, status } : task
      ),
    }));
  };

  // Handler to update task title
  const updateTaskTitle = (id: string, title: string) => {
    setWeekState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, title } : task
      ),
    }));
  };

  // Handler to delete a task
  const deleteTask = (id: string) => {
    setWeekState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id),
    }));
  };

  // Handler to update group title
  const updateGroupTitle = (id: string, title: string) => {
    setWeekState((prev) => ({
      ...prev,
      groups: prev.groups.map((group) =>
        group.id === id ? { ...group, title } : group
      ),
    }));
  };

  // Handler to delete a group (and its tasks?)
  const deleteGroup = (id: string) => {
    setWeekState((prev) => ({
      ...prev,
      groups: prev.groups.filter((group) => group.id !== id),
      // Optional: also delete tasks in that group? Or move them to root?
      // For now, let's delete them to avoid orphaned tasks.
      tasks: prev.tasks.filter((task) => task.groupId !== id),
    }));
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
        onBack={handleCloseDetails}
        onStatusChange={(s) => updateTaskStatus(selectedTask.id, s)}
        onTitleChange={(t) => updateTaskTitle(selectedTask.id, t)}
      />
    );
  }

  const weekStartDateObj = new Date(weekState.weekStart);

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
                onAddTask={handleAddTask}
                onAddGroup={handleAddGroup}
                onAddTaskToGroup={handleAddTaskToGroup}
                onUpdateTaskStatus={updateTaskStatus}
                onUpdateTaskTitle={updateTaskTitle}
                onDeleteTask={deleteTask}
                onUpdateGroupTitle={updateGroupTitle}
                onDeleteGroup={deleteGroup}
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
        <div className="text-slate-300">
          <p className="mb-4">This is the side panel for extra content.</p>
          <ul className="list-disc pl-4 space-y-2">
            <li>Notes</li>
            <li>Goals</li>
            <li>Settings</li>
          </ul>
        </div>
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
            onStatusChange={(s) => updateTaskStatus(selectedTask.id, s)}
            onTitleChange={(t) => updateTaskTitle(selectedTask.id, t)}
          />
        )}
      </RightSidePanel>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          isOpen={detailsMode === "modal"}
          onClose={handleCloseDetails}
          task={selectedTask}
          onStatusChange={(s) => updateTaskStatus(selectedTask.id, s)}
          onTitleChange={(t) => updateTaskTitle(selectedTask.id, t)}
        />
      )}
    </div>
  );
}
