---
name: Fix useClickOutside ref typing
overview: Widen the `useClickOutside` hook’s ref types so it accepts the nullable `.current` shape produced by `useRef(..., null)` in React 19, eliminating the `RefObject<HTMLDivElement | null>` vs `PossibleRef<HTMLElement>` mismatch.
todos:
  - id: update-hook-types
    content: Update `src/components/weekly/shared/useClickOutside.ts` to accept `RefObject<T | null>` and make `useClickOutside` generic over `T extends HTMLElement`.
    status: completed
  - id: verify-typecheck
    content: Run `npm run build` to confirm the type error in `CompanionSelector` is resolved and no new TS errors appear.
    status: completed
    dependencies:
      - update-hook-types
---

# Fix `useClickOutside` ref typing

## Goal

- Fix the TypeScript error in `useClickOutside([companionDropdownRef], ...)` in [`/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/weekly/details/CompanionSelector.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/weekly/details/CompanionSelector.tsx) (lines 44-47).

## What’s happening

- React 19’s `useRef<HTMLDivElement>(null)` is being typed such that the ref becomes `RefObject<HTMLDivElement | null>`.
- The hook currently expects `PossibleRef<HTMLElement>` where `PossibleRef<T> = RefObject<T> | null | undefined`, which rejects `T = HTMLDivElement | null` because `null` is not assignable to `HTMLElement`.

## Implementation

- Update [`/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/weekly/shared/useClickOutside.ts`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/weekly/shared/useClickOutside.ts):
- Make `PossibleRef` include a nullable current via `RefObject<T | null>`.
- Make `useClickOutside` generic (`<T extends HTMLElement>`) so call sites like `useRef<HTMLDivElement>(null)` infer `T = HTMLDivElement` cleanly.
- Keep runtime logic the same.

## Verification

- Run `npm run build` (or `tsc -b`) and confirm the `CompanionSelector` type error is gone.
- Ensure existing call sites (e.g. `GoalMultiSelect`) still typecheck.

## Todos

- [ ] Update `PossibleRef` and `useClickOutside` signature in `useClickOutside.ts`
- [ ] Typecheck via `npm run build` and confirm error resolved
