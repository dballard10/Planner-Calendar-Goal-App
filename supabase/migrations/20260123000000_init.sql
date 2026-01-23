-- Example migration: Create a basic tasks table
-- This serves as a template for your own migrations.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  title text not null,
  content text, -- Markdown content
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date date,
  is_archived boolean default false
);

-- Enable RLS (though we won't add complex policies yet)
alter table public.tasks enable row level security;

-- Simple "allow all" policy for development (no auth yet)
-- WARNING: In production, you should restrict this to authenticated users
create policy "Allow all access to tasks for now"
on public.tasks for all
using (true)
with check (true);
