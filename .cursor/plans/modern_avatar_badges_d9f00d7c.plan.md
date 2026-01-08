---
name: Modern avatar badges
overview: Introduce a shared Avatar/AvatarStack UI component and use it to render goal and companion badges more crisply and consistently in TaskCard, CompanionSelector, and CompanionsPage.
todos:
  - id: add-avatar-components
    content: Create shared `Avatar` + `AvatarStack` components with modern ring/shadow/typography and overflow handling.
    status: completed
  - id: taskcard-swap-to-avatarstack
    content: Refactor `TaskCard` to render goal and companion indicators via `AvatarStack` (remove inline avatar DOM + optionally retire `EmojiCircleStack`).
    status: completed
    dependencies:
      - add-avatar-components
  - id: companionselector-use-avatar
    content: Refactor `CompanionSelector` avatars (dropdown + pills) to use the shared `Avatar` component while preserving existing interactions/layout.
    status: completed
    dependencies:
      - add-avatar-components
  - id: companionspage-use-avatar
    content: Refactor the two large avatars in `CompanionsPage` to use the shared `Avatar` component.
    status: completed
    dependencies:
      - add-avatar-components
  - id: ui-qa
    content: Manually verify TaskCard, CompanionSelector, and CompanionsPage visuals and interactions after refactor.
    status: completed
    dependencies:
      - taskcard-swap-to-avatarstack
      - companionselector-use-avatar
      - companionspage-use-avatar
---

# Modernize goal + companion icons (shared AvatarStack)

## Goals

- Make the **goal emoji circles** and **companion initials circles** look bigger, sharper, and more modern.
- Use **one shared UI component** so the look stays consistent across TaskCard, CompanionSelector, and CompanionsPage.
- Keep the current data model (goals still use `goal.emoji` and `goal.color`, companions use `name` + `color`).

## What we have today (baseline)

- TaskCard goals: `EmojiCircleStack` with `size={20}` and small emoji text.

```235:249:src/components/weekly/task/TaskCard.tsx
                {taskGoals.length > 0 && (
                  <EmojiCircleStack
                    items={taskGoals.map((goal) => ({
                      id: goal.id,
                      emoji: goal.emoji,
                      label: goal.name,
                      style: {
                        backgroundColor: goal.color ?? "#475569",
                      },
                    }))}
                    maxVisible={3}
                    size={20}
                    circleClassName="border border-slate-800 text-[11px] text-white shadow-sm"
                    overflowClassName="border border-slate-800 bg-slate-900/80 text-[10px] text-slate-300"
                  />
                )}
```

- TaskCard companions: inline 20x20 initials circles.

```250:267:src/components/weekly/task/TaskCard.tsx
                {taskCompanions.length > 0 && (
                  <div className="flex items-center -space-x-1.5">
                    {taskCompanions.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className="w-5 h-5 rounded-full border border-slate-800 flex items-center justify-center text-[9px] font-medium text-white shadow-sm"
                        style={{ backgroundColor: c.color || "#64748b" }}
                        title={c.name}
                      >
                        {getInitials(c.name)}
                      </div>
                    ))}
                    {taskCompanions.length > 3 && (
                      <div className="w-5 h-5 rounded-full bg-slate-700 border border-slate-800 flex items-center justify-center text-[8px] text-slate-400 font-medium">
                        +{taskCompanions.length - 3}
                      </div>
                    )}
                  </div>
                )}
```

- CompanionsPage uses larger but separate avatar markup (two places).

## Implementation approach

## 1) Add shared UI primitives

- Add a new `Avatar` component and `AvatarStack` component:
  - **`Avatar`**: renders a circle with a modern ring/outline, subtle shadow, and crisp centered content.
    - Props: `size`, `label` (tooltip/aria), `bgColor`, and `content` (emoji or initials).
    - Styling upgrades (no new deps):
      - Increase default sizes in stacks from 20px -> 22-24px where appropriate.
      - Use `leading-none`, `font-semibold`, and `antialiased` to keep glyphs crisp.
      - Prefer `ring-1 ring-white/10` (or similar) over a heavy border, plus a slightly stronger shadow.
      - Optionally add a subtle inner highlight via an overlay gradient (implemented as an extra inner div).
  - **`AvatarStack`**: renders N avatars with overlap spacing and a `+N` overflow avatar.

Files:

- Create [`src/components/ui/Avatar.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/ui/Avatar.tsx)
- Create [`src/components/ui/AvatarStack.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/ui/AvatarStack.tsx)

## 2) Update TaskCard to use AvatarStack for both goals and companions

- Replace `EmojiCircleStack` usage with `AvatarStack` rendering goal emojis.
- Replace the inline companion avatar row with `AvatarStack` rendering initials.
- Keep current behavior:
  - Max visible = 3, overflow shows `+N`.
  - Tooltip `title` remains goal name / companion name.

Files:

- Update [`src/components/weekly/task/TaskCard.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/weekly/task/TaskCard.tsx)
- (Optional cleanup) If `EmojiCircleStack` becomes unused, remove it or keep it if you want for other future uses:
  - [`src/components/ui/EmojiCircleStack.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/ui/EmojiCircleStack.tsx)

## 3) Update CompanionSelector to reuse Avatar/AvatarStack

- Replace `TASK_COMPANION_AVATAR` and `TASK_COMPANION_PILL_AVATAR` DOM with `Avatar` (keeping pill layout intact).
- Keep the existing dropdown/pill interactions (hover-to-x, etc.); only swap the avatar rendering.

Files:

- Update [`src/components/weekly/details/CompanionSelector.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/weekly/details/CompanionSelector.tsx)
- Potentially simplify avatar-related constants in [`src/components/weekly/styles/taskDetailsStyles.ts`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/weekly/styles/taskDetailsStyles.ts) if they become redundant.

## 4) Update CompanionsPage to use Avatar for the big avatars

- Replace the two large avatar blocks with `Avatar size={56}` / `size={64}` equivalents.
- Keep the typography and layout as-is; only modernize the avatar rendering.

File:

- Update [`src/components/goals/CompanionsPage.tsx`](/Users/dylanballard/Projects/Planner-Calendar-Goal-App/src/components/goals/CompanionsPage.tsx)

## 5) Visual QA

- Verify in UI:
  - TaskCard goal badges and companion badges: bigger, sharper, consistent ring/shadow.
  - CompanionSelector: dropdown rows and pills still align and hover interactions still work.
  - CompanionsPage: big avatars match the new style and still look good at large sizes.

## Notes / Non-goals

- No new emoji rendering dependency (Twemoji/OpenMoji) in this pass.
- No changes to stored markdown/data structures.
