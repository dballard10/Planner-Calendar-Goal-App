---
name: Weekly folder tree
overview: Add an Obsidian-like (UI-only) Year -> Month -> Week tree under the Weekly tab in the left sidebar. Clicking a week sets `weekState.weekStart` (without regenerating mock data) and shows the existing WeeklyView for that selected week.
todos:
  - id: weekstate-set-weekstart
    content: Add `setWeekStart(iso)` to `useWeekState` that updates only `weekState.weekStart` (no `createMockData`).
    status: completed
  - id: prop-drill-weekstart
    content: Plumb `weekStart` + `onSelectWeekStart` from `App` -> `AppShellLayout` -> `LeftSidebar`.
    status: completed
    dependencies:
      - weekstate-set-weekstart
  - id: weekly-folder-tree-ui
    content: Create `WeeklyFolderTree` component rendering Year -> Month -> Week (single path) with expand/collapse.
    status: completed
    dependencies:
      - prop-drill-weekstart
  - id: sidebar-render-tree
    content: Render `WeeklyFolderTree` under the Weekly tab when `activeTab === "weekly"` and sidebar is open; clicking week sets weekStart + ensures Weekly tab active.
    status: completed
    dependencies:
      - weekly-folder-tree-ui
---

# Weekly folder tree (UI-only)

## Goal

- In the left sidebar, when **Weekly** is selected, show a simple **expand/collapse tree** like Obsidian’s file explorer:
- `2025/` -> `December/` -> `Week of 2025-12-14`
- Clicking the week node **navigates the main content** to the existing weekly view by updating `weekState.weekStart`.
- **No new mock data** is created; tasks/goals/companions remain the same arrays.

## Key decisions (based on your answers)

- **Week start**: always **Sunday**.
- **Tree range (simplest)**: show only the **single current week path** (one year, one month, one week).

## Implementation approach

### 1) Make week selection possible without regenerating data

- Update [`src/hooks/useWeekState.ts`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/hooks/useWeekState.ts):
- Add an action like `setWeekStart(weekStartISO: string)` that only updates `weekState.weekStart`.
- Important: do **not** call `createMockData()` when switching weeks.

### 2) Expose week selection to the left sidebar

- Update [`src/App.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/App.tsx):
- Pass `weekState.weekStart` and a callback (wrapping `actions.setWeekStart`) down into the layout/sidebar.
- Update [`src/components/layout/AppShellLayout.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/layout/AppShellLayout.tsx) and [`src/components/layout/LeftSidebar.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/layout/LeftSidebar.tsx) to accept these new optional props.

### 3) Add the weekly folder tree UI

- Add a small component (new file), e.g. [`src/components/weekly/sidebar/WeeklyFolderTree.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/weekly/sidebar/WeeklyFolderTree.tsx):
- Inputs: `weekStartISO: string`, `onSelectWeekStart(iso: string)`.
- Render: Year node, Month node, Week node.
- Store expand/collapse state locally with `useState`.
- Default behavior (simplest/usable): **auto-expanded** so the week is visible immediately; user can still collapse.

### 4) Wire it into the sidebar

- Render `WeeklyFolderTree` inside `LeftSidebar` **only when**:
- `activeTab === "weekly"` and `isOpen === true`.

## Notes / Obsidian analogy

- Obsidian shows a tree because it mirrors **real folders/files** on disk; our UI-only version mirrors the same interaction model (expand/collapse + select), but derives nodes from dates instead of the filesystem.

## Files touched

- Update: [`src/hooks/useWeekState.ts`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/hooks/useWeekState.ts)
- Update: [`src/App.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/App.tsx)
- Update: [`src/components/layout/AppShellLayout.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/layout/AppShellLayout.tsx)