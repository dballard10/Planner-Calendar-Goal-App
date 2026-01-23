# Supabase Local-First Workflow

This project uses a "Local-First" development approach for Supabase. This means you develop and test schema changes locally before pushing them to your production Supabase project.

## Workflow Overview

1.  **Develop Locally**: Run `npm run supabase:start` to bring up your local database and services.
2.  **Schema Changes**: When you need to change the database (e.g., add a table or column):
    - Run `npm run supabase:migration:new your_migration_name` to create a new migration file in `supabase/migrations/`.
    - Edit the SQL in that file.
    - Run `npm run supabase:reset` to apply the migration and re-seed your local DB.
3.  **App Development**: Run `npm run dev` and use the local API URL/Keys (usually shown by `npm run supabase:status`).
4.  **Promote to Production**:
    - Once your local changes are tested and verified, link your local CLI to your hosted project: `supabase link --project-ref your-prod-project-ref`.
    - Push migrations to production: `supabase db push`.

## Local Service Ports

- **Studio (Database UI)**: [http://localhost:54323](http://localhost:54323)
- **API URL**: [http://127.0.0.1:54321](http://127.0.0.1:54321)
- **Auth URL**: [http://127.0.0.1:54321/auth/v1](http://127.0.0.1:54321/auth/v1)

## Environment Variables

Use `.env.development` for local dev and `.env.production` (or your CI/CD provider's secrets) for production.

### Local `.env.development`
```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key_from_supabase_status
```

### Production `.env.production`
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_prod_anon_key
```

## Tips

- **Seeding**: Edit `supabase/seed.sql` to provide mock data that is automatically loaded whenever you run `npm run supabase:reset`.
- **Types**: Run `npm run supabase:gen:types` to generate TypeScript types from your local schema into `src/types/supabase.ts`.
