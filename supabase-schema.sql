-- Run this in your Supabase SQL Editor

-- Extensions (needed for gen_random_uuid)
create extension if not exists pgcrypto;

-- Profiles table (mirrors auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role text not null default 'student' check (role in ('student', 'tutor', 'admin')),
  created_at timestamptz not null default now()
);

-- Test attempts
create table if not exists public.test_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  test_id text not null default 'practice_test_11',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  current_section text not null default 'rw_m1',
  module_time_remaining jsonb not null default '{"rw_m1":1920,"rw_m2":1920,"math_m1":2100,"math_m2":2100}',
  answers jsonb not null default '{}',
  scores jsonb,
  weak_topics jsonb,
  study_plan text
);

-- Post-test scores
create table if not exists public.post_scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  attempt_id uuid references public.test_attempts(id) on delete set null,
  post_score integer check (post_score between 400 and 1600),
  post_rw integer check (post_rw between 200 and 800),
  post_math integer check (post_math between 200 and 800),
  recorded_at timestamptz not null default now()
);

-- Study progress (per chapter)
create table if not exists public.studied_topics (
  user_id uuid references public.profiles(id) on delete cascade not null,
  chapter_id text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, chapter_id)
);

-- Answer keys for additional tests (admin-managed)
create table if not exists public.test_answer_keys (
  test_id text primary key,
  answer_key jsonb not null,
  updated_at timestamptz not null default now()
);

-- Mistake notebook (auto-saved missed questions + your explanation)
create table if not exists public.mistakes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  test_id text not null,
  attempt_id uuid references public.test_attempts(id) on delete set null,
  section text not null,
  q_num integer not null,
  given text,
  correct text,
  chapter_id text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Spaced repetition queue (per missed question key)
create table if not exists public.review_items (
  user_id uuid references public.profiles(id) on delete cascade not null,
  item_key text not null,
  due_at timestamptz not null default now(),
  interval_days integer not null default 0,
  ease real not null default 2.4,
  reps integer not null default 0,
  lapses integer not null default 0,
  last_reviewed_at timestamptz,
  last_correct boolean,
  primary key (user_id, item_key)
);

-- Migrations (safe to run repeatedly)
alter table public.test_attempts add column if not exists is_sandbox boolean not null default false;
alter table public.post_scores add column if not exists is_sandbox boolean not null default false;
alter table public.studied_topics add column if not exists practice jsonb not null default '{}';
alter table public.profiles add column if not exists affiliation text;

-- Helpful indexes for scale
create index if not exists idx_test_attempts_user_started on public.test_attempts(user_id, started_at desc);
create index if not exists idx_test_attempts_completed_at on public.test_attempts(completed_at);
create index if not exists idx_test_attempts_sandbox on public.test_attempts(is_sandbox);
create index if not exists idx_post_scores_user_recorded on public.post_scores(user_id, recorded_at desc);
create index if not exists idx_post_scores_attempt_id on public.post_scores(attempt_id);
create index if not exists idx_post_scores_sandbox on public.post_scores(is_sandbox);
create index if not exists idx_studied_topics_user_completed on public.studied_topics(user_id, completed);
create index if not exists idx_mistakes_user_created on public.mistakes(user_id, created_at desc);
create index if not exists idx_review_items_user_due on public.review_items(user_id, due_at);

-- Enable RLS (required for policies to take effect)
alter table public.profiles enable row level security;
alter table public.test_attempts enable row level security;
alter table public.post_scores enable row level security;
alter table public.studied_topics enable row level security;
alter table public.test_answer_keys enable row level security;
alter table public.mistakes enable row level security;
alter table public.review_items enable row level security;

-- Role helper (admin only) — SECURITY DEFINER to bypass RLS and avoid infinite recursion
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and lower(email) = 'agora@admin.edu'
  );
$$;

-- Reset helpers (security definer so the admin can truly clear data even if RLS changes)
create or replace function public.reset_my_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.post_scores where user_id = auth.uid();
  delete from public.test_attempts where user_id = auth.uid();
  delete from public.studied_topics where user_id = auth.uid();
  delete from public.mistakes where user_id = auth.uid();
  delete from public.review_items where user_id = auth.uid();
