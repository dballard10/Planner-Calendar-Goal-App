import { useState } from "react";
import type {
  WeekState,
  Task,
  TaskStatus,
  Group,
  TaskKind,
  AnySubtype,
  Goal,
  Companion,
} from "../types/weekly";

// Helper to get the most recent Sunday
export function getMostRecentSunday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - daysToSubtract);
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

// Helper to format date as ISO string (YYYY-MM-DD)
export function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Mock tasks for initial state
function createMockData(weekStart: string): {
  tasks: Task[];
  groups: Group[];
  goals: Goal[];
  companions: Companion[];
} {
  const baseDate = new Date(weekStart);
  const tasks: Task[] = [];
  const goals: Goal[] = [];
  const companions: Companion[] = [];

  // Helper to add task
  const add = (
    dayIndex: number,
    title: string,
    kind: TaskKind,
    subtype: AnySubtype,
    status: TaskStatus = "open",
    goalId?: string,
    companionIds?: string[]
  ) => {
    // Basic position logic: append to end of day
    const existing = tasks.filter((t) => t.dayIndex === dayIndex).length;

    tasks.push({
      id: Math.random().toString(36).substring(2, 9),
      kind,
      subtype,
      title,
      status,
      dayIndex,
      position: existing,
      createdAt: new Date(
        baseDate.getTime() + dayIndex * 24 * 60 * 60 * 1000
      ).toISOString(),
      goalId,
      companionIds,
    });
  };

  // Create Mock Goals
  const goalGuitar = {
    id: "goal-guitar",
    name: "Guitar",
    emoji: "🎸",
    createdAt: new Date().toISOString(),
  };
  const goalWorkout = {
    id: "goal-workout",
    name: "Working Out",
    emoji: "🏋️",
    createdAt: new Date().toISOString(),
  };
  const goalCareer = {
    id: "goal-career",
    name: "Career",
    emoji: "💼",
    createdAt: new Date().toISOString(),
  };
  goals.push(goalGuitar, goalWorkout, goalCareer);

  // Create Mock Companions
  const compSarah = {
    id: "comp-sarah",
    name: "Sarah",
    relationship: "friend" as const,
    avatarEmoji: "👩",
    color: "#fb7185", // rose-400
    createdAt: new Date().toISOString(),
  };
  const compMike = {
    id: "comp-mike",
    name: "Mike",
    relationship: "coworker" as const,
    avatarEmoji: "👨",
    color: "#60a5fa", // blue-400
    createdAt: new Date().toISOString(),
  };
  companions.push(compSarah, compMike);

  // Sunday (0)
  add(0, "Weekly planning review", "task", "work", "open", goalCareer.id);
  add(0, "Grocery run", "task", "personal", "completed");
  add(0, "Family Call", "event", "social");
  add(0, "Meal prep for week", "task", "health", "open", goalWorkout.id);
  add(0, "Relaxation time", "task", "personal");

  // Monday (1)
  add(1, "Team Standup", "event", "meeting", "open", goalCareer.id, [
    compMike.id,
  ]);
  add(1, "Email triage", "task", "work", "open", goalCareer.id);
  add(1, "Deep work session", "event", "work", "open", goalCareer.id);
  add(1, "Lunch with Sarah", "event", "social", "open", undefined, [
    compSarah.id,
  ]);
  add(1, "Gym workout", "task", "health", "open", goalWorkout.id);

  // Tuesday (2)
  add(2, "Doctor Appointment", "task", "health");
  add(2, "Finish project proposal", "task", "work", "open", goalCareer.id);
  add(2, "Journaling", "task", "daily");
  add(2, "Focus Block", "event", "work", "open", goalCareer.id);
  add(2, "Read 30 mins", "task", "personal");

  // Wednesday (3)
  add(3, "Submit expenses", "task", "work", "open", goalCareer.id);
  add(3, "Client Call", "event", "meeting", "open", goalCareer.id);
  add(3, "Clean apartment", "task", "daily");
  add(3, "Code review", "task", "work", "open", goalCareer.id, [compMike.id]);
  add(3, "Evening run", "task", "health", "open", goalWorkout.id);

  // Thursday (4)
  add(4, "Make bed", "task", "daily");
  add(4, "Write blog post", "task", "personal");
  add(4, "Team sync", "event", "meeting", "open", goalCareer.id, [compMike.id]);
  add(4, "Dinner w/ Friends", "event", "social", "open", undefined, [
    compSarah.id,
  ]);
  add(4, "Pay bills", "task", "personal");

  // Friday (5)
  add(5, "Wrap up weekly report", "task", "work", "open", goalCareer.id);
  add(5, "Project demo", "event", "meeting", "open", goalCareer.id, [
    compMike.id,
  ]);
  add(5, "Plan weekend", "task", "personal");
  add(5, "Happy Hour", "event", "social", "open", undefined, [
    compSarah.id,
    compMike.id,
  ]);
  add(5, "Meditate", "task", "health");

  // Saturday (6)
  add(6, "Laundry", "task", "daily");
  add(6, "Brunch", "event", "social", "open", undefined, [compSarah.id]);
  add(6, "Long hike", "task", "health", "open", goalWorkout.id);
  add(6, "Painting", "task", "personal");
  add(6, "Movie night", "event", "social");

  return {
    tasks,
    groups: [],
    goals,
    companions,
  };
}

