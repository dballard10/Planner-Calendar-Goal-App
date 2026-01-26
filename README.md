# Planner & Calendar App Monorepo

This project is organized as a monorepo using npm workspaces.

## Structure

- `frontend/`: React + TypeScript + Vite application.
- `backend/`: Python FastAPI server with Supabase configuration.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Supabase** (requires Docker):
   ```bash
   npm run supabase:start
   ```

3. **Configure Backend Env**:
   - Run `npm run supabase:status` to see local keys.
   - Copy the `service_role key` into `backend/.env`.

4. **Start Dev Servers** (frontend + backend together):
   ```bash
   npm run dev
   ```
   This runs both:
   - Frontend at http://localhost:5173
   - Backend API at http://127.0.0.1:8000

   Or run them separately:
   ```bash
   npm run dev:frontend   # frontend only
   npm run dev:backend    # backend only
   ```

5. **Supabase Commands** (from repo root):
   - `npm run supabase:start` - start local Supabase
   - `npm run supabase:stop` - stop local Supabase
   - `npm run supabase:status` - show keys and ports
   - `npm run supabase:reset` - reset DB and apply migrations

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, React Big Calendar.
- **Backend**: Python 3.14, FastAPI, Uvicorn, Supabase Python client.
