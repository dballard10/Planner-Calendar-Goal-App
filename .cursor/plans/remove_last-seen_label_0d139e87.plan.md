---
name: Remove last-seen label
overview: Remove the companion card "Last seen" UI and its now-unused stats field so the companions grid no longer shows that line.
todos:
  - id: remove-last-seen-jsx
    content: Remove the "Last seen" div from the companion card JSX in `CompanionsPage.tsx`.
    status: completed
  - id: remove-lastInteractionDay-stats
    content: Remove `lastInteractionDay` from `useCompanionStats` output type and calculation in `CompanionsPage.tsx`.
    status: completed
    dependencies:
      - remove-last-seen-jsx
  - id: verify-ts
    content: Verify there are no TypeScript/lint errors in `CompanionsPage.tsx` after removal.
    status: completed
    dependencies:
      - remove-lastInteractionDay-stats
---

# Remove "Last seen" from companion cards

## Goal

- Remove the "Last seen: Fri" line from companion cards (the `<div class="mt-2 text-xs text-slate-500">...`).

## Changes

- Update [`/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/goals/CompanionsPage.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/goals/CompanionsPage.tsx)
  - Delete the JSX block that renders the "Last seen" div:

```tsx
{
  /* Last Interaction */
}
{
  stats?.lastInteractionDay !== null && (
    <div className="mt-2 text-xs text-slate-500">
      Last seen: {DAY_NAMES[stats.lastInteractionDay]}
    </div>
  );
}
```

- Remove the now-unused `lastInteractionDay` field from the per-companion stats type and computation in `useCompanionStats`.

## Scope / Safety

- This text only appears in `CompanionsPage` (repo-wide search finds a single occurrence), so the change is localized to the companion grid cards.

## Implementation todos

- [ ] Remove "Last seen" JSX from the companion card
- [ ] Remove `lastInteractionDay` from `useCompanionStats` stats shape and calculation
- [ ] Ensure TypeScript still compiles cleanly (no unused vars / type mismatches)
