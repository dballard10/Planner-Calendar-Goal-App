---
name: Companion initials consistency
overview: Ensure companions are global profiles so the UI always renders initials from the full companion name (e.g. Sarah Kelly -> SK) everywhere, including weekly task cards and companions lists.
todos:
  - id: split-profiles-from-week
    content: Refactor useWeekState so companions (and optionally goals) are stored as global profiles and not overwritten when switching weeks.
    status: completed
  - id: narrow-setWeekStart
    content: Update setWeekStart/week loading so only tasks/groups/weekStart change, preserving global companions.
    status: completed
    dependencies:
      - split-profiles-from-week
  - id: update-mock-sarah-kelly
    content: Update mock seed companion name for comp-sarah from Sarah to Sarah Kelly so initials render SK immediately.
    status: completed
    dependencies:
      - split-profiles-from-week
  - id: verify-avatar-sites
    content: Verify CompanionAvatar call sites consistently use the global companion name and no other code path derives a different name string.
    status: completed
    dependencies:
      - narrow-setWeekStart
---

# Fix companion avatar initials (Sarah Kelly -> SK)

## Goal

Make companion avatars always derive initials from the companion’s **full name** (e.g. `Sarah Kelly` -> `SK`) everywhere they appear, and prevent tab/week switching from reverting companion profile data back to the mock default `Sarah`.

## What I found

- `CompanionAvatar` renders initials via `getInitials(name)`, which already returns the first letters of up to 2 space-separated parts.
- The weekly task UI resolves companions by ID and passes `c.name` into `CompanionAvatar`.
- The app currently reloads the entire `weekState` (including mock companions) when switching to the Weekly tab / selecting a week, which can overwrite companion profiles back to the mock default name `Sarah`.

Key code paths:

- Avatar initials logic: [`src/components/ui/CompanionAvatar.tsx`](src/components/ui/CompanionAvatar.tsx) and [`src/components/weekly/utils/name.ts`](src/components/weekly/utils/name.ts)
- Weekly task companion resolution: [`src/components/weekly/task/TaskCard.tsx`](src/components/weekly/task/TaskCard.tsx)
- Week state reloading on tab switch: [`src/App.tsx`](src/App.tsx)
- `setWeekStart` reloads full `WeekState` including companions: [`src/hooks/useWeekState.ts`](src/hooks/useWeekState.ts)

## Plan

### 1) Split global profiles from weekly content

- Adjust state so **tasks/groups are week-specific**, while **companions/goals are global profiles**.
- Implement in `useWeekState` by:
- Keeping `companions` (and optionally `goals`) in their own `useState` that is NOT replaced by `setWeekStart`.
- Updating `setWeekStart` to only replace `tasks/groups/weekStart`, not companions.

### 2) Ensure week loading does not overwrite profiles

- Update `loadWeekStateForStart(...)` usage so companions are loaded once (initially), then preserved.
- Update any callers (notably `App.tsx`) so switching to Weekly still jumps to the current week, but does not reset companion profiles.

### 3) Make the demo data match the expected full name

- Update mock companion `comp-sarah` name from `Sarah` to `Sarah Kelly` so avatars render `SK` immediately in the seeded/demo UI.

### 4) Sanity-check all avatar call sites

- Verify `CompanionsPage` and `TaskCard` both pass the global companion name through.
- Confirm no other components construct a different `name` string for avatars.

## Files to change

- [`src/hooks/useWeekState.ts`](src/hooks/useWeekState.ts)
- [`src/App.tsx`](src/App.tsx)
- (Mock seed) [`src/hooks/useWeekState.ts`](src/hooks/useWeekState.ts) mock companion definition

## Implementation todos

- `split-profiles-from-week`: Refactor `useWeekState` to keep `companions` (and optionally `goals`) in stable state outside week reload.
- `narrow-setWeekStart`: Change `setWeekStart` to reload only week-specific data (tasks/groups/weekStart).
- `update-mock-sarah-kelly`: Update seeded mock companion name to `Sarah Kelly`.
- `verify-avatar-sites`: Confirm all `CompanionAvatar` call sites use the global companion name.
