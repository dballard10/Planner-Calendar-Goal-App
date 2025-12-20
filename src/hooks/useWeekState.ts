import { useState } from "react";
import type {
  WeekState,
  Task,
  TaskStatus,
  Group,
  WeeklyItemType,
  Goal,
  Companion,
} from "../types/weekly";
import { GOAL_ACCENT_COLORS } from "../components/goals/goalStyles";
import { parseWeeklyMarkdown } from "../lib/markdown/tasks";
import { mockWeekMarkdownByStartISO } from "../mock/weeks";

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

function generateAccentColor() {
  const index = Math.floor(Math.random() * GOAL_ACCENT_COLORS.length);
  return GOAL_ACCENT_COLORS[index];
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

  const add = (
    dayIndex: number,
    title: string,
    type: WeeklyItemType,
    status: TaskStatus = "open",
    goalIdOrIds?: string | string[],
    companionIds?: string[]
  ) => {
    const existing = tasks.filter((t) => t.dayIndex === dayIndex).length;

    const normalizedGoalIds = goalIdOrIds
      ? Array.isArray(goalIdOrIds)
        ? goalIdOrIds
        : [goalIdOrIds]
      : undefined;

    tasks.push({
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      status,
      dayIndex,
      position: existing,
      createdAt: new Date(
        baseDate.getTime() + dayIndex * 24 * 60 * 60 * 1000
      ).toISOString(),
      goalIds: normalizedGoalIds,
      companionIds,
    });
  };

  // Create Mock Goals
  const goalGuitar = {
    id: "goal-guitar",
    name: "Guitar",
    emoji: "🎸",
    color: "#8b5cf6",
    description: "Build consistency with regular practice sets.",
    createdAt: new Date().toISOString(),
  };
  const goalWorkout = {
    id: "goal-workout",
    name: "Working Out",
    emoji: "🏋️",
    color: "#22d3ee",
    description: "Hit strength and mobility targets three times per week.",
    createdAt: new Date().toISOString(),
  };
  const goalCareer = {
    id: "goal-career",
    name: "Career",
    emoji: "💼",
    color: "#f97316",
    description: "Finish key deliverables for the quarter.",
    createdAt: new Date().toISOString(),
  };
  goals.push(goalGuitar, goalWorkout, goalCareer);

  // Create Mock Companions
  const compSarah = {
    id: "comp-sarah",
    name: "Sarah",
    relationship: "friend" as const,
    avatarEmoji: "👩",
    color: "#fb7185",
    createdAt: new Date().toISOString(),
  };
  const compMike = {
    id: "comp-mike",
    name: "Mike",
    relationship: "coworker" as const,
    avatarEmoji: "👨",
    color: "#60a5fa",
    createdAt: new Date().toISOString(),
  };
  companions.push(compSarah, compMike);

  const dailyTemplates: Record<
    number,
    Array<{
      title: string;
      type: WeeklyItemType;
      status?: TaskStatus;
      goalIds?: string[];
      companionIds?: string[];
    }>
  > = {
    0: [
      {
        title: "Weekly planning review",
        type: "task",
        status: "open",
        goalIds: [goalCareer.id],
      },
      { title: "Grocery run", type: "task", status: "completed" },
      {
        title: "Family time - board games",
        type: "event",
        companionIds: [compSarah.id],
      },
      {
        title: "Meal prep for the week",
        type: "task",
        goalIds: [goalWorkout.id],
      },
      {
        title: "Relaxation + reading",
        type: "task",
        status: "open",
        goalIds: [goalGuitar.id],
      },
    ],
    1: [
      {
        title: "Team standup",
        type: "event",
        goalIds: [goalCareer.id],
        companionIds: [compMike.id],
      },
      { title: "Email triage", type: "task", goalIds: [goalCareer.id] },
      {
        title: "Deep work sprint",
        type: "event",
        goalIds: [goalCareer.id],
      },
      {
        title: "Company holiday (observed)",
        type: "holiday",
      },
      {
        title: "Evening stretch circuit",
        type: "event",
        goalIds: [goalWorkout.id],
      },
    ],
    2: [
      {
        title: "Sarah's birthday brunch",
        type: "birthday",
        companionIds: [compSarah.id],
      },
      {
        title: "Finish project proposal",
        type: "task",
        goalIds: [goalCareer.id],
      },
      {
        title: "Focus block",
        type: "event",
        goalIds: [goalCareer.id],
      },
      {
        title: "Evening journaling",
        type: "task",
      },
    ],
    3: [
      { title: "Submit expenses", type: "task", goalIds: [goalCareer.id] },
      {
        title: "Client call",
        type: "event",
        companionIds: [compMike.id],
        goalIds: [goalCareer.id],
      },
      { title: "Clean apartment", type: "task" },
      {
        title: "Code review",
        type: "task",
        goalIds: [goalCareer.id],
        companionIds: [compMike.id],
      },
      { title: "Evening run", type: "event", goalIds: [goalWorkout.id] },
    ],
    4: [
      { title: "Team sync", type: "event", companionIds: [compMike.id] },
      { title: "Write blog post", type: "task" },
      {
        title: "Dinner with friends",
        type: "event",
        companionIds: [compSarah.id],
      },
    ],
    5: [
      {
        title: "Wrap up weekly report",
        type: "task",
        goalIds: [goalCareer.id],
      },
      {
        title: "Project demo",
        type: "event",
        goalIds: [goalCareer.id],
        companionIds: [compMike.id],
      },
      { title: "Plan weekend", type: "task" },
      {
        title: "Happy hour",
        type: "event",
        companionIds: [compSarah.id, compMike.id],
      },
    ],
    6: [
      { title: "Laundry", type: "task" },
      {
        title: "Brunch with Sarah",
        type: "event",
        companionIds: [compSarah.id],
      },
      { title: "Long hike", type: "task", goalIds: [goalWorkout.id] },
      { title: "Movie night", type: "event" },
    ],
  };

  Object.entries(dailyTemplates).forEach(([dayIndexStr, entries]) => {
    const dayIndex = Number(dayIndexStr);
    entries.forEach((entry) => {
      add(
        dayIndex,
        entry.title,
        entry.type,
        entry.status,
        entry.goalIds,
        entry.companionIds
      );
    });
  });

  return {
    tasks,
    groups: [],
    goals,
    companions,
  };
}

