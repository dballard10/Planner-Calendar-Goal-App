-- Seed data for local development
-- This will be applied when you run `supabase db reset`

insert into public.tasks (title, content, status, due_date)
values
  ('Welcome to the Planner App!', 'This is a sample task to get you started.', 'pending', current_date),
  ('Explore the Calendar View', 'Check out how your tasks look on the big calendar.', 'in_progress', current_date + interval '2 days'),
  ('Build amazing things', 'Keep track of your goals and notes here.', 'pending', current_date + interval '7 days');
