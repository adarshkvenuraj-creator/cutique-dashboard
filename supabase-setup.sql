-- =========================================================
-- CUTIQUE DASHBOARD — SUPABASE SETUP SCRIPT
-- =========================================================
-- How to use:
-- 1. Open your Supabase project
-- 2. Go to "SQL Editor" in the left sidebar
-- 3. Click "New query", paste this whole file in, click "Run"
-- That's it — your tables are created.
-- =========================================================

create table if not exists calendar_entries (
  id text primary key,
  week_key text not null,
  day int not null,
  title text not null,
  category text not null,
  done boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists ranking_logs (
  id text primary key,
  date date not null,
  keyword text not null,
  rank int,
  review_count int,
  avg_rating numeric,
  created_at timestamp with time zone default now()
);

create table if not exists competitors (
  id text primary key,
  name text not null,
  area text,
  rating numeric,
  review_count int,
  phone text,
  history jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

-- Allow the dashboard (using the public "anon" key) to read/write.
-- Since this app uses a private link with no login, anyone with the
-- link can read/write — same trust model as the previous version.

alter table calendar_entries enable row level security;
alter table ranking_logs enable row level security;
alter table competitors enable row level security;

create policy "allow all calendar" on calendar_entries for all using (true) with check (true);
create policy "allow all ranking" on ranking_logs for all using (true) with check (true);
create policy "allow all competitors" on competitors for all using (true) with check (true);
