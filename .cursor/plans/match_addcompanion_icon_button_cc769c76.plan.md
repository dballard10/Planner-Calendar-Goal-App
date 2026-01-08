---
name: Match AddCompanion icon button
overview: Update the Companions page header “Add companion” icon button to reuse the same Tailwind classes and icon sizing as the Weekly tab’s folder icon (`PanelToggle`) for consistent UI.
todos:
  - id: update-companions-header-button
    content: Change the Companions page header add button to use the same Tailwind classes and icon sizing as `PanelToggle`, and add aria/title attributes.
    status: completed
---

# Match Add Companion button to PanelToggle UI

## Goal

Make the **Companions page header** “Add companion” button look and feel identical to the Weekly tab’s folder icon button (`PanelToggle`): same padding, rounded corners, hover colors, and icon sizing.

## What I found

- The Weekly folder icon button is rendered by `PanelToggle` and uses these classes:

```21:34:/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/layout/PanelToggle.tsx
    <button
      onClick={onClick}
      className={`p-2 rounded-md transition-colors ${
        isOpen
          ? "bg-slate-700 text-slate-100"
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      } ${className}`}
      aria-label={label}
      aria-expanded={isOpen}
      title={label}
    >
      <Icon className="w-5 h-5" />
    </button>
```

- The Companions page header “Add companion” button currently uses larger padding, different hover colors, and a smaller icon:

```187:199:/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/goals/CompanionsPage.tsx
      <PageHeader
        title="Companions"
        rightContent={
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-2 py-2 hover:bg-slate-700 hover:text-white text-slate-400 text-md font-medium rounded-lg transition-colors"
          >
            <IconUserPlus className="w-4 h-4" />
          </button>
        }
      />
```

## Implementation plan

- Update the header button in [`src/components/goals/CompanionsPage.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/goals/CompanionsPage.tsx):
  - Replace its `className` with the **closed-state** `PanelToggle` classes: `p-2 rounded-md transition-colors text-slate-400 hover:bg-slate-800 hover:text-slate-200`.
  - Change the icon size to `w-5 h-5` to match `PanelToggle`.
  - Add `aria-label="Add companion"` and `title="Add companion"` for parity and accessibility.

## Notes / future-proofing (optional)

If you want this pattern reused elsewhere later, we can extract a small shared `IconButton` component, but for this request we’ll keep it minimal and change only the one header button.

## Todos

- [ ] Update the Companions header add button classes and icon size to match `PanelToggle`
- [ ] Add `aria-label` and `title` to the button for accessibility
