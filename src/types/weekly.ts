export type TaskStatus = "open" | "completed" | "cancelled" | "failed";

export type WeeklyItemType = "task" | "event" | "birthday" | "holiday";

export interface Goal {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
  color?: string;
  imageKey?: string;
  createdAt: string; // ISO string
  archived?: boolean;
  dueDate?: string;
}

export type CompanionRelationship =
  | "friend"
  | "coworker"
  | "partner"
  | "family"
  | "acquaintance"
  | "other";

export interface TaskLocation {
  label: string; // what user sees in the field, e.g. "Glory Days Grill, 123 Main St, City"
  mapUrl: string; // derived from lat/lng when available
  lat?: number;
  lng?: number;
  provider: "nominatim";
  nominatim?: {
    placeId?: string;
    osmType?: string;
    osmId?: string;
    raw: unknown; // raw payload for future flexibility
  };
}

export interface Companion {
  id: string;
  name: string;
  relationship: CompanionRelationship;
  description?: string;
  avatarImageKey?: string;
  color?: string; // Hex code or Tailwind class for background
  createdAt: string; // ISO string
}

export interface Task {
  id: string;
  type: WeeklyItemType;
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
  goalIds?: string[];
  companionIds?: string[];
  linksMarkdown?: string;
  location?: TaskLocation;
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
