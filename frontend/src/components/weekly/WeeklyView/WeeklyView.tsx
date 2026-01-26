import { useCallback, useEffect, useRef, useState } from "react";
import { useAppSettings } from "../../../context/AppSettingsContext";
import { IconFolders, IconPlus, IconTrash, IconSettings, IconCheck } from "@tabler/icons-react";
import type {
  WeekState,
  TaskStatus,
  TaskLocation,
  WeeklyItemType,
  RecurrenceRule,
  Task,
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
import { DeleteRecurrenceModal } from "../shared/DeleteRecurrenceModal";
import { CreateWeekPickerButton } from "../sidebar/CreateWeekPickerButton";
import { useNotifications } from "../../../context/NotificationsContext";
import { useAnchoredMenu } from "../shared/useAnchoredMenu";
import { useClickOutside } from "../shared/useClickOutside";
import { createPortal } from "react-dom";
import type { DayClipboard, ClipboardTask } from "../../../lib/weekly/dayClipboard";
import { buildDayClipboard, isClipboardEmpty } from "../../../lib/weekly/dayClipboard";

type WeeklyClipboard = 
  | { kind: "day"; data: DayClipboard }
  | { kind: "task"; data: ClipboardTask };

interface WeeklyViewProps {
  weekState: WeekState;
  actions: {
    addTask: (dayIndex: number, title: string, groupId?: string) => void;
    addGroup: (dayIndex: number) => void;
    updateTaskStatus: (id: string, status: TaskStatus) => void;
    updateTaskTitle: (id: string, title: string) => void;
    updateTaskType: (id: string, type: WeeklyItemType) => void;
    updateTaskLinks?: (id: string, linksMarkdown?: string) => void;
    updateTaskNotes?: (id: string, notesMarkdown?: string) => void;
    updateTaskLocation?: (id: string, location?: TaskLocation) => void;
    updateTaskSchedule?: (
      id: string,
      schedule: {
        startDate?: string;
        endDate?: string;
        startTime?: string;
        endTime?: string;
      }
    ) => void;
    deleteTask: (id: string) => void;
    updateGroupTitle: (id: string, title: string) => void;
    deleteGroup: (id: string) => void;
    deleteAllForDay: (dayIndex: number) => void;
    pasteDayFromClipboard: (dayIndex: number, clipboard: DayClipboard) => void;
    clearCurrentWeek: () => void;
    addTaskFromClipboard: (dayIndex: number, clipboard: ClipboardTask) => void;
    // Linking Actions
    setTaskGoals?: (taskId: string, goalIds: string[]) => void;
    setTaskCompanions?: (taskId: string, companionIds: string[]) => void;
    createOrUpdateRecurrenceFromTask?: (
      taskId: string,
      ruleDraft: Omit<
        RecurrenceRule,
        | "id"
        | "title"
        | "type"
        | "goalIds"
        | "companionIds"
        | "linksMarkdown"
        | "location"
        | "groupId"
      >
    ) => void;
    deleteTaskOccurrence?: (taskId: string) => void;
    deleteRecurrenceSeries?: (recurrenceId: string) => void;
    patchTaskLocal: (id: string, patch: Partial<Task>) => void;
    commitTaskPatch: (id: string, patch: any) => Promise<void>;
    moveTask: (taskId: string, targetDayIndex: number, targetPosition: number) => void;
  };
  openTaskId?: string | null;
  onOpenTaskHandled?: () => void;
  availableWeekStartsISO: string[];
  onSelectWeekStart: (iso: string) => void;
  onCreateCurrentWeek?: () => void;
  onCreateWeekForDate?: (dateISO: string) => void;
}

import { markdownToLinksJson } from "../../../lib/weekly/linksConversion";

export default function WeeklyView({
  weekState,
  actions,
  openTaskId,
  onOpenTaskHandled,
  availableWeekStartsISO,
  onSelectWeekStart,
  onCreateCurrentWeek,
  onCreateWeekForDate,
}: WeeklyViewProps) {
  const settings = useAppSettings();
  const [panelMode, setPanelMode] = useState<
    "overview" | "folders" | "taskDetails"
  >("overview");

  // Draft/Dirty state for Task Details
  const [isDirty, setIsDirty] = useState(false);
  const pendingPatchRef = useRef<Record<string, any>>({});
  const lastCommittedTaskIdRef = useRef<string | null>(null);

  // Panel and Modal states
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const isClosingTaskDetailsRef = useRef(false);
  const closeDetailsTimeoutRef = useRef<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const {
    selectedTaskId,
    detailsMode,
    highlightedTaskId,
    openSidePanel,
    openModal,
    openPage,
    closeDetails,
  } = useWeeklyViewDetails({ openTaskId, onOpenTaskHandled });

  const commitPendingTaskEdits = useCallback(async () => {
    if (!isDirty || !selectedTaskId) return;

    const patch = { ...pendingPatchRef.current };
    setIsDirty(false);
    pendingPatchRef.current = {};

    try {
      await actions.commitTaskPatch(selectedTaskId, patch);
    } catch (err) {
      console.error("Failed to commit changes", err);
      // useWeekState already handles refetch on error
    }
  }, [isDirty, selectedTaskId, actions]);

  // Handle task switching - commit before switching
  useEffect(() => {
    if (lastCommittedTaskIdRef.current && lastCommittedTaskIdRef.current !== selectedTaskId) {
      // We switched tasks. If dirty, the previous task's edits should have been committed by the close/switch handler.
      // But as a safety measure, we ensure dirty is reset for the new task.
      if (isDirty) {
        // This case should ideally be handled by the interaction layer (clicking another task)
        // but if it's not, we'd need to know the OLD ID to commit it.
        // For now we rely on the close/switch handlers to call commit.
      }
    }
    if (selectedTaskId) {
      lastCommittedTaskIdRef.current = selectedTaskId;
    }
  }, [selectedTaskId, isDirty]);

  // Commit on unmount (tab change)
  useEffect(() => {
    return () => {
      if (isDirty && selectedTaskId) {
        // We can't use async here reliably in unmount, but we can try
        const patch = { ...pendingPatchRef.current };
        actions.commitTaskPatch(selectedTaskId, patch).catch(console.error);
      }
    };
  }, [isDirty, selectedTaskId, actions]);

  const { confirm, notify } = useNotifications();

  // Week actions menu state
  const weekActionsRef = useRef<HTMLButtonElement>(null);
  const weekMenuRef = useRef<HTMLDivElement>(null);
  const {
    isOpen: isWeekMenuOpen,
    position: weekMenuPosition,
    toggle: toggleWeekMenu,
    close: closeWeekMenu,
  } = useAnchoredMenu({
    resolveAnchor: () => weekActionsRef.current,
    menuWidth: 180,
  });

  useClickOutside<HTMLElement>(
    [weekActionsRef, weekMenuRef],
    closeWeekMenu,
    isWeekMenuOpen
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isWeekMenuOpen) {
        closeWeekMenu();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isWeekMenuOpen, closeWeekMenu]);

  // Day/Task clipboard state
  const [clipboard, setClipboard] = useState<WeeklyClipboard | null>(null);

  // Day clipboard handlers
  const handleCopyDay = (dayIndex: number) => {
    const dayClipboard = buildDayClipboard(
      dayIndex,
      weekState.tasks,
      weekState.groups,
      weekState.weekStart
    );

    if (dayClipboard.tasks.length === 0 && dayClipboard.groups.length === 0) {
      notify({
        title: "Nothing to copy",
        message: "This day has no tasks or groups.",
        tone: "info",
        dismissible: true,
      });
      return;
    }

    setClipboard({ kind: "day", data: dayClipboard });
    const dayDate = getDateForDayIndex(new Date(weekState.weekStart), dayIndex);
    const dateStr = dayDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    notify({
      title: "Day copied",
      message: `Copied ${dayClipboard.tasks.length} task(s) and ${dayClipboard.groups.length} group(s) from ${dateStr}.`,
      tone: "success",
      dismissible: true,
    });
  };

  const handleCopyTask = (taskId: string) => {
    const task = weekState.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const clipboardTask: ClipboardTask = {
      title: task.title,
      type: task.type,
      position: task.position,
      goalIds: task.goalIds,
      companionIds: task.companionIds,
      linksMarkdown: task.linksMarkdown,
      location: task.location,
      notesMarkdown: task.notesMarkdown,
      startDate: task.startDate,
      endDate: task.endDate,
      startTime: task.startTime,
      endTime: task.endTime,
    };

    setClipboard({ kind: "task", data: clipboardTask });

    notify({
      title: "Task copied",
      message: `Copied "${task.title}" to clipboard.`,
      tone: "success",
      dismissible: true,
    });
  };

  const handlePasteDay = (dayIndex: number) => {
    if (!clipboard) {
      return;
    }

    if (clipboard.kind === "day") {
      actions.pasteDayFromClipboard(dayIndex, clipboard.data);
    } else {
      actions.addTaskFromClipboard(dayIndex, clipboard.data);
    }

    const dayDate = getDateForDayIndex(new Date(weekState.weekStart), dayIndex);
    const dateStr = dayDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    notify({
      title: clipboard.kind === "day" ? "Day pasted" : "Task pasted",
      message: 
        clipboard.kind === "day"
          ? `Pasted ${clipboard.data.tasks.length} task(s) and ${clipboard.data.groups.length} group(s) to ${dateStr}.`
          : `Pasted task to ${dateStr}.`,
      tone: "success",
      dismissible: true,
    });
  };

  const handleDeleteAllForDay = async (dayIndex: number) => {
    const dayDate = getDateForDayIndex(new Date(weekState.weekStart), dayIndex);
    const dateStr = dayDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    const dayTasks = weekState.tasks.filter((t) => t.dayIndex === dayIndex);
    const dayGroups = weekState.groups.filter((g) => g.dayIndex === dayIndex);

    if (dayTasks.length === 0 && dayGroups.length === 0) {
      notify({
        title: "Nothing to delete",
        message: "This day is already empty.",
        tone: "info",
        dismissible: true,
      });
      return;
    }

    const confirmed = await confirm({
      title: "Delete all for this day?",
      message: `Are you sure you want to delete all ${dayTasks.length} task(s) and ${dayGroups.length} group(s) for ${dateStr}?`,
      confirmLabel: "Delete all",
      cancelLabel: "Cancel",
      tone: "danger",
    });

    if (confirmed) {
      actions.deleteAllForDay(dayIndex);
      // Close any open details if it was for a task in this day
      if (selectedTask && selectedTask.dayIndex === dayIndex) {
        setIsPanelOpen(false);
        closeDetails();
      }
    }
  };

  const canPaste = !!clipboard;

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
    isClosingTaskDetailsRef.current = false;
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

  const handleCloseDetails = async () => {
    if (settings.taskDetailsSaveMode === "manual") {
      await commitPendingTaskEdits();
    }
    closeDetails();
  };

  const handleManualSave = async () => {
    await commitPendingTaskEdits();
    notify({
      title: "Changes saved",
      tone: "success",
      duration: 2000,
    });
  };

  const handleClearWeek = async () => {
    const startStr = weekState.weekStart;
    const confirmed = await confirm({
      title: "Clear this week?",
      message: `Are you sure you want to clear all tasks and groups for the week of ${startStr}? This will also remove recurring tasks for this week only.`,
      confirmLabel: "Delete all",
      cancelLabel: "No",
      tone: "danger",
    });

    if (confirmed) {
      actions.clearCurrentWeek();
      setIsPanelOpen(false);
      closeDetails();
    }
  };

  const handleDeleteTask = () => {
    if (!selectedTaskId || !selectedTask) return;

    if (selectedTask.recurrenceId) {
      setTaskToDelete(selectedTask);
      setIsDeleteModalOpen(true);
    } else {
      actions.deleteTask(selectedTaskId);
      setIsPanelOpen(false);
      closeDetails();
    }
  };

  const handleConfirmDeleteThis = () => {
    if (!taskToDelete) return;
    actions.deleteTaskOccurrence?.(taskToDelete.id);
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
    if (selectedTaskId === taskToDelete.id) {
      setIsPanelOpen(false);
      closeDetails();
    }
  };

  const handleConfirmDeleteAll = () => {
    if (!taskToDelete || !taskToDelete.recurrenceId) return;
    actions.deleteRecurrenceSeries?.(taskToDelete.recurrenceId);
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
    if (selectedTaskId === taskToDelete.id) {
      setIsPanelOpen(false);
      closeDetails();
    }
  };

  const handleExternalDeleteTask = (id: string) => {
    const task = weekState.tasks.find((t) => t.id === id);
    if (task?.recurrenceId) {
      setTaskToDelete(task);
      setIsDeleteModalOpen(true);
    } else {
      actions.deleteTask(id);
    }
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
    if (isClosingTaskDetailsRef.current) return;

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
    const isManual = settings.taskDetailsSaveMode === "manual";
    const detailsProps = {
      onStatusChange: (s: TaskStatus) => {
        if (isManual) {
          actions.patchTaskLocal(selectedTask.id, { status: s });
          pendingPatchRef.current.status = s;
          setIsDirty(true);
        } else {
          actions.updateTaskStatus(selectedTask.id, s);
        }
      },
      onTitleChange: (t: string) => {
        if (isManual) {
          actions.patchTaskLocal(selectedTask.id, { title: t });
          pendingPatchRef.current.title = t;
          setIsDirty(true);
        } else {
          actions.updateTaskTitle(selectedTask.id, t);
        }
      },
      onTypeChange: (type: WeeklyItemType) => {
        if (isManual) {
          actions.patchTaskLocal(selectedTask.id, { type });
          // Note: DB doesn't have type yet
          setIsDirty(true);
        } else {
          actions.updateTaskType(selectedTask.id, type);
        }
      },
      onGoalsChange: (goalIds: string[]) => {
        if (isManual) {
          actions.patchTaskLocal(selectedTask.id, { goalIds: goalIds.length > 0 ? goalIds : undefined });
          // goalIds handled differently in useWeekState (local storage), 
          // but for unified manual save we'd need backend support if it was there.
          // For now we just mark dirty.
          setIsDirty(true);
        } else {
          actions.setTaskGoals?.(selectedTask.id, goalIds);
        }
      },
      onCompanionsChange: (cids: string[]) => {
        if (isManual) {
          actions.patchTaskLocal(selectedTask.id, { companionIds: cids });
          setIsDirty(true);
        } else {
          actions.setTaskCompanions?.(selectedTask.id, cids);
        }
      },
      onLinksChange: (links?: string) => {
        if (isManual) {
          actions.patchTaskLocal(selectedTask.id, { linksMarkdown: links });
          pendingPatchRef.current.links = markdownToLinksJson(links);
          setIsDirty(true);
        } else {
          actions.updateTaskLinks?.(selectedTask.id, links);
        }
      },
      onNotesChange: (notes?: string) => {
        if (isManual) {
          actions.patchTaskLocal(selectedTask.id, { notesMarkdown: notes });
          pendingPatchRef.current.notes = notes;
          setIsDirty(true);
        } else {
          actions.updateTaskNotes?.(selectedTask.id, notes);
        }
      },
      onLocationChange: (loc?: TaskLocation) => {
        if (isManual) {
          actions.patchTaskLocal(selectedTask.id, { location: loc });
          pendingPatchRef.current.location = loc || null;
          setIsDirty(true);
        } else {
          actions.updateTaskLocation?.(selectedTask.id, loc);
        }
      },
      onScheduleChange: (schedule: {
        startDate?: string;
        endDate?: string;
        startTime?: string;
        endTime?: string;
      }) => {
        if (isManual) {
          actions.patchTaskLocal(selectedTask.id, schedule);
          pendingPatchRef.current.start_date = schedule.startDate;
          pendingPatchRef.current.end_date = schedule.endDate;
          pendingPatchRef.current.start_time = schedule.startTime;
          pendingPatchRef.current.end_time = schedule.endTime;
          setIsDirty(true);
        } else {
          actions.updateTaskSchedule?.(selectedTask.id, schedule);
        }
      },
      onDelete: handleDeleteTask,
      // Manual save props
      isDirty,
      onSave: handleManualSave,
    };

    return (
      <TaskDetailsFullPage
        task={selectedTask}
        goals={weekState.goals}
        companions={weekState.companions}
        recurrences={weekState.recurrences}
        onBack={handleCloseDetails}
        {...detailsProps}
      />
    );
  }

  const weekStartDateObj = new Date(weekState.weekStart);

  // Compute stats for the current week
  const weekStats = computeWeekStats(weekState);
  
  const isManual = settings.taskDetailsSaveMode === "manual";
  const detailsProps = selectedTask
    ? {
        onStatusChange: (s: TaskStatus) => {
          if (isManual) {
            actions.patchTaskLocal(selectedTask.id, { status: s });
            pendingPatchRef.current.status = s;
            setIsDirty(true);
          } else {
            actions.updateTaskStatus(selectedTask.id, s);
          }
        },
        onTitleChange: (t: string) => {
          if (isManual) {
            actions.patchTaskLocal(selectedTask.id, { title: t });
            pendingPatchRef.current.title = t;
            setIsDirty(true);
          } else {
            actions.updateTaskTitle(selectedTask.id, t);
          }
        },
        onTypeChange: (type: WeeklyItemType) => {
          if (isManual) {
            actions.patchTaskLocal(selectedTask.id, { type });
            setIsDirty(true);
          } else {
            actions.updateTaskType(selectedTask.id, type);
          }
        },
        onGoalsChange: (goalIds: string[]) => {
          if (isManual) {
            actions.patchTaskLocal(selectedTask.id, { goalIds: goalIds.length > 0 ? goalIds : undefined });
            setIsDirty(true);
          } else {
            actions.setTaskGoals?.(selectedTask.id, goalIds);
          }
        },
        onCompanionsChange: (cids: string[]) => {
          if (isManual) {
            actions.patchTaskLocal(selectedTask.id, { companionIds: cids });
            setIsDirty(true);
          } else {
            actions.setTaskCompanions?.(selectedTask.id, cids);
          }
        },
        onLinksChange: (links?: string) => {
          if (isManual) {
            actions.patchTaskLocal(selectedTask.id, { linksMarkdown: links });
            pendingPatchRef.current.links = markdownToLinksJson(links);
            setIsDirty(true);
          } else {
            actions.updateTaskLinks?.(selectedTask.id, links);
          }
        },
        onNotesChange: (notes?: string) => {
          if (isManual) {
            actions.patchTaskLocal(selectedTask.id, { notesMarkdown: notes });
            pendingPatchRef.current.notes = notes;
            setIsDirty(true);
          } else {
            actions.updateTaskNotes?.(selectedTask.id, notes);
          }
        },
        onLocationChange: (loc?: TaskLocation) => {
          if (isManual) {
            actions.patchTaskLocal(selectedTask.id, { location: loc });
            pendingPatchRef.current.location = loc || null;
            setIsDirty(true);
          } else {
            actions.updateTaskLocation?.(selectedTask.id, loc);
          }
        },
        onScheduleChange: (schedule: {
          startDate?: string;
          endDate?: string;
          startTime?: string;
          endTime?: string;
        }) => {
          if (isManual) {
            actions.patchTaskLocal(selectedTask.id, schedule);
            pendingPatchRef.current.start_date = schedule.startDate;
            pendingPatchRef.current.end_date = schedule.endDate;
            pendingPatchRef.current.start_time = schedule.startTime;
            pendingPatchRef.current.end_time = schedule.endTime;
            setIsDirty(true);
          } else {
            actions.updateTaskSchedule?.(selectedTask.id, schedule);
          }
        },
        onRecurrenceChange: (
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
        ) => {
          if (rule === null) {
            // Actions to clear recurrence could be added here
          } else {
            actions.createOrUpdateRecurrenceFromTask?.(selectedTask.id, rule);
          }
        },
        onDelete: handleDeleteTask,
        // Manual save props
        isDirty,
        onSave: handleManualSave,
      }
    : undefined;

  return (
    <div className="relative min-h-screen flex flex-col">
      <PageHeader
        title="Weekly Planner"
        subtitle={<WeekHeader weekStart={weekStartDateObj} />}
        rightContent={
          <div className="flex items-center gap-2">
            <button
              ref={weekActionsRef}
              onClick={toggleWeekMenu}
              className={`p-2 rounded-md transition-colors ${
                isWeekMenuOpen
                  ? "bg-slate-800 text-slate-100"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
              title="Week actions"
              aria-label="Week actions"
              aria-haspopup="menu"
              aria-expanded={isWeekMenuOpen}
            >
              <IconSettings className="w-5 h-5" />
            </button>
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
                onDeleteTask={handleExternalDeleteTask}
                onCopyTask={handleCopyTask}
                onUpdateGroupTitle={actions.updateGroupTitle}
                onDeleteGroup={actions.deleteGroup}
                // Pass details handlers
                onOpenDetailsSidePanel={handleOpenDetailsSidePanel}
                onOpenDetailsModal={handleOpenDetailsModal}
                onOpenDetailsPage={handleOpenDetailsPage}
                // Day clipboard handlers
                onCopyDay={handleCopyDay}
                onPasteDay={handlePasteDay}
                canPaste={canPaste}
                onDeleteAllForDay={handleDeleteAllForDay}
                onMoveTask={actions.moveTask}
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
        headerActions={
          panelMode === "folders" ? (
            <div className="flex items-center gap-1">
              <CreateWeekPickerButton
                onCreateWeek={(dateISO) => onCreateWeekForDate?.(dateISO)}
              />
              <button
                onClick={onCreateCurrentWeek}
                className="p-1 text-slate-400 hover:text-slate-100 transition-colors rounded hover:bg-slate-800"
                title="Create/Select current week"
                aria-label="Create or select current week"
              >
                <IconPlus className="w-5 h-5" />
              </button>
            </div>
          ) : panelMode === "taskDetails" ? (
            <button
              type="button"
              onClick={
                settings.taskDetailsSaveMode === "manual" && isDirty
                  ? handleManualSave
                  : undefined
              }
              disabled={settings.taskDetailsSaveMode !== "manual" || !isDirty}
              className={`p-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
                settings.taskDetailsSaveMode === "manual" && isDirty
                  ? "text-indigo-400 hover:text-indigo-300 hover:bg-slate-800"
                  : "text-slate-500 opacity-40 cursor-default"
              }`}
              title={
                settings.taskDetailsSaveMode === "manual"
                  ? isDirty
                    ? "Save changes"
                    : "No pending changes"
                  : "Autosave enabled"
              }
              aria-label="Save changes"
            >
              <IconCheck size={16} />
            </button>
          ) : null
        }
        isOpen={isPanelOpen}
        onClose={async () => {
          if (panelMode === "taskDetails") {
            isClosingTaskDetailsRef.current = true;
            if (settings.taskDetailsSaveMode === "manual") {
              await commitPendingTaskEdits();
            }
          }
          setIsPanelOpen(false);

          if (panelMode === "taskDetails") {
            // Keep the title/content during the slide-out animation, then clear selection.
            if (closeDetailsTimeoutRef.current) {
              window.clearTimeout(closeDetailsTimeoutRef.current);
            }
            closeDetailsTimeoutRef.current = window.setTimeout(() => {
              closeDetails();
              isClosingTaskDetailsRef.current = false;
              closeDetailsTimeoutRef.current = null;
            }, 500);
          }
        }}
        persistWidthKey="rightPanelWidth:weekly"
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
            recurrences={weekState.recurrences}
            {...detailsProps}
          />
        )}
      </RightSidePanel>

      {/* Task Details Modal */}
      {detailsMode === "modal" && selectedTask && detailsProps && (
        <TaskDetailsModal
          isOpen={true}
          onClose={handleCloseDetails}
          task={selectedTask}
          goals={weekState.goals}
          companions={weekState.companions}
          {...detailsProps}
        />
      )}

      <DeleteRecurrenceModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDeleteThis={handleConfirmDeleteThis}
        onDeleteAll={handleConfirmDeleteAll}
      />

      {/* Week Actions Menu */}
      {isWeekMenuOpen &&
        weekMenuPosition &&
        createPortal(
          <div
            ref={weekMenuRef}
            className="fixed z-[60] bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 min-w-[180px] overflow-hidden"
            style={{
              top: weekMenuPosition.top,
              left: weekMenuPosition.left,
            }}
            role="menu"
          >
            <button
              onClick={() => {
                closeWeekMenu();
                handleClearWeek();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left"
              role="menuitem"
            >
              <IconTrash className="w-4 h-4" />
              <span>Clear current week</span>
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
