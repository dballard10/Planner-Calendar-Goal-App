import { useEffect, useMemo, useState } from "react";
import type {
  WeekState,
  Task,
  TaskStatus,
  TaskLocation,
  Group,
  WeeklyItemType,
  Goal,
  Companion,
  RecurrenceRule,
  RecurrenceException,
} from "../types/weekly";
import { GOAL_ACCENT_COLORS } from "../components/goals/goalStyles";
import { parseWeeklyMarkdown } from "../lib/markdown/tasks";
import { mockWeekMarkdownByStartISO, availableMockWeekStartsISO } from "../mock/weeks";
import { applyRecurrencesToWeek } from "../lib/weekly/recurrence";
import type { DayClipboard } from "../lib/weekly/dayClipboard";
import {
  getMaxRootTaskPosition,
  getMaxGroupPosition,
} from "../lib/weekly/dayClipboard";

const LOCAL_STORAGE_KEY = "weekly_user_data_v1";

interface UserWeekData {
  tasks: Task[];
  groups: Group[];
}

interface UserDataStore {
  weeks: Record<string, UserWeekData>;
  companions: Companion[];
  goals: Goal[];
  recurrences: Record<string, RecurrenceRule>;
  recurrenceExceptions: Record<string, RecurrenceException>;
}

// Helper to get the Sunday for a given date
export function getSundayForDate(date: Date): Date {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - daysToSubtract);
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