end;
$$;

create or replace function public.admin_reset_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  delete from public.post_scores where user_id = target_user_id;
  delete from public.test_attempts where user_id = target_user_id;
  delete from public.studied_topics where user_id = target_user_id;
  delete from public.mistakes where user_id = target_user_id;
  delete from public.review_items where user_id = target_user_id;
end;
$$;

grant execute on function public.reset_my_data() to authenticated;
grant execute on function public.admin_reset_user(uuid) to authenticated;

-- RLS Policies (drop/recreate safe)
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admins see all profiles" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Admins see all profiles" on public.profiles for select using (public.is_admin());

-- Users can update their own affiliation only (prevents role escalation).
-- The WITH CHECK ensures they cannot change their own role or email.
drop policy if exists "Users can update own affiliation" on public.profiles;
create policy "Users can update own affiliation" on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can view own attempts" on public.test_attempts;
drop policy if exists "Users can insert own attempts" on public.test_attempts;
drop policy if exists "Users can update own attempts" on public.test_attempts;
drop policy if exists "Users can delete own sandbox attempts" on public.test_attempts;
drop policy if exists "Admins can delete any attempts" on public.test_attempts;
drop policy if exists "Admins see all attempts" on public.test_attempts;
drop policy if exists "Admins can insert attempts" on public.test_attempts;
drop policy if exists "Admins can update attempts" on public.test_attempts;
create policy "Users can view own attempts" on public.test_attempts for select using (auth.uid() = user_id);
create policy "Users can insert own attempts" on public.test_attempts for insert with check (auth.uid() = user_id);
create policy "Users can update own attempts" on public.test_attempts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own sandbox attempts" on public.test_attempts for delete using (auth.uid() = user_id and is_sandbox = true);
create policy "Admins can delete any attempts" on public.test_attempts for delete using (public.is_admin());
create policy "Admins see all attempts" on public.test_attempts for select using (public.is_admin());
create policy "Admins can insert attempts" on public.test_attempts for insert with check (public.is_admin());
create policy "Admins can update attempts" on public.test_attempts for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users can view own scores" on public.post_scores;
drop policy if exists "Users can insert own scores" on public.post_scores;
drop policy if exists "Users can delete own sandbox scores" on public.post_scores;
drop policy if exists "Admins can delete any scores" on public.post_scores;
drop policy if exists "Admins see all scores" on public.post_scores;
drop policy if exists "Admins can insert scores" on public.post_scores;
drop policy if exists "Admins can update scores" on public.post_scores;
create policy "Users can view own scores" on public.post_scores for select using (auth.uid() = user_id);
create policy "Users can insert own scores" on public.post_scores for insert with check (auth.uid() = user_id);
create policy "Users can delete own sandbox scores" on public.post_scores for delete using (auth.uid() = user_id and is_sandbox = true);
create policy "Admins can delete any scores" on public.post_scores for delete using (public.is_admin());
create policy "Admins see all scores" on public.post_scores for select using (public.is_admin());
create policy "Admins can insert scores" on public.post_scores for insert with check (public.is_admin());
create policy "Admins can update scores" on public.post_scores for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users can view own studied topics" on public.studied_topics;
drop policy if exists "Users can upsert own studied topics" on public.studied_topics;
drop policy if exists "Users can update own studied topics" on public.studied_topics;
drop policy if exists "Admins can clear own studied topics" on public.studied_topics;
drop policy if exists "Admins can delete any studied topics" on public.studied_topics;
drop policy if exists "Admins see all studied topics" on public.studied_topics;
create policy "Users can view own studied topics" on public.studied_topics for select using (auth.uid() = user_id);
create policy "Users can upsert own studied topics" on public.studied_topics for insert with check (auth.uid() = user_id);
create policy "Users can update own studied topics" on public.studied_topics for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admins can clear own studied topics" on public.studied_topics for delete using (auth.uid() = user_id and public.is_admin());
create policy "Admins can delete any studied topics" on public.studied_topics for delete using (public.is_admin());
create policy "Admins see all studied topics" on public.studied_topics for select using (public.is_admin());

