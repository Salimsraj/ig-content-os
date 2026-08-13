-- Run this in the Supabase SQL editor (or via `supabase db push`) to set up
-- the tables backing modules 3 (Analytics) and 4 (Competitor Tracker).

create table if not exists stats_snapshots (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('instagram', 'youtube')),
  date date not null,
  followers integer,
  views integer,
  likes integer,
  comments integer,
  video_id text,
  created_at timestamptz not null default now()
);

create index if not exists stats_snapshots_platform_date_idx
  on stats_snapshots (platform, date);

create table if not exists competitor_videos (
  id uuid primary key default gen_random_uuid(),
  competitor_handle text not null,
  video_url text not null,
  transcript text,
  likes integer,
  views integer,
  comments integer,
  why_it_worked text,
  tags text[],
  saved_at timestamptz not null default now()
);

create index if not exists competitor_videos_handle_idx
  on competitor_videos (competitor_handle);
