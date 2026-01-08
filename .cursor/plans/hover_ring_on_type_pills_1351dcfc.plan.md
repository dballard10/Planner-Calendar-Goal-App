---
name: Hover ring on type pills
overview: Add a subtle hover outline (inset ring) to the Task Type pill buttons used in TaskDetailsContent, applied to both selected and unselected states via the shared style constant.
todos:
  - id: add-hover-ring
    content: Add `hover:ring-1 hover:ring-slate-500/60 hover:ring-inset` to `TASK_TYPE_BUTTON_BASE` in `src/components/weekly/styles/taskDetailsStyles.ts`.
    status: completed
---

# Add hover outline (ring) to Task Type buttons

## Goal

- Add an **inset outline on hover** for the Task Type pill buttons (e.g., HOLIDAY) inside the task details header.

## Where this is implemented

- The buttons are rendered in [`src/components/weekly/details/TaskDetailsContent.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/weekly/details/TaskDetailsContent.tsx) using `TASK_TYPE_BUTTON_BASE` + selected/unselected classes.
- The shared class strings live in [`src/components/weekly/styles/taskDetailsStyles.ts`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/weekly/styles/taskDetailsStyles.ts):
```23:28:src/components/weekly/styles/taskDetailsStyles.ts
export const TASK_TYPE_BUTTON_BASE =
  "px-3 py-1 rounded text-xs font-semibold uppercase tracking-wide transition-all";
export const TASK_TYPE_BUTTON_SELECTED = "shadow-sm";
export const TASK_TYPE_BUTTON_UNSELECTED =
  "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-900/60";
```




## Plan

- Update `TASK_TYPE_BUTTON_BASE` in `src/components/weekly/styles/taskDetailsStyles.ts` to include an inset hover ring:
- Add: `hover:ring-1 hover:ring-slate-500/60 hover:ring-inset`