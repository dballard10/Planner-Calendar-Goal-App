---
name: RightPanel_FileSearchTab
overview: Move Notes search into its own tab inside the right-side panel, leaving the Explorer tab focused on the folder tree. Keep the search query persistent across tab switches, and set the panel title dynamically based on the active tab.
todos:
  - id: add-rightpanel-subheader
    content: Add optional `subHeader` slot to `RightSidePanel` and render it between header and scrollable content.
    status: completed
  - id: refactor-notesdrawer-tree-only
    content: Refactor `NotesDrawer` to remove search UI/state; accept already-filtered notes and support optional auto-expand-all for search mode.
    status: completed
    dependencies:
      - add-rightpanel-subheader
  - id: notespage-rightpanel-tabs
    content: Add right panel tabs + search state in `NotesPage`; render File Explorer vs File Search content; set dynamic title.
    status: completed
    dependencies:
      - refactor-notesdrawer-tree-only
---

# Add File Search tab to right panel

## Goal

- Turn the current in-panel search input into a **second tab** in the right-side panel.
- Tabs in the right panel:
  - **File Explorer** (tree only)
  - **File Search** (search input + filtered results)
- **Persist** the search query when switching tabs.
- Panel header title should be **dynamic**: matches active tab ("File Explorer" / "File Search").

## Key repo facts (current state)

- `RightSidePanel` has a fixed header and a single scrollable content region.
- The search input currently lives inside `NotesDrawer`:

```223:245:src/components/notes/NotesDrawer.tsx
  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="relative mb-4">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 text-sm placeholder-slate-500 outline-none focus:border-slate-600 transition-colors"
        />
      </div>

      {/* Tree list */}
      <div className="flex-1 overflow-y-auto -mx-2 px-2">
        {tree.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            {searchQuery ? "No notes match your search" : "No notes yet"}
          </div>
        ) : (
          renderTree(tree)
        )}
      </div>
    </div>
  );
```

## Implementation approach

### 1) Add a small “sub-header” slot to `RightSidePanel`

- Update [`src/components/layout/RightSidePanel.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/layout/RightSidePanel.tsx) to accept an optional prop (e.g. `subHeader?: React.ReactNode`).
- Render it **between** the existing header and the scrollable content, so the tab bar stays fixed while content scrolls.

### 2) Refactor `NotesDrawer` into a tree-only component

- Update [`src/components/notes/NotesDrawer.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/notes/NotesDrawer.tsx):
  - Remove the search input UI.
  - Remove internal `searchQuery` state and filtering.
  - Keep tree building + folder expand/collapse behavior.
  - Add an optional prop like `autoExpandAllFolders?: boolean` (or `searchQuery?: string`) so the parent can request “expand all” in search mode.

### 3) Implement the two tabs in `NotesPage`

- Update [`src/components/notes/NotesPage.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/notes/NotesPage.tsx):
  - Add state:
    - `activeRightTab: "explorer" | "search"` (default: `"explorer"`).
    - `searchQuery: string` (persists across tab switches).
  - Compute `filteredNotes` in `NotesPage` when in search mode.
  - Pass a tab bar element into `RightSidePanel.subHeader` with two buttons:
    - **File Explorer**
    - **File Search**
  - Set `RightSidePanel.title` dynamically:
    - `activeRightTab === "explorer" ? "File Explorer" : "File Search"`
  - In panel body:
    - Explorer tab: render `NotesDrawer` with **all** notes.
    - Search tab: render search input + render `NotesDrawer` with `filteredNotes` and `autoExpandAllFolders` enabled.

## Non-goals

- No global app-level tab system changes.
- No persistence to disk; search state only persists while `NotesPage` is mounted.

## Acceptance checks

- Opening the right panel shows a tab bar with **File Explorer** and **File Search**.
- File Explorer tab shows the tree **without** a search input.
- File Search tab shows the search input and filtered results.
- Switching tabs does **not** clear the query.
- Panel title updates to match the active tab.
