import type { Task, TaskStatus, WeekState, Group } from "../../types/weekly";

export type MarkdownTaskStatusToken = "[ ]" | "[x]" | "[>]" | "[-]" | "[?]";

export interface MarkdownTask {
  status: TaskStatus;
  title: string;
}

export const taskStatusToToken = (
  status: TaskStatus
): MarkdownTaskStatusToken => {
  switch (status) {
    case "completed":
      return "[x]";
    case "moved":
      return "[>]";
    case "cancelled":
      return "[-]";
    case "failed":
      return "[?]";
    case "open":
    default:
      return "[ ]";
  }
};

export const tokenToTaskStatus = (token: string): TaskStatus => {
  switch (token) {
    case "[x]":
      return "completed";
    case "[>]":
      return "moved";
    case "[-]":
      return "cancelled";
    case "[?]":
      return "failed";
    case "[ ]":
    default:
      return "open";
  }
};

const TASK_LINE_REGEX = /^(\s*)([-*])\s+\[( |x|>|\-|\?)\]\s+(.*)$/;
const GROUP_HEADER_REGEX = /^#{4}\s+Group:\s+(.*)$/;

export const parseMarkdownTaskLine = (line: string): MarkdownTask | null => {
  const match = line.match(TASK_LINE_REGEX);
  if (!match) return null;

  // match[1] is indent, match[2] is bullet char
  const rawToken = match[3];
  const title = match[4].trim();

  const token: MarkdownTaskStatusToken =
    rawToken === " " ? "[ ]" : (`[${rawToken}]` as MarkdownTaskStatusToken);

  return {
    status: tokenToTaskStatus(token),
    title,
  };
};

export const serializeMarkdownTask = (task: MarkdownTask): string => {
  const token = taskStatusToToken(task.status);
  const title = task.title.trim() || "New task...";
  return `- ${token} ${title}`;
};

export const taskToMarkdownLine = (task: Task): string => {
  return serializeMarkdownTask({
    status: task.status,
    title: task.title,
  });
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const formatISODate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const getDateForDayIndex = (weekStartISO: string, dayIndex: number): Date => {
  const base = new Date(weekStartISO);
  const d = new Date(base);
  d.setDate(base.getDate() + dayIndex);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatMonthDayLabel = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}`;
};

export const weekStateToMarkdown = (week: WeekState): string => {
  const lines: string[] = [];

  lines.push(`# Week of ${week.weekStart}`);
  lines.push("");
  lines.push("## Days");
  lines.push("");

  for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
    const date = getDateForDayIndex(week.weekStart, dayIndex);
    const dayName = DAY_NAMES[dayIndex];
    const label = formatMonthDayLabel(date);

    lines.push(`### ${dayName} ${label}`);
    lines.push("");

    // 1. Get groups for this day
    const dayGroups = (week.groups || [])
      .filter((g) => g.dayIndex === dayIndex)
      .sort((a, b) => a.position - b.position);

    // 2. Get root-level tasks (no groupId) for this day
    const rootTasks = week.tasks
      .filter((task) => task.dayIndex === dayIndex && !task.groupId)
      .sort((a, b) => a.position - b.position);

    // We need to interleave them based on position if we want precise reconstruction,
    // but for now let's just dump root tasks then groups.
    // TODO: A more robust approach would be to unify them into a single list of "items" and sort.

    // Render root tasks first (or we could mix them)
    if (rootTasks.length > 0) {
      for (const task of rootTasks) {
        lines.push(taskToMarkdownLine(task));
      }
    }

    // Render groups
    for (const group of dayGroups) {
      lines.push("");
      lines.push(`#### Group: ${group.title}`);

      const groupTasks = week.tasks
        .filter((task) => task.groupId === group.id)
        .sort((a, b) => a.position - b.position);

      for (const task of groupTasks) {
        // Indent tasks under group
        lines.push(`  ${taskToMarkdownLine(task)}`);
      }
    }

    // If day is totally empty
    if (rootTasks.length === 0 && dayGroups.length === 0) {
      lines.push("- [ ] ...");
    }

    lines.push("");
  }

  return lines.join("\n");
};

export const parseWeeklyMarkdown = (markdown: string): WeekState => {
  const lines = markdown.split(/\r?\n/);

  let weekStart = "";
  let currentDayIndex: number | null = null;
  let currentGroupId: string | null = null;

  const tasks: Task[] = [];
  const groups: Group[] = [];

  const weekHeaderPrefix = "# Week of ";

  const getOrCreateId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `id-${Math.random().toString(36).slice(2)}`;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!weekStart && trimmed.startsWith(weekHeaderPrefix)) {
      weekStart = trimmed.slice(weekHeaderPrefix.length).trim();
      continue;
    }

    // Day Header
    if (trimmed.startsWith("### ")) {
      const heading = trimmed.slice(4).trim();
      const parts = heading.split(" ");
      const maybeDayName = parts[0];
      const dayIndex = DAY_NAMES.indexOf(
        maybeDayName as (typeof DAY_NAMES)[number]
      );
      currentDayIndex = dayIndex >= 0 ? dayIndex : null;
      currentGroupId = null; // Reset group context on new day
      continue;
    }

    // Group Header
    // Simple heuristic: "#### Group: My Title"
    if (trimmed.startsWith("#### Group:")) {
      if (currentDayIndex == null) continue;

      const groupTitle = trimmed.replace("#### Group:", "").trim();
      const newGroup: Group = {
        id: getOrCreateId(),
        title: groupTitle,
        dayIndex: currentDayIndex,
        position:
          groups.filter((g) => g.dayIndex === currentDayIndex).length +
          tasks.filter((t) => t.dayIndex === currentDayIndex && !t.groupId)
            .length,
        createdAt: new Date().toISOString(),
      };
      groups.push(newGroup);
      currentGroupId = newGroup.id;
      continue;
    }

    // Task Line
    if (TASK_LINE_REGEX.test(line)) {
      if (currentDayIndex == null) continue;
      const parsed = parseMarkdownTaskLine(line);
      if (!parsed) continue;

      // Determine indentation to decide if it belongs to current group
      // But for this simple parser, we'll assume if currentGroupId is set, it belongs there
      // until we hit a new day or new group.
      // Ideally we check indentation levels, but let's keep it simple as requested.
      // If line starts with spaces and we have a group, put it in the group.

      // Check indentation from regex match
      const match = line.match(TASK_LINE_REGEX);
      const indentation = match ? match[1] : "";

      // If no indentation, it might mean we stepped out of the group
      // But let's be loose: if there is an active group, assign to it.
      // If user wants to "exit" group in markdown, they usually start a new header or unindented list.
      // For now: strict indentation check?
      // Let's say 2+ spaces = group task if group active.
      let targetGroupId = currentGroupId;
      if (currentGroupId && indentation.length < 2) {
        // Indentation broken -> likely exited group
        targetGroupId = null;
        currentGroupId = null;
      }

      const existingInContext = targetGroupId
        ? tasks.filter((t) => t.groupId === targetGroupId)
        : tasks.filter((t) => t.dayIndex === currentDayIndex && !t.groupId);

      tasks.push({
        id: getOrCreateId(),
        type: "task",
        title: parsed.title,
        status: parsed.status,
        dayIndex: currentDayIndex,
        position: existingInContext.length,
        createdAt: new Date().toISOString(),
        groupId: targetGroupId || undefined,
      });
    }
  }

  if (!weekStart) {
    const today = new Date();
    const day = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - day);
    sunday.setHours(0, 0, 0, 0);
    weekStart = formatISODate(sunday);
  }

  return {
    weekStart,
    tasks,
    groups,
  };
};
