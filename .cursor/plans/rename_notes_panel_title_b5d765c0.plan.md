---
name: Rename Notes panel title
overview: Rename the Notes right-side drawer header to "File Explorer" while keeping the left sidebar tab labeled "Notes", and update the drawer button tooltip/aria labels accordingly.
todos:
  - id: update-notes-panel-title
    content: Change `NotesPage` to pass `title="File Explorer"` into `RightSidePanel` (right-side drawer header).
    status: completed
  - id: update-drawer-button-labels
    content: Update the open-drawer button `title` and `aria-label` in `NotesPage` to match "File Explorer" wording.
    status: completed
    dependencies:
      - update-notes-panel-title
  - id: sanity-check-left-tab
    content: Confirm `LeftSidebar` still labels the left tab as "Notes" and no other labels need adjustment.
    status: completed
    dependencies:
      - update-drawer-button-labels
---

# Rename Notes drawer header to File Explorer

## What is changing

- The right-side panel header text currently comes from the `title` prop passed into `RightSidePanel`.
- In `NotesPage`, that prop is set to `"Notes"`, which is why the panel header renders as Notes.

Current usage (source of the header text):

```162:184:/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/notes/NotesPage.tsx
      {/* Right side drawer */}
      <RightSidePanel
        title="Notes"
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        headerActions={
          <button
            onClick={handleCreateNote}
            className="p-1 text-slate-400 hover:text-slate-100 transition-colors rounded hover:bg-slate-800"
            aria-label="New note"
            title="New note"
          >
            <IconPlus className="w-5 h-5" />
          </button>
        }
      >
        <NotesDrawer
          notes={notes}
          selectedNoteId={selectedNoteId}
          onSelectNote={handleSelectNote}
        />
      </RightSidePanel>
```

The open-drawer button labels to update:

```115:128:/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/notes/NotesPage.tsx
          {/* Open drawer */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`p-2 rounded-md transition-colors ${
              isDrawerOpen
                ? "bg-slate-700 text-slate-100"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
            title="Notes list"
            aria-label="Open notes list"
          >
            <IconLayoutSidebarRight className="w-5 h-5" />
          </button>
```

## Implementation steps

- Update `NotesPage` to pass `title="File Explorer"` to `RightSidePanel`.
- Update the open-drawer button `title`/`aria-label` to reflect the new wording (e.g. `title="File Explorer"`, `aria-label="Open file explorer"`).
- Confirm the left sidebar tab remains labeled `Notes` (it is defined separately in `LeftSidebar` and does not need changes).

## Quick verification

- Open the Notes page.
- Toggle the right-side panel: header should read **File Explorer**.
- Hover the drawer button: tooltip should match the chosen wording.
- Confirm the left sidebar tab label still reads **Notes**.
