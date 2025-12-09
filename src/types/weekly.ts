export type TaskStatus =
  | "open"
  | "completed"
  | "moved"
  | "cancelled"
  | "failed";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  dayIndex: number; // 0 = Sunday ... 6 = Saturday
  position: number; // order within the day (or within the group)
  createdAt: string; // ISO string
  groupId?: string | null; // Optional: if null/undefined, it's a root-level task
  movedTo?: {
    weekOffset: number; // 0 now, later can be +/- weeks
    dayIndex: number; // 0-6
  };
}

export interface Group {
  id: string;
  title: string;
  dayIndex: number; // 0 = Sunday ... 6 = Saturday
  position: number; // order within the day relative to other groups/tasks
  createdAt: string; // ISO string
}

export interface WeekState {
  weekStart: string; // ISO date string representing Sunday
  tasks: Task[];
  groups: Group[];
}
