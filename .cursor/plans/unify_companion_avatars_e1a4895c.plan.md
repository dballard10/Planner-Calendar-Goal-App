---
name: Unify companion avatars
overview: Make the small companion avatar shown on TaskCards match the Companions page avatar styling (same look, scaled down) by extracting a shared avatar component and reusing it in both places.
todos:
  - id: add-companion-avatar-component
    content: Add shared `CompanionAvatar` component (initials + color + size variants) in `src/components/ui/CompanionAvatar.tsx`.
    status: in_progress
  - id: use-avatar-in-taskcard
    content: Update `src/components/weekly/task/TaskCard.tsx` to render companions using `CompanionAvatar size="sm"` so it matches the Companions page styling.
    status: pending
    dependencies:
      - add-companion-avatar-component
  - id: use-avatar-in-companions-page
    content: Update `src/components/goals/CompanionsPage.tsx` to render companion avatars using `CompanionAvatar size="lg"` to keep styling consistent.
    status: pending
    dependencies:
      - add-companion-avatar-component
---

# Make TaskCard companion avatar match Companions page

## Goal

- The companion avatar circle shown on a task card should look the same as the avatar circle on the Companions page, just scaled down to the task card size.

## What will change

- Add a small shared UI component that renders a companion avatar (initials + background color) with consistent styling.
- Update the task card companion chip to use that shared component (so it matches the Companions page styling).
- Update the Companions page avatar to use the same shared component (to keep them locked together and prevent drift).

## Files to change

- [`/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/ui/CompanionAvatar.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/ui/CompanionAvatar.tsx) (new)
- [`/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/weekly/task/TaskCard.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/weekly/task/TaskCard.tsx)
- [`/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/goals/CompanionsPage.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/goals/CompanionsPage.tsx)

## Implementation details

- Create `CompanionAvatar` with props:
- `name: string`
- `color?: string`
- `size: "sm" | "lg"` (with Tailwind mappings: `sm` -> `w-5 h-5 text-[9px] font-bold shadow-lg`, `lg` -> `w-14 h-14 text-xl font-bold shadow-lg`)
- Ensure initials come from the shared `getInitials` helper (`src/components/weekly/utils/name.ts`) so task cards and companion cards match.
- In `TaskCard.tsx`, replace the inline avatar `<div className="w-5 h-5 ...">{getInitials(...)}</div>` with `<CompanionAvatar size="sm" ... />`.
- In `CompanionsPage.tsx`, replace the avatar `<div className="w-14 h-14 ...">{getInitials(...)}</div>` with `<CompanionAvatar size="lg" ... />`.

## Validation

- TaskCard companion avatars visually match the Companions page avatar style (same font weight, shadow, rounded circle, initials), while staying small.
- No regressions to colors/initials.
