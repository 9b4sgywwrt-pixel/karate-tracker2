begin;

create table public.training_sessions (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  training_date date not null,
  start_time text,
  end_time text,
  martial_art text not null check (martial_art in ('Karate','BJJ','Kobudo')),
  duration_minutes integer not null check (duration_minutes > 0),
  notes text,
  scheduled_occurrence_id text,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  primary key (user_id,id),
  unique (user_id,scheduled_occurrence_id)
);
create table public.training_session_focuses (
  user_id uuid not null,
  session_id text not null,
  focus text not null,
  role text not null check (role in ('primary','additional')),
  position integer not null default 0,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  primary key (user_id,session_id,focus),
  foreign key (user_id,session_id) references public.training_sessions(user_id,id) on delete cascade
);
create table public.weekly_schedules (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  martial_art text not null check (martial_art in ('Karate','BJJ','Kobudo')),
  start_time text not null,
  end_time text,
  expected_duration_minutes integer not null check (expected_duration_minutes > 0),
  location text,
  notes text,
  starts_on date not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  primary key (user_id,id)
);
create table public.schedule_occurrences (
  id text not null,
  user_id uuid not null,
  schedule_id text not null,
  occurrence_date date not null,
  status text not null check (status in ('skipped','completed')),
  completed_session_id text,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  primary key (user_id,id),
  foreign key (user_id,schedule_id) references public.weekly_schedules(user_id,id) on delete cascade,
  foreign key (user_id,completed_session_id) references public.training_sessions(user_id,id) on delete set null
);
create table public.calendar_events (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('Planned training','Grading','Seminar','Other')),
  title text not null,
  event_date date not null,
  start_time text,
  end_time text,
  martial_art text check (martial_art is null or martial_art in ('Karate','BJJ','Kobudo')),
  location text,
  notes text,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz,
  primary key (user_id,id)
);
create table public.app_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index training_sessions_user_updated on public.training_sessions(user_id,updated_at);
create index weekly_schedules_user_updated on public.weekly_schedules(user_id,updated_at);
create index schedule_occurrences_user_updated on public.schedule_occurrences(user_id,updated_at);
create index calendar_events_user_updated on public.calendar_events(user_id,updated_at);

alter table public.training_sessions enable row level security;
alter table public.training_session_focuses enable row level security;
alter table public.weekly_schedules enable row level security;
alter table public.schedule_occurrences enable row level security;
alter table public.calendar_events enable row level security;
alter table public.app_preferences enable row level security;

create policy "own training sessions" on public.training_sessions for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "own session focuses" on public.training_session_focuses for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "own weekly schedules" on public.weekly_schedules for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "own schedule occurrences" on public.schedule_occurrences for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "own calendar events" on public.calendar_events for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "own app preferences" on public.app_preferences for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

revoke all on public.training_sessions,public.training_session_focuses,public.weekly_schedules,public.schedule_occurrences,public.calendar_events,public.app_preferences from anon;
grant select,insert,update,delete on public.training_sessions,public.training_session_focuses,public.weekly_schedules,public.schedule_occurrences,public.calendar_events,public.app_preferences to authenticated;
commit;
