# Frontend Cursor Rules (React / TypeScript)

## Primary goals
- Make the smallest change that solves the request
- Preserve existing patterns and component structure
- Prefer clarity and maintainability over cleverness

## TypeScript
- Use strict typing; avoid `any` and `as unknown as`
- Prefer explicit types for function params/returns when non-trivial
- Use discriminated unions for complex UI states

## React
- Prefer functional components + hooks
- Keep components focused (ideally <200 lines); extract helpers/components when needed
- Avoid unnecessary state; derive values from props/query results when possible
- Use `useMemo`/`useCallback` only when there’s a clear reason (perf or referential stability)
- Handle loading/error/empty states explicitly

## Data fetching & state
- Keep data-fetching logic close to where it’s used unless there’s reuse
- Do not introduce new global state libraries unless explicitly requested
- When modifying API calls, update types and ensure error handling remains correct

## UI & styling
- Follow the existing styling approach in the repo (Tailwind/CSS Modules/etc.)
- Do not restyle unrelated components
- Prefer accessible HTML (buttons for actions, labels for inputs, aria-* when needed)
- Keyboard navigation should work for interactive elements

## Code quality
- Avoid large refactors unless asked
- No formatting-only changes across unrelated files
- Add small helper utilities only when reused or clearly beneficial

## Testing
- If you add non-trivial logic, suggest where tests should go
- Do not add or change tests unless requested

## Output expectations
- Provide a short explanation of what changed and why
- If there are tradeoffs, call them out briefly