function loadWeekStateForStart(weekStart: string): WeekState {
  const markdown = mockWeekMarkdownByStartISO[weekStart];
  const fallback = createMockData(weekStart);

  if (!markdown) {
    return {
      weekStart,
      ...fallback,
    };
  }

  const parsed = parseWeeklyMarkdown(markdown);

  return {
    weekStart,
    tasks: parsed.tasks,
    groups: parsed.groups,
    goals: fallback.goals,
    companions: fallback.companions,
  };
}

export function useWeekState() {
  const weekStartDate = getMostRecentSunday();
  const weekStartISO = formatDateISO(weekStartDate);

  const [weekState, setWeekState] = useState<WeekState>(() =>
    loadWeekStateForStart(weekStartISO)
  );

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
      type: "task",
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

  const updateTaskType = (id: string, type: WeeklyItemType) => {
    setWeekState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, type } : task
      ),
    }));
  };

  const updateTaskLinks = (id: string, linksMarkdown?: string) => {
    setWeekState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, linksMarkdown } : task
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
      color: generateAccentColor(),
      description: "",
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
      tasks: prev.tasks.map((t) => {
        if (!t.goalIds?.includes(id)) return t;
        const updatedGoalIds = t.goalIds.filter((gid) => gid !== id);
        return {
          ...t,
          goalIds: updatedGoalIds.length > 0 ? updatedGoalIds : undefined,
        };
      }),
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
  const setTaskGoals = (taskId: string, goalIds: string[]) => {
    setWeekState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? { ...t, goalIds: goalIds.length > 0 ? goalIds : undefined }
          : t
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

  const setWeekStart = (weekStartISO: string) => {
    setWeekState(loadWeekStateForStart(weekStartISO));
  };

  return {
    weekState,
    setWeekState,
    actions: {
      addTask,
      addGroup,
      updateTaskStatus,
      updateTaskTitle,
      updateTaskType,
      updateTaskLinks,
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
      setTaskGoals,
      setTaskCompanions,
      setWeekStart,
    },
  };
}
