-- Full Schema for AI Conversational Insight Engine

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Surveys
CREATE TABLE IF NOT EXISTS public.surveys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  goal text not null,
  target_audience text not null,
  context text,
  status text not null default 'DRAFT', -- DRAFT | COLLECTING | ANALYSING | COMPLETED
  share_token text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Respondent Fields
CREATE TABLE IF NOT EXISTS public.respondent_fields (
  id uuid default gen_random_uuid() primary key,
  survey_id uuid references public.surveys(id) on delete cascade not null,
  label text not null,
  field_type text not null,
  is_required boolean default false,
  options jsonb,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Questions (Updated with builder fields)
CREATE TABLE IF NOT EXISTS public.questions (
  id uuid default gen_random_uuid() primary key,
  survey_id uuid references public.surveys(id) on delete cascade not null,
  text text not null,
  type text not null, -- OPEN | SCALE | CHOICE | YES_NO | STAR_RATING | RANKING | PROBE
  category text default 'general',
  options jsonb,               -- ["Option A", "Option B", "Other"]
  scale_min integer default 1,
  scale_max integer default 10,
  scale_min_label text default 'Not at all',
  scale_max_label text default 'Absolutely',
  star_count integer default 5,
  order_index integer,
  parent_question_id uuid references public.questions(id) on delete cascade,
  is_required boolean default false,
  allow_followup boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid default gen_random_uuid() primary key,
  survey_id uuid references public.surveys(id) on delete cascade not null,
  respondent_name text,
  respondent_email text,
  respondent_meta jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- Responses
CREATE TABLE IF NOT EXISTS public.responses (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  question_id uuid references public.questions(id) on delete cascade not null,
  answer text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Analysis
CREATE TABLE IF NOT EXISTS public.analysis (
  id uuid default gen_random_uuid() primary key,
  survey_id uuid references public.surveys(id) on delete cascade not null unique,
  executive_summary text not null,
  overall_sentiment numeric,
  themes jsonb,
  pain_points jsonb,
  opportunities jsonb,
  action_plan jsonb,
  nps_score numeric,
  response_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger: Profile Sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
