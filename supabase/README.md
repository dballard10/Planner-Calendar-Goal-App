# Supabase Local Development

This folder contains the Supabase configuration, migrations, and seed data for local development.

## Getting Started

1.  **Install Supabase CLI**:
    ```bash
    brew install supabase/tap/supabase
    ```
    (Or see [Supabase CLI docs](https://supabase.com/docs/guides/cli/getting-started) for other platforms)

2.  **Start Local Supabase**:
    Make sure Docker is running, then:
    ```bash
    supabase start
    ```

3.  **View Local Studio**:
    Once started, visit [http://localhost:54323](http://localhost:54323) to manage your local database.

## Useful Commands

- `supabase start`: Start local services.
- `supabase stop`: Stop local services.
- `supabase db reset`: Reset local database and apply migrations + seed data.
- `supabase migration new <name>`: Create a new migration file.
- `supabase status`: View local service status and API keys.

## Connecting from the App

The local API URL and Keys are available via `supabase status`. Use the `anon` key in your `.env.development` file.
