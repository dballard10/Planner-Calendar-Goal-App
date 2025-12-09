import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task, TaskStatus, Group } from "../../types/weekly";
import DayCardHeader from "./DayCardHeader";
import TaskCard from "./TaskCard";
import AddButton from "./AddButton";
import DayCardSettings from "./DayCardSettings";
import GroupCard from "./GroupCard";

interface DayCardProps {
  dayIndex: number;
  date: Date;
  tasks: Task[];
  groups?: Group[];
  onUpdateTaskStatus: (id: string, status: TaskStatus) => void;
  onUpdateTaskTitle: (id: string, title: string) => void;
  onAddTask: (dayIndex: number, title: string) => void;
  onAddGroup: (dayIndex: number) => void;
  onAddTaskToGroup: (dayIndex: number, groupId: string, title: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateGroupTitle: (groupId: string, title: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onOpenDetailsSidePanel?: (taskId: string) => void;
  onOpenDetailsModal?: (taskId: string) => void;
  onOpenDetailsPage?: (taskId: string) => void;
}

export default function DayCard({
  dayIndex,
  date,
  tasks,
  groups = [],
  onUpdateTaskStatus,
  onUpdateTaskTitle,
  onAddTask,
  onAddGroup,
  onAddTaskToGroup,
  onDeleteTask,
  onUpdateGroupTitle,
  onDeleteGroup,
  onOpenDetailsSidePanel,
  onOpenDetailsModal,
  onOpenDetailsPage,
}: DayCardProps) {
  // Collapse if no root tasks AND no groups
  const isEmpty = tasks.length === 0 && groups.length === 0;
  const [isCollapsed, setIsCollapsed] = useState(isEmpty);

  // Automatically expand when content is added
  useEffect(() => {
    if (!isEmpty) {
      setIsCollapsed(false);
    }
  }, [isEmpty]);

  // Separate root tasks from group tasks (if caller hasn't already filtered)
  // Assuming 'tasks' prop passed here might contain all tasks for the day
  // But WeeklyView filters by dayIndex. We need to filter by groupId here.
  const rootTasks = tasks.filter((t) => !t.groupId);

  // For each group, we find its tasks
  // Note: WeeklyView passes `tasks` filtered by dayIndex.

  return (
    <div className="flex flex-col bg-slate-1000 rounded-lg border border-slate-700 max-w-5xl transition-all duration-300 ease-in-out">
      <div
        className={`grid grid-cols-3 items-center gap-2 p-2 bg-slate-800 border-slate-700 z-10 relative ${
          isCollapsed ? "rounded-lg" : "rounded-t-lg border-b"
        }`}
      >
        <div className="flex justify-start">
          <DayCardSettings />
        </div>
        <div className="flex justify-center">
          <DayCardHeader
            dayIndex={dayIndex}
            date={date}
            onClick={() => setIsCollapsed(!isCollapsed)}
            isCollapsed={isCollapsed}
          />
        </div>
        <div className="flex justify-end">
          <AddButton
            onAddTaskClick={() => onAddTask(dayIndex, "New task...")}
            onAddGroupClick={() => onAddGroup(dayIndex)}
          />
        </div>
      </div>
      <motion.div
        className={`space-y-2 overflow-y-auto transition-all duration-300 ease-in-out ${
          isCollapsed
            ? "max-h-0 opacity-0 p-0 overflow-hidden"
            : "max-h-[600px] opacity-100 p-2"
        }`}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {/* Render Groups First (or interleaved based on position if supported later) */}
          {groups.map((group) => {
            const groupTasks = tasks
              .filter((t) => t.groupId === group.id)
              .sort((a, b) => a.position - b.position);
            return (
              <motion.div
                key={group.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <GroupCard
                  group={group}
                  tasks={groupTasks}
                  onAddTask={(gid, title) =>
                    onAddTaskToGroup(dayIndex, gid, title)
                  }
                  onUpdateTitle={onUpdateGroupTitle}
                  onDeleteGroup={onDeleteGroup}
                  onUpdateTaskStatus={onUpdateTaskStatus}
                  onUpdateTaskTitle={onUpdateTaskTitle}
                  onDeleteTask={onDeleteTask}
                  onOpenDetailsSidePanel={onOpenDetailsSidePanel}
                  onOpenDetailsModal={onOpenDetailsModal}
                  onOpenDetailsPage={onOpenDetailsPage}
                />
              </motion.div>
            );
          })}

          {/* Render Root Tasks */}
          {rootTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TaskCard
                task={task}
                onStatusChange={onUpdateTaskStatus}
                onTitleChange={onUpdateTaskTitle}
                onDelete={onDeleteTask}
                onOpenDetailsSidePanel={onOpenDetailsSidePanel}
                onOpenDetailsModal={onOpenDetailsModal}
                onOpenDetailsPage={onOpenDetailsPage}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
