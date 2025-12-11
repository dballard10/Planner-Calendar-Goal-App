export type TaskStatus = "open" | "completed" | "cancelled" | "failed";

export type TaskKind = "task" | "event";

export type EventSubtype =
  | "birthday"
  | "holiday"
  | "meeting"
  | "appointment"
  | "travel"
  | "social"
  | "class"
  | "focus-block"
  | "reminder"
  | "work";

export type TaskSubtype =
  | "work"
  | "personal"
  | "chore"
  | "errand"
  | "health"
  | "finance"
  | "learning"
  | "creative"
  | "daily";

export type AnySubtype = EventSubtype | TaskSubtype;

export interface Goal {
  id: string;
  name: string;
  emoji?: string;
  imageKey?: string;
  createdAt: string; // ISO string
  archived?: boolean;
}

export type CompanionRelationship =
  | "friend"
  | "coworker"
  | "partner"
  | "family"
  | "acquaintance"
  | "other";

export interface Companion {
  id: string;
  name: string;
  relationship: CompanionRelationship;
  description?: string;
  avatarEmoji?: string;
  avatarImageKey?: string;
  color?: string; // Hex code or Tailwind class for background
  createdAt: string; // ISO string
}

export interface Task {
  id: string;
  kind: TaskKind;
  subtype?: AnySubtype;
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
  // New fields
  goalId?: string | null;
  companionIds?: string[];
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
  goals: Goal[];
  companions: Companion[];
}