// Helper to get the most recent Sunday
export function getMostRecentSunday(): Date {
  return getSundayForDate(new Date());
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
    name: "Sarah Kelly",
    relationship: "friend" as const,
    color: "#fb7185",
    createdAt: new Date().toISOString(),
  };
  const compMike = {
    id: "comp-mike",
    name: "Mike",
    relationship: "coworker" as const,
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

function loadWeekStateForStart(
  weekStart: string,
  userWeeks?: Record<string, UserWeekData>,
  recurrences: Record<string, RecurrenceRule> = {},
  exceptions: Record<string, RecurrenceException> = {}
): WeekState {
  let state: WeekState;

  // 1. Check user storage
  if (userWeeks && userWeeks[weekStart]) {
    const fallback = createMockData(weekStart);
    state = {
      weekStart,
      tasks: userWeeks[weekStart].tasks,
      groups: userWeeks[weekStart].groups,
      goals: fallback.goals,
      companions: fallback.companions,
    };
  } else {
    // 2. Check mock markdown
    const markdown = mockWeekMarkdownByStartISO[weekStart];
    const fallback = createMockData(weekStart);

    if (!markdown) {
      state = {
        weekStart,
        ...fallback,
      };
    } else {
      const parsed = parseWeeklyMarkdown(markdown);
      state = {
        weekStart,
        tasks: parsed.tasks,
        groups: parsed.groups,
        goals: fallback.goals,
        companions: fallback.companions,
      };
    }
  }

  // Apply recurrences to the loaded state
  state.tasks = applyRecurrencesToWeek(
    weekStart,
    state.tasks,
    recurrences,
    exceptions
  );

  return state;
}

export function useWeekState() {
  const initialWeekStartISO = useMemo(() => formatDateISO(getMostRecentSunday()), []);

  // Initialize once from localStorage
  const [dataStore, setDataStore] = useState<UserDataStore>(() => {
    const defaultStore: UserDataStore = {
      weeks: {},
      companions: [],
      goals: [],
      recurrences: {},
      recurrenceExceptions: {},
    };
    if (typeof window === "undefined") return defaultStore;
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultStore,
          ...parsed,
        };
      } catch (e) {
        console.error("Failed to parse weekly user data", e);
      }
    }
    return defaultStore;
  });

  const initialState = loadWeekStateForStart(
    initialWeekStartISO,
    dataStore.weeks,
    dataStore.recurrences,
    dataStore.recurrenceExceptions
  );

  // Global profiles (persist across week changes)
  const [companions, setCompanions] = useState<Companion[]>(
    dataStore.companions.length > 0
      ? dataStore.companions
      : initialState.companions
  );
  const [goals, setGoals] = useState<Goal[]>(
    dataStore.goals.length > 0 ? dataStore.goals : initialState.goals
  );
  const [recurrences, setRecurrences] = useState<Record<string, RecurrenceRule>>(
    dataStore.recurrences
  );
  const [recurrenceExceptions, setRecurrenceExceptions] = useState<
    Record<string, RecurrenceException>
  >(dataStore.recurrenceExceptions);

  // Week-specific data
  const [weekSpecificState, setWeekSpecificState] = useState<{
    weekStart: string;
    tasks: Task[];
    groups: Group[];
  }>({
    weekStart: initialState.weekStart,
    tasks: initialState.tasks,
    groups: initialState.groups,
  });

  // Save everything to localStorage whenever state changes
  useEffect(() => {
    setDataStore((prev) => {
      const updatedStore: UserDataStore = {
        ...prev,
        weeks: {
          ...prev.weeks,
          [weekSpecificState.weekStart]: {
            tasks: weekSpecificState.tasks,
            groups: weekSpecificState.groups,
          },
        },
        companions,
        goals,
        recurrences,
        recurrenceExceptions,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedStore));
      return updatedStore;
    });
  }, [weekSpecificState, companions, goals, recurrences, recurrenceExceptions]);

  // Combine for backwards compatibility
  const weekState: WeekState = {
    ...weekSpecificState,
    companions,
    goals,
  };

  // Derived available weeks list
  const availableWeekStartsISO = useMemo(() => {
    const allStarts = new Set([
      ...availableMockWeekStartsISO,
      ...Object.keys(dataStore.weeks),
    ]);
    return Array.from(allStarts).sort((a, b) => (a < b ? 1 : -1));
  }, [dataStore.weeks]);

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

    setWeekSpecificState((prev) => ({
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

    setWeekSpecificState((prev) => ({
      ...prev,
      groups: [...prev.groups, newGroup],
    }));
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setWeekSpecificState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, status } : task
      ),
    }));
  };

  const updateTaskTitle = (id: string, title: string) => {
    setWeekSpecificState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, title } : task
      ),
    }));
  };

  const updateTaskType = (id: string, type: WeeklyItemType) => {
    setWeekSpecificState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, type } : task
      ),
    }));
  };

  const updateTaskLinks = (id: string, linksMarkdown?: string) => {
    setWeekSpecificState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, linksMarkdown } : task
      ),
    }));
  };

  const updateTaskNotes = (id: string, notesMarkdown?: string) => {
    setWeekSpecificState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, notesMarkdown } : task
      ),
    }));
  };

  const updateTaskLocation = (id: string, location?: TaskLocation) => {
    setWeekSpecificState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, location } : task
      ),
    }));
  };

  const deleteTask = (id: string) => {
    setWeekSpecificState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id),
    }));
  };

  const updateGroupTitle = (id: string, title: string) => {
    setWeekSpecificState((prev) => ({
      ...prev,
      groups: prev.groups.map((group) =>
        group.id === id ? { ...group, title } : group
      ),
    }));
  };

  const deleteGroup = (id: string) => {
    setWeekSpecificState((prev) => ({
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
    setGoals((prev) => [...prev, newGoal]);
  };

  const updateGoal = (
    id: string,
    updates: Partial<Omit<Goal, "id" | "createdAt">>
  ) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    // Unlink from tasks
    setWeekSpecificState((prev) => ({
      ...prev,
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
    description?: string
  ): string => {
    const id = generateId();
    const newComp: Companion = {
      id,
      name,
      relationship,
      description,
      // Random color generator
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
      createdAt: new Date().toISOString(),
    };
    setCompanions((prev) => [...prev, newComp]);
    return id;
  };

  const updateCompanion = (
    id: string,
    updates: Partial<Omit<Companion, "id" | "createdAt">>
  ) => {
    setCompanions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCompanion = (id: string) => {
    setCompanions((prev) => prev.filter((c) => c.id !== id));
    // Unlink from tasks
    setWeekSpecificState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => ({
        ...t,
        companionIds: t.companionIds?.filter((cid) => cid !== id),
      })),
    }));
  };

  // --- LINKING ACTIONS ---
  const setTaskGoals = (taskId: string, goalIds: string[]) => {
    setWeekSpecificState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? { ...t, goalIds: goalIds.length > 0 ? goalIds : undefined }
          : t
      ),
    }));
  };

  const setTaskCompanions = (taskId: string, companionIds: string[]) => {
    setWeekSpecificState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, companionIds } : t
      ),
    }));
  };
  
  const updateTaskSchedule = (
    taskId: string,
    schedule: {
      startDate?: string;
      endDate?: string;
      startTime?: string;
      endTime?: string;
    }
  ) => {
    setWeekSpecificState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, ...schedule } : t
      ),
    }));
  };

  const setWeekStart = (weekStartISO: string) => {
    const newWeekData = loadWeekStateForStart(
      weekStartISO,
      dataStore.weeks,
      recurrences,
      recurrenceExceptions
    );
    // Only update week-specific data, preserve global profiles
    setWeekSpecificState({
      weekStart: newWeekData.weekStart,
      tasks: newWeekData.tasks,
      groups: newWeekData.groups,
    });
  };

  const createOrSelectCurrentWeek = () => {
    const todayISO = formatDateISO(getMostRecentSunday());
    
    // Check if it already exists in user store or mock data
    const exists = dataStore.weeks[todayISO] || mockWeekMarkdownByStartISO[todayISO];
    
    if (!exists) {
      // Create empty entry in user store
      setWeekSpecificState({
        weekStart: todayISO,
        tasks: [],
        groups: [],
      });
    } else {
      // Just select it
      setWeekStart(todayISO);
    }
  };

  // --- RECURRENCE ACTIONS ---
  const createOrUpdateRecurrenceFromTask = (
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
  ) => {
    const task = weekState.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const recurrenceId = task.recurrenceId || generateId();
    const rule: RecurrenceRule = {
      ...ruleDraft,
      id: recurrenceId,
      title: task.title,
      type: task.type,
      goalIds: task.goalIds,
      companionIds: task.companionIds,
      linksMarkdown: task.linksMarkdown,
      location: task.location,
      notesMarkdown: task.notesMarkdown,
      groupId: task.groupId,
    };

    setRecurrences((prev) => ({ ...prev, [recurrenceId]: rule }));

    // Link current task to the recurrence
    setWeekSpecificState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              recurrenceId,
              occurrenceDateISO: t.occurrenceDateISO || rule.startDateISO,
            }
          : t
      ),
    }));
  };

  const deleteRecurrenceSeries = (recurrenceId: string) => {
    setRecurrences((prev) => {
      const next = { ...prev };
      delete next[recurrenceId];
      return next;
    });
    setRecurrenceExceptions((prev) => {
      const next = { ...prev };
      delete next[recurrenceId];
      return next;
    });

    // Clean up occurrences in all weeks
    setDataStore((prev) => {
      const nextWeeks = { ...prev.weeks };
      Object.keys(nextWeeks).forEach((weekISO) => {
        nextWeeks[weekISO] = {
          ...nextWeeks[weekISO],
          tasks: nextWeeks[weekISO].tasks.filter(
            (t) => t.recurrenceId !== recurrenceId
          ),
        };
      });
      return { ...prev, weeks: nextWeeks };
    });

    setWeekSpecificState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.recurrenceId !== recurrenceId),
    }));
  };

  const deleteTaskOccurrence = (taskId: string) => {
    const task = weekState.tasks.find((t) => t.id === taskId);
    if (!task || !task.recurrenceId || !task.occurrenceDateISO) {
      deleteTask(taskId);
      return;
    }

    const { recurrenceId, occurrenceDateISO } = task;

    setRecurrenceExceptions((prev) => {
      const current = prev[recurrenceId] || { skipDatesISO: [] };
      return {
        ...prev,
        [recurrenceId]: {
          ...current,
          skipDatesISO: [...current.skipDatesISO, occurrenceDateISO],
        },
      };
    });

    setWeekSpecificState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  // --- DAY BULK ACTIONS ---
  const deleteAllForDay = (dayIndex: number) => {
    // 1. Identify recurring occurrences in this day
    const recurringTasks = weekSpecificState.tasks.filter(
      (t) =>
        t.dayIndex === dayIndex && t.recurrenceId && t.occurrenceDateISO
    );

    // 2. Add skip-date exceptions so they don't regenerate on reload
    if (recurringTasks.length > 0) {
      setRecurrenceExceptions((prev) => {
        const next = { ...prev };
        recurringTasks.forEach((t) => {
          if (!t.recurrenceId || !t.occurrenceDateISO) return;
          const current = next[t.recurrenceId] || { skipDatesISO: [] };
          if (!current.skipDatesISO.includes(t.occurrenceDateISO)) {
            next[t.recurrenceId] = {
              ...current,
              skipDatesISO: [...current.skipDatesISO, t.occurrenceDateISO],
            };
          }
        });
        return next;
      });
    }

    // 3. Remove all tasks and groups for this day
    setWeekSpecificState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.dayIndex !== dayIndex),
      groups: prev.groups.filter((g) => g.dayIndex !== dayIndex),
    }));
  };

  const pasteDayFromClipboard = (
    dayIndex: number,
    clipboard: DayClipboard
  ) => {
    if (!clipboard || (clipboard.tasks.length === 0 && clipboard.groups.length === 0)) {
      return;
    }

    const now = new Date().toISOString();

    // Compute starting positions for new groups
    const existingMaxGroupPos = getMaxGroupPosition(weekSpecificState.groups, dayIndex);

    // Create new groups and build a map from clipboard groupIndex to new groupId
    const groupIndexToNewId = new Map<number, string>();
    const newGroups: Group[] = clipboard.groups.map((cg, idx) => {
      const newId = generateId();
      groupIndexToNewId.set(idx, newId);
      return {
        id: newId,
        title: cg.title,
        dayIndex,
        position: existingMaxGroupPos + 1 + idx,
        createdAt: now,
      };
    });

    // Compute starting position for root tasks
    const existingMaxRootPos = getMaxRootTaskPosition(weekSpecificState.tasks, dayIndex);

    // Track positions per group for group tasks
    const groupTaskPositionMap = new Map<string, number>();
    newGroups.forEach((g) => {
      groupTaskPositionMap.set(g.id, -1);
    });

    // Separate clipboard tasks into root vs group tasks
    const rootClipboardTasks = clipboard.tasks.filter(
      (ct) => ct.groupIndex === undefined
    );
    const groupClipboardTasks = clipboard.tasks.filter(
      (ct) => ct.groupIndex !== undefined
    );

    // Create root tasks
    const newRootTasks: Task[] = rootClipboardTasks.map((ct, idx) => ({
      id: generateId(),
      type: ct.type,
      title: ct.title,
      status: "open" as const,
      dayIndex,
      position: existingMaxRootPos + 1 + idx,
      createdAt: now,
      goalIds: ct.goalIds,
      companionIds: ct.companionIds,
      linksMarkdown: ct.linksMarkdown,
      location: ct.location,
      notesMarkdown: ct.notesMarkdown,
      startDate: ct.startDate,
      endDate: ct.endDate,
      startTime: ct.startTime,
      endTime: ct.endTime,
    }));

    // Create group tasks
    const newGroupTasks: Task[] = groupClipboardTasks.map((ct) => {
      const newGroupId = groupIndexToNewId.get(ct.groupIndex!);
      if (!newGroupId) {
        // Fallback to root task if group mapping fails
        return {
          id: generateId(),
          type: ct.type,
          title: ct.title,
          status: "open" as const,
          dayIndex,
          position: existingMaxRootPos + 1 + rootClipboardTasks.length,
          createdAt: now,
          goalIds: ct.goalIds,
          companionIds: ct.companionIds,
          linksMarkdown: ct.linksMarkdown,
          location: ct.location,
          startDate: ct.startDate,
          endDate: ct.endDate,
          startTime: ct.startTime,
          endTime: ct.endTime,
        };
      }

      // Get next position for this group
      const currentPos = groupTaskPositionMap.get(newGroupId) ?? -1;
      const nextPos = currentPos + 1;
      groupTaskPositionMap.set(newGroupId, nextPos);

      return {
        id: generateId(),
        type: ct.type,
        title: ct.title,
        status: "open" as const,
        dayIndex,
        position: nextPos,
        createdAt: now,
        groupId: newGroupId,
        goalIds: ct.goalIds,
        companionIds: ct.companionIds,
        linksMarkdown: ct.linksMarkdown,
        location: ct.location,
        notesMarkdown: ct.notesMarkdown,
        startDate: ct.startDate,
        endDate: ct.endDate,
        startTime: ct.startTime,
        endTime: ct.endTime,
      };
    });

    setWeekSpecificState((prev) => ({
      ...prev,
      groups: [...prev.groups, ...newGroups],
      tasks: [...prev.tasks, ...newRootTasks, ...newGroupTasks],
    }));
  };

  const addTaskFromClipboard = (
    dayIndex: number,
    ct: ClipboardTask
  ) => {
    const now = new Date().toISOString();
    const existingMaxRootPos = getMaxRootTaskPosition(
      weekSpecificState.tasks,
      dayIndex
    );

    const newTask: Task = {
      id: generateId(),
      type: ct.type,
      title: ct.title,
      status: "open" as const,
      dayIndex,
      position: existingMaxRootPos + 1,
      createdAt: now,
      goalIds: ct.goalIds,
      companionIds: ct.companionIds,
      linksMarkdown: ct.linksMarkdown,
      location: ct.location,
      notesMarkdown: ct.notesMarkdown,
      startDate: ct.startDate,
      endDate: ct.endDate,
      startTime: ct.startTime,
      endTime: ct.endTime,
    };

    setWeekSpecificState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));
  };

  const clearCurrentWeek = () => {
    // 1. Identify all recurring occurrences in the current week
    const recurringTasks = weekSpecificState.tasks.filter(
      (t) => t.recurrenceId && t.occurrenceDateISO
    );

    // 2. Add exceptions for all of them so they don't regenerate
    if (recurringTasks.length > 0) {
      setRecurrenceExceptions((prev) => {
        const next = { ...prev };
        recurringTasks.forEach((t) => {
          if (!t.recurrenceId || !t.occurrenceDateISO) return;
          const current = next[t.recurrenceId] || { skipDatesISO: [] };
          if (!current.skipDatesISO.includes(t.occurrenceDateISO)) {
            next[t.recurrenceId] = {
              ...current,
              skipDatesISO: [...current.skipDatesISO, t.occurrenceDateISO],
            };
          }
        });
        return next;
      });
    }

    // 3. Clear tasks and groups for this week
    setWeekSpecificState((prev) => ({
      ...prev,
      tasks: [],
      groups: [],
    }));
  };

  return {
    weekState,
    availableWeekStartsISO,
    actions: {
      addTask,
      addGroup,
      updateTaskStatus,
      updateTaskTitle,
      updateTaskType,
      updateTaskLinks,
      updateTaskNotes,
      updateTaskLocation,
      deleteTask,
      updateGroupTitle,
      deleteGroup,
      deleteAllForDay,
      pasteDayFromClipboard,
      addTaskFromClipboard,
      clearCurrentWeek,
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
      updateTaskSchedule,
      setWeekStart,
      createOrSelectCurrentWeek,
      createOrSelectWeekForDate: (dateISO: string) => {
        const date = new Date(dateISO + "T00:00:00");
        const sunday = getSundayForDate(date);
        const weekStartISO = formatDateISO(sunday);

        // Check if it already exists in user store or mock data
        const exists =
          dataStore.weeks[weekStartISO] ||
          mockWeekMarkdownByStartISO[weekStartISO];

        if (!exists) {
          // Create empty entry in user store
          setWeekSpecificState({
            weekStart: weekStartISO,
            tasks: [],
            groups: [],
          });
        } else {
          // Just select it
          setWeekStart(weekStartISO);
        }
      },
      // Recurrence Actions
      createOrUpdateRecurrenceFromTask,
      deleteRecurrenceSeries,
      deleteTaskOccurrence,
    },
  };
}
