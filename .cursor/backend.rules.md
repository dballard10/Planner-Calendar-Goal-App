# Backend Cursor Rules (Python / FastAPI)

## Primary goals
- Make the smallest change that solves the request
- Preserve existing architecture and patterns
- Prefer correctness, security, and observability

## FastAPI conventions
- Use Pydantic models for validation and response schemas
- Use dependency injection (`Depends`) for auth/db/session/context
- Keep route handlers thin; push logic into service modules when it grows
- Avoid blocking operations in async routes (use async clients or run in threadpool)

## Data & persistence
- Prefer parameterized queries / ORM-safe patterns
- Handle transactions explicitly when needed
- Be mindful of pagination for list endpoints
- Validate inputs early; return consistent error shapes

## Supabase-specific (if applicable)
- Never expose service-role keys to the client
- Assume RLS is enabled; write queries accordingly
- Privileged actions should run server-side with service role + strict authorization checks

## Security
- Never log secrets, tokens, or sensitive PII
- Validate auth/authorization for every protected endpoint
- Sanitize/validate user input; avoid dynamic SQL construction
- Prefer least-privilege design for keys and roles

## Error handling & responses
- Use `HTTPException` with clear status codes
- Include actionable error messages (without leaking internals)
- Do not swallow exceptions silently; log with context

## Observability
- Add structured logs around key actions (request id/user id if available)
- Keep log volume reasonable; avoid logging full payloads
- When adding background jobs, include retries/backoff or explain why not

## Code style
- Use type hints for public functions
- Keep modules cohesive; avoid circular imports
- No sweeping refactors or reformatting unrelated code

## Testing
- Suggest tests for new endpoints/business logic
- Do not add or modify tests unless requested

## Output expectations
- Summarize what changed, any new env vars, and how to run/verify
