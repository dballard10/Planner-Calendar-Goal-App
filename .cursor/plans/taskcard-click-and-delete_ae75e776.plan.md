---
name: taskcard-click-and-delete
overview: Make TaskCard clickable to open the details side panel, and replace the three-dots menu with a hover-only trash icon that deletes the task.
todos:
  - id: adjust-title-wrapper-width
    content: Move the click handler from the wide title container to a tight inline wrapper around the markdown text so the editable region only spans the title.
    status: completed
  - id: reconfirm-card-click-vs-title-click
    content: Re-test that background card clicks open the details side panel while title clicks only enter edit mode, with no conflicting click zones.
    status: completed
    dependencies:
      - adjust-title-wrapper-width
---

# Refine TaskCard click, hover, and width behavior

## Goals

- Keep the card background as the click target for opening the details side panel (non-title areas).
- Make the title behave independently:
- Hovering slightly scales the title text.
- Single-clicking the title enters inline edit mode instead of opening details.
- The clickable/editable title area should only be as wide as the title text itself (not stretching across the row).
- Keep the simplified hover-only trashcan delete behavior that replaces the old three-dots menu.

## Steps

### 1. Confirm current `TaskCard` baseline

- Review [`src/components/weekly/TaskCard.tsx`](src/components/weekly/TaskCard.tsx) to confirm it already:
- Uses a card-level `onClick` / `onKeyDown` to open the details side panel.
- Has a `StatusSelector`, title display block, and hover-only trash icon.
- Uses `isEditing` / `editTitle` state for inline editing.

### 2. Keep title hover scale and single-click edit

- Ensure the non-editing title still:
- Wraps the markdown text in a small inner element with `transition-transform`, `origin-left`, and `hover:scale-105` for subtle hover scaling.
- Uses an `onClick` handler that stops propagation (`event.stopPropagation()`) and sets `isEditing` to `true`.
- Keep the existing input behavior for `isEditing` (blur/Enter saves, Escape cancels).

### 3. Shrink the clickable title width to match the text

- Change the structure of the title area so that:
- The outer layout container (which holds padding and flex spacing) no longer has the `onClick` handler.
- The `onClick` is moved to a tight `inline-block`/`inline-flex` wrapper around the markdown text.
- That inner wrapper does **not** use `flex-1`/`w-full`, so its width naturally matches the rendered title text.
- This ensures:
- Clicking just to the right/left of the title (inside the row but outside the title wrapper) does **not** trigger edit mode.
- Those non-title areas can remain reserved for the card-level click that opens the details side panel.

### 4. Confirm card-level click zones

- Verify that the root card element still:
- Has `role="button"`, `tabIndex={0}`, `onClick`, and `onKeyDown` wired to `onOpenDetailsSidePanel` when not editing.
- Opens the details side panel when the user clicks on card background areas (padding, gaps between controls), not on the title or other controls.
- Ensure `StatusSelector` and the trash icon continue to stop propagation so they do not trigger the card-level handler.

### 5. Verify interactions and cleanup

- Manually verify:
- Hovering the title only scales the text; the clickable region hugs the text.
- Single-clicking the title enters inline edit mode and does not open the details side panel.
- Single-clicking card areas outside the title still opens the details side panel.
- Trash hover/delete and status selector behavior remain unchanged.
- Run TypeScript/lint checks for `TaskCard.tsx` and adjust classes/handlers if needed.