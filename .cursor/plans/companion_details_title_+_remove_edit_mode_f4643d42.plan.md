---
name: Companion details title + remove edit mode
overview: Make the right panel header read "Companion details" when viewing a companion, and remove the separate Edit Companion mode in favor of inline edits in the details panel.
todos:
  - id: panel-title-companion-details
    content: Update `panelTitle` in `CompanionsPage.tsx` so details mode shows "Companion details".
    status: completed
  - id: remove-edit-mode
    content: Remove `edit` mode from `CompanionsPage.tsx` (PanelMode, handlers, render branches), keeping inline updates in the details panel.
    status: completed
    dependencies:
      - panel-title-companion-details
  - id: verify-companionspage
    content: Verify TypeScript/lint are clean for `CompanionsPage.tsx` after edits.
    status: completed
    dependencies:
      - remove-edit-mode
---

# Companions: "Companion details" title and remove Edit mode

## Goal

- In the Companions right-side panel, the header should say **"Companion details"** when viewing a companion.
- Remove the separate **Edit Companion** mode/page, keeping only inline editing inside the details panel (name + relationship).

## Key files

- [`/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/goals/CompanionsPage.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/goals/CompanionsPage.tsx)
- (No change needed) [`/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/layout/RightSidePanel.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/layout/RightSidePanel.tsx) (it renders whatever `title` is passed)

## Changes

### 1) Change details-mode panel title

- In `CompanionsPage.tsx`, update `panelTitle` so that:
- `panelMode === "details"` -> `"Companion details"`
- `panelMode === "add"` -> `"Add Companion"` (unchanged)
- Remove `"edit"` title branch entirely (because edit mode will be removed)

### 2) Remove Edit Companion mode and dead code

- In `CompanionsPage.tsx`:
- Remove `PanelMode` value `"edit"`.
- Remove any `formData` population paths that were only used by edit.
- Remove edit-only branches in `handleSave` and in the `RightSidePanel` render condition.
- Ensure the details panel still supports inline updates via `actions.updateCompanion(...)` (name + relationship).

## Done criteria

- Selecting a companion shows the right panel header as **"Companion details"** (not the companion name).
- There is no separate Edit Companion UI/state; editing happens via inline controls in the details panel only.
- TypeScript/lint checks remain clean for the touched files.

## Implementation todos

- [ ] Update `panelTitle` to use "Companion details" for details mode
- [ ] Remove `edit` from `PanelMode` and delete edit-mode-only handlers/branches
- [ ] Verify TypeScript/lint clean for `CompanionsPage.tsx`
