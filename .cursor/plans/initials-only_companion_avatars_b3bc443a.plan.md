---
name: Initials-only companion avatars
overview: Replace companion emoji avatars with Apple-style initials-only monograms by removing the `avatarEmoji` field from the companion model, UI, and mock data, and ensuring all companion avatar circles render initials derived from the name.
todos:
  - id: remove-companion-emoji-type
    content: Remove `avatarEmoji` from `Companion` type and adjust any dependent types/partials.
    status: completed
  - id: update-weekstate-companions
    content: Remove mock `avatarEmoji` values and update `addCompanion` to no longer accept/store an emoji avatar.
    status: completed
    dependencies:
      - remove-companion-emoji-type
  - id: update-companions-page-ui
    content: Update `CompanionsPage` to always render initials, remove Emoji Avatar form field, and align action signatures.
    status: completed
    dependencies:
      - update-weekstate-companions
  - id: update-settings-label
    content: Remove `avatarEmoji` from Settings companion labels.
    status: completed
    dependencies:
      - remove-companion-emoji-type
---

# Initials-only companion avatars (no emojis)

## Goal

- Remove companion emoji avatars entirely and render companion avatar circles as **initials-only** (e.g. `Sarah Domingo` -> `SD`, `Sarah Marie Domingo` -> `SM`).

## Key decisions (confirmed)

- **Initials rule**: first letters of the first two words (existing `getInitials()` behavior).
- **Scope**: remove companion `avatarEmoji` everywhere (types, state/actions, UI, mock data).

## Implementation steps

- Update the companion data model:

- Remove `avatarEmoji?: string` from `Companion` in [`/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/types/weekly.ts`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/types/weekly.ts).

- Remove emoji avatar from mock data and state actions:

- In [`/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/hooks/useWeekState.ts`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/hooks/useWeekState.ts):

- Delete `avatarEmoji` from the mock companions.
- Change `addCompanion(name, relationship, avatarEmoji?, description?)` to `addCompanion(name, relationship, description?)`.
- Stop writing `avatarEmoji` into newly created companions.

- Update the companions UI to be initials-only:

- In [`/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/goals/CompanionsPage.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/goals/CompanionsPage.tsx):

- Remove the local `getInitials()` helper and import `getInitials` from [`/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/weekly/utils/name.ts`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/weekly/utils/name.ts).
- Replace `companion.avatarEmoji || getInitials(companion.name)` with `getInitials(companion.name)` in the card grid and details panel.
- Remove the "Emoji Avatar" input from the add/edit form and remove `avatarEmoji` from `formData` initialization and save/update payloads.
- Update the `actions.addCompanion` prop type to match the new signature.

- Remove emoji mentions from Settings:
- In [`/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/settings/SettingsPage.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/settings/SettingsPage.tsx):
- Change the companion color row label from `${companion.avatarEmoji ?? ""} ${companion.name}` to just the name (or optionally `getInitials(name)` + name if desired).

## Validation

- Build/typecheck passes (no remaining `avatarEmoji` references).
- Companions page cards and the right-side details header show initials only.
- Adding/editing a companion no longer offers or stores an emoji avatar.

## Notes

- Goal emojis remain unchanged; this plan only removes emojis from **companion avatars**.