drop policy if exists "Users can view test answer keys" on public.test_answer_keys;
drop policy if exists "Admins can upsert test answer keys" on public.test_answer_keys;
drop policy if exists "Admins can update test answer keys" on public.test_answer_keys;
create policy "Users can view test answer keys" on public.test_answer_keys for select using (auth.role() = 'authenticated');
create policy "Admins can upsert test answer keys" on public.test_answer_keys for insert with check (public.is_admin());
create policy "Admins can update test answer keys" on public.test_answer_keys for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users can view own mistakes" on public.mistakes;
drop policy if exists "Users can insert own mistakes" on public.mistakes;
drop policy if exists "Users can update own mistakes" on public.mistakes;
drop policy if exists "Admins see all mistakes" on public.mistakes;
create policy "Users can view own mistakes" on public.mistakes for select using (auth.uid() = user_id);
create policy "Users can insert own mistakes" on public.mistakes for insert with check (auth.uid() = user_id);
create policy "Users can update own mistakes" on public.mistakes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admins see all mistakes" on public.mistakes for select using (public.is_admin());

drop policy if exists "Users can view own review items" on public.review_items;
drop policy if exists "Users can upsert own review items" on public.review_items;
drop policy if exists "Users can insert own review items" on public.review_items;
drop policy if exists "Users can update own review items" on public.review_items;
drop policy if exists "Admins see all review items" on public.review_items;
create policy "Users can view own review items" on public.review_items for select using (auth.uid() = user_id);
create policy "Users can insert own review items" on public.review_items for insert with check (auth.uid() = user_id);
create policy "Users can update own review items" on public.review_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admins see all review items" on public.review_items for select using (public.is_admin());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  signup_role text;
begin
  signup_role := coalesce(new.raw_user_meta_data->>'role', 'student');
  if signup_role not in ('student', 'tutor') then signup_role := 'student'; end if;
  insert into public.profiles (id, email, full_name, role, affiliation)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    signup_role,
    nullif(trim(coalesce(new.raw_user_meta_data->>'affiliation', '')), '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Tutor helper — SECURITY DEFINER to bypass RLS and avoid infinite recursion
create or replace function public.tutor_affiliation()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select affiliation from public.profiles
  where id = auth.uid() and role = 'tutor' and affiliation is not null and affiliation <> '';
$$;

-- Tutor RLS: tutors can view profiles/data of students with the same affiliation
drop policy if exists "Tutors see affiliated profiles" on public.profiles;
create policy "Tutors see affiliated profiles" on public.profiles for select using (
  public.tutor_affiliation() is not null and lower(affiliation) = lower(public.tutor_affiliation())
);

drop policy if exists "Tutors see affiliated attempts" on public.test_attempts;
create policy "Tutors see affiliated attempts" on public.test_attempts for select using (
  public.tutor_affiliation() is not null and user_id in (
    select id from public.profiles where lower(affiliation) = lower(public.tutor_affiliation())
  )
);

drop policy if exists "Tutors see affiliated scores" on public.post_scores;
create policy "Tutors see affiliated scores" on public.post_scores for select using (
  public.tutor_affiliation() is not null and user_id in (
    select id from public.profiles where lower(affiliation) = lower(public.tutor_affiliation())
  )
);

drop policy if exists "Tutors see affiliated mistakes" on public.mistakes;
create policy "Tutors see affiliated mistakes" on public.mistakes for select using (
  public.tutor_affiliation() is not null and user_id in (
    select id from public.profiles where lower(affiliation) = lower(public.tutor_affiliation())
  )
);

drop policy if exists "Tutors see affiliated studied topics" on public.studied_topics;
create policy "Tutors see affiliated studied topics" on public.studied_topics for select using (
  public.tutor_affiliation() is not null and user_id in (
    select id from public.profiles where lower(affiliation) = lower(public.tutor_affiliation())
  )
);

drop policy if exists "Tutors see affiliated review items" on public.review_items;
create policy "Tutors see affiliated review items" on public.review_items for select using (
  public.tutor_affiliation() is not null and user_id in (
    select id from public.profiles where lower(affiliation) = lower(public.tutor_affiliation())
  )
);

-- One-time setup: promote the Agora admin account (safe to run repeatedly).
update public.profiles
set role = 'admin'
where lower(email) = 'agora@admin.edu';
