---
name: Force CodeMirror dark
overview: Ensure the Notes editor (and any future CodeMirror editors) always render with the dark wrapper theme (no `cm-theme-light`), while keeping the existing custom editor styling and transparent background.
todos:
  - id: add-dark-codemirror-wrapper
    content: Create `src/components/ui/DarkCodeMirror.tsx` that forces `theme="dark"` and disallows passing a `theme` prop.
    status: completed
  - id: use-wrapper-in-notes-editor
    content: Update `LiveMarkdownEditor` to use the new wrapper so Notes always renders with `cm-theme-dark`.
    status: completed
    dependencies:
      - add-dark-codemirror-wrapper
  - id: enforce-wrapper-everywhere
    content: Search for other `@uiw/react-codemirror` usages and switch them to the wrapper (if any).
    status: completed
    dependencies:
      - add-dark-codemirror-wrapper
---

# Force CodeMirror dark mode

## Goal

Make all CodeMirror instances render in **dark mode always**, so we never get `cm-theme-light` in the DOM for notes (or any future editors).

## Key finding

`@uiw/react-codemirror` defaults `theme` to `light`, which directly controls the wrapper class (`cm-theme-${theme}`) and also injects `oneDark` when `theme="dark"`.

## Implementation

- Add a small wrapper component that hard-forces `theme="dark"`.

- New file: [`/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/ui/DarkCodeMirror.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/ui/DarkCodeMirror.tsx)
- It will accept all normal `ReactCodeMirrorProps` **except** `theme`, and always pass `theme="dark"` to the underlying `@uiw/react-codemirror` component.
- This keeps your editor background **transparent** (your existing `livePreviewTheme` already sets background to transparent).

- Switch the notes editor to use the wrapper.

- Update [`/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/notes/LiveMarkdownEditor.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/notes/LiveMarkdownEditor.tsx) to import the wrapper instead of importing directly from `@uiw/react-codemirror`.

- (Optional quick sanity check) Grep for any other `@uiw/react-codemirror` imports and swap them to the wrapper so the rule is enforced consistently.

## Acceptance criteria

- Notes editor DOM no longer shows `cm-theme-light`; it shows `cm-theme-dark`.
- The editor remains styled as it is today (your `livePreviewTheme` still applies), and the background remains transparent/inherits the app background.

## Files to change

- Add: [`/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/ui/DarkCodeMirror.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/ui/DarkCodeMirror.tsx)
- Update: [`/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/notes/LiveMarkdownEditor.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/notes/LiveMarkdownEditor.tsx)
