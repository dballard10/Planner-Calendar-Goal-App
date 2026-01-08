---
name: Settings page + colors
overview: Add a new Settings page/tab that lets you edit event subtype colors, bulk-overwrite goal and companion colors, and control whether the app attempts to use browser geolocation (default ON). Settings persistence will be in-memory only for now.
todos:
  - id: settings-context
    content: Add in-memory AppSettings context (itemTypeColors + locationEnabled default true) and wrap the app with the provider.
    status: completed
  - id: settings-nav
    content: Add Settings tab to LeftSidebar and route it in App.tsx.
    status: completed
  - id: settings-page
    content: "Create SettingsPage UI: event subtype color pickers, goal color pickers (overwrite), companion color pickers (overwrite), location toggle."
    status: completed
  - id: dynamic-type-colors
    content: Apply dynamic item type colors across weekly cards, task details type selector, BigCalendar, and YearCalendarGrid; update eventAdapters as needed.
    status: completed
  - id: location-gate
    content: Wire locationEnabled into TaskDetailsForm so geolocation is requested only when enabled (default ON).
    status: completed
---

# Add Settings page (colors + location)

## Goals

- Add a new `Settings` page reachable from the left sidebar.
- Allow editing background colors for weekly/calendar item subtypes (`task`, `event`, `birthday`, `holiday`) and apply them across:
- weekly task cards
- task details type selector buttons
- calendar event blocks (Big Calendar)
- year grid dot indicators
- Allow bulk-overwriting **existing** goal colors and companion colors from Settings.
- Add a setting for allowing location access, with **default ON**, and wire it to gate geolocation requests.
- Keep all Settings persistence **in-memory only** (resets on refresh).

## Key observations from the current code

- Navigation is tab-based state in [`src/App.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/App.tsx) and sidebar tabs live in [`src/components/layout/LeftSidebar.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/layout/LeftSidebar.tsx).
- Item type colors are currently baked into [`src/lib/itemTypeConfig.ts`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/lib/itemTypeConfig.ts) and also into the weekly gradient map in [`src/components/weekly/styles/taskCardStyles.ts`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/weekly/styles/taskCardStyles.ts).
- Geolocation is requested on focus in [`src/components/weekly/details/TaskDetailsForm.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/weekly/details/TaskDetailsForm.tsx) via `requestGeolocation()`.

## Approach

### 1) Add an in-memory settings store (React context)

- Create a small context (new file) to hold:
- `itemTypeColors: Record<WeeklyItemType, string>` (hex)
- `locationEnabled: boolean` (default `true`)
- Expose `useAppSettings()` and `useSetAppSettings()` hooks.
- Wrap the app content so any component can read settings without prop drilling.

Files:

- Add [`src/context/AppSettingsContext.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/context/AppSettingsContext.tsx) (new)
- Update [`src/main.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/main.tsx) or [`src/App.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/App.tsx) to include the provider (whichever is cleaner).

### 2) Make item type styling dynamic based on settings

- Add a helper (new file) that merges base `ITEM_TYPE_STYLES` with the in-memory overrides.
- Replace direct uses of `ITEM_TYPE_STYLES[type].colorHex `with `getItemTypeStyle(type, settings)`.
- Update weekly task card backgrounds to derive their gradient from the selected hex (inline `style` gradient), rather than relying on the fixed `TASK_TYPE_GRADIENTS_TO_SLATE` mapping.

Files to update:

- [`src/components/weekly/task/TaskCard.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/weekly/task/TaskCard.tsx)
- [`src/components/weekly/details/TaskDetailsContent.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/weekly/details/TaskDetailsContent.tsx)
- [`src/components/calendar/BigCalendarShell.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/calendar/BigCalendarShell.tsx)
- [`src/components/calendar/YearCalendarGrid.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/calendar/YearCalendarGrid.tsx)
- [`src/lib/calendar/eventAdapters.ts`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/lib/calendar/eventAdapters.ts) (either stop setting `event.color`, or set it using settings)
- [`src/components/weekly/styles/taskCardStyles.ts`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/weekly/styles/taskCardStyles.ts) (either remove fixed gradients or keep as fallback)

### 3) Add Settings page UI

- Add a new page component that renders:
- **Event subtype colors**: 4 color pickers (task/event/birthday/holiday)
- **Goals**: list current goals with per-goal color picker; changing it calls `actions.updateGoal(goalId, { color })`
- **Companions**: list current companions with per-companion color picker; changing it calls `actions.updateCompanion(compId, { color })`
- **Location**: toggle `locationEnabled` (default ON)

Files:

- Add [`src/components/settings/SettingsPage.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/settings/SettingsPage.tsx) (new)
- Update [`src/App.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/App.tsx) to add `activeTab === "settings"` and pass `weekState/actions` into `SettingsPage`
- Update [`src/components/layout/LeftSidebar.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/layout/LeftSidebar.tsx) to add a Settings tab (and icon)

### 4) Wire Location setting into the existing location flow

- In [`src/components/weekly/details/TaskDetailsForm.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/weekly/details/TaskDetailsForm.tsx), only call `requestGeolocation()` if `locationEnabled` is true.
- If `locationEnabled` is false:
- do not request location
- still allow searching places, but without location bias (lat/lng undefined)

## Notes / non-goals

- No persistence (localStorage, database, markdown serialization) yet.
- No attempt to design a final settings schema; keep it small and easy to replace later.