export function useWeekState() {
  const weekStartDate = getMostRecentSunday();
  const weekStartISO = formatDateISO(weekStartDate);

  const [weekState, setWeekState] = useState<WeekState>({
    weekStart: weekStartISO,
    ...createMockData(weekStartISO),
  });

  // Helper to create a task ID (UUID-like)
  const generateId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15);
  };

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
      kind: "task",
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

  const addGroup = (dayIndex: number) => {
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

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setWeekState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, status } : task
      ),
    }));
  };

  const updateTaskTitle = (id: string, title: string) => {
    setWeekState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, title } : task
      ),
    }));
  };

  const updateTaskKind = (id: string, kind: TaskKind) => {
    setWeekState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, kind } : task
      ),
    }));
  };

  const updateTaskSubtype = (id: string, subtype: AnySubtype | undefined) => {
    setWeekState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, subtype } : task
      ),
    }));
  };

  const deleteTask = (id: string) => {
    setWeekState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id),
    }));
  };

  const updateGroupTitle = (id: string, title: string) => {
    setWeekState((prev) => ({
      ...prev,
      groups: prev.groups.map((group) =>
        group.id === id ? { ...group, title } : group
      ),
    }));
  };

  const deleteGroup = (id: string) => {
    setWeekState((prev) => ({
      ...prev,
      groups: prev.groups.filter((group) => group.id !== id),
      tasks: prev.tasks.filter((task) => task.groupId !== id),
    }));
  };

  // --- GOAL ACTIONS ---
  const addGoal = (name: string, emoji?: string) => {
    const newGoal: Goal = {
      id: generateId(),
      name,
      emoji,
      createdAt: new Date().toISOString(),
    };
    setWeekState((prev) => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));
  };

  const updateGoal = (
    id: string,
    updates: Partial<Omit<Goal, "id" | "createdAt">>
  ) => {
    setWeekState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  };

  const deleteGoal = (id: string) => {
    setWeekState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
      // Unlink from tasks
      tasks: prev.tasks.map((t) =>
        t.goalId === id ? { ...t, goalId: undefined } : t
      ),
    }));
  };

  // --- COMPANION ACTIONS ---
  const addCompanion = (
    name: string,
    relationship: Companion["relationship"],
    avatarEmoji?: string,
    description?: string
  ) => {
    const newComp: Companion = {
      id: generateId(),
      name,
      relationship,
      avatarEmoji,
      description,
      // Random color generator
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
      createdAt: new Date().toISOString(),
    };
    setWeekState((prev) => ({
      ...prev,
      companions: [...prev.companions, newComp],
    }));
  };

  const updateCompanion = (
    id: string,
    updates: Partial<Omit<Companion, "id" | "createdAt">>
  ) => {
    setWeekState((prev) => ({
      ...prev,
      companions: prev.companions.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  };

  const deleteCompanion = (id: string) => {
    setWeekState((prev) => ({
      ...prev,
      companions: prev.companions.filter((c) => c.id !== id),
      // Unlink from tasks
      tasks: prev.tasks.map((t) => ({
        ...t,
        companionIds: t.companionIds?.filter((cid) => cid !== id),
      })),
    }));
  };

  // --- LINKING ACTIONS ---
  const setTaskGoal = (taskId: string, goalId: string | undefined | null) => {
    setWeekState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, goalId: goalId || undefined } : t
      ),
    }));
  };

  const setTaskCompanions = (taskId: string, companionIds: string[]) => {
    setWeekState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, companionIds } : t
      ),
    }));
  };

  return {
    weekState,
    setWeekState,
    actions: {
      addTask,
      addGroup,
      updateTaskStatus,
      updateTaskTitle,
      updateTaskKind,
      updateTaskSubtype,
      deleteTask,
      updateGroupTitle,
      deleteGroup,
      // Goal Actions
      addGoal,
      updateGoal,
      deleteGoal,
      // Companion Actions
      addCompanion,
      updateCompanion,
      deleteCompanion,
      // Linking Actions
      setTaskGoal,
      setTaskCompanions,
    },
  };
}
