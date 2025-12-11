import type { WeekState, Task } from "../../types/weekly";
import type { CalendarEvent } from "../../types/calendar";

export function getTaskDate(weekStartISO: string, dayIndex: number): Date {
  const base = new Date(weekStartISO);
  const d = new Date(base);
  d.setDate(base.getDate() + dayIndex);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function convertWeekToCalendarEvents(week: WeekState): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  if (!week || !week.tasks) return events;

  week.tasks.forEach((task) => {
    // Only show tasks that are not cancelled or failed? 
    // The requirement says "Show Events, Holidays, Tasks (summary only)".
    // Let's include all for now, maybe filtered by status visually later.
    
    const date = getTaskDate(week.weekStart, task.dayIndex);
    // Format as ISO string YYYY-MM-DD
    const dateStr = date.toISOString().split("T")[0];

    events.push({
      id: `evt-${task.id}`, // Unique ID for calendar event
      type: 'task',
      title: task.title,
      start: dateStr, // All-day event by default if no time
      taskId: task.id,
      // We can map status to color or content if needed
      content: `Status: ${task.status}`,
    });
  });

  return events;
}

// Placeholder for future extension
export function mergeCalendarEvents(
  tasks: CalendarEvent[], 
  extras: CalendarEvent[] = []
): CalendarEvent[] {
  return [...tasks, ...extras];
}

