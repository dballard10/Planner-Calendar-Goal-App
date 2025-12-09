# Markdown Language Guide

This document defines how Markdown is used across the Planner & Calendar app.

The goal is to:

- Store all core content (weeks, goals, notes, statistics) as Markdown.
- Keep files human-readable and Obsidian-friendly.
- Make it easy for the app to parse and render content consistently.

---

## 1. Global Conventions

1. Each file must have exactly one top-level `#` heading.
2. Use `##` and `###` for sections and subsections.
3. Tasks should be written as GitHub-style checklists:
   - `- [ ]` for open
   - `- [x]` for completed
   - `- [>]` for moved
   - `- [-]` for cancelled
   - `- [?]` for blocked or unclear
4. Use fenced code blocks for examples and code snippets:
   - ```ts
     const example = "markdown-aware";
     ```
5. Prefer plain ASCII characters. No emoji, no decorative unicode.

---

## 2. File Types and Naming

We use the following main Markdown file types:

- `Calendar.md`  
  Overview of weeks and links to weekly files.

- `Weekly Todo-List.md`  
  High-level description of the weekly planning system (can be more like documentation).

- `Goals.md`  
  Long-term and medium-term goals, organized by year and quarter.

- `Statistics.md`  
  Habit and stats tracking, usually in tables or summarized counts.

- Weekly instance files:  
  `YYYY-MM-DD to YYYY-MM-DD.md`  
  Example: `2025-11-30 to 2025-12-06.md`

### 2.1 Weekly File Name

Weekly files are named:

- `<week_start> to <week_end>.md`
- Dates use ISO format: `YYYY-MM-DD`.

Example:

- `2025-11-30 to 2025-12-06.md`

---

## 3. Weekly File Structure

A weekly file represents one planning week.

### 3.1 Required Structure

A weekly file must follow this general layout:

```markdown
# Week of 2025-11-30

## Meta

- Week start: 2025-11-30
- Week end: 2025-12-06
- Theme: Deep focus and consistency
- Priority: High

## Weekly Overview

- [ ] Ship Planner app weekly view
- [ ] Get 4 gym sessions
- [ ] One social event
- [ ] One deep work session for job search

## Focus Areas

- Work:
  - [ ] Ship X
  - [ ] Prepare Y
- Personal:
  - [ ] Gym 4x
  - [ ] Guitar 2x
- Long-term:
  - [ ] Job search project
  - [ ] Side project milestone

## Days

### Sunday 11/30

- [ ] Gym – chest day
- [x] Record guitar video
- [>] Move "Smoke cigar" from Saturday
- [-] Cancel: Brunch plans

Notes:

- Short note about the day if needed.

### Monday 12/01

- [ ] Morning deep work: Planner app
- [ ] Work: handle OCR tickets
- [ ] Evening: martial arts class

### Tuesday 12/02

- [ ] ...
```
