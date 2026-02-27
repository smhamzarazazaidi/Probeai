const https = require('https');

const query = `
-- Profiles table (for linking Auth users to App users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Surveys table
CREATE TABLE IF NOT EXISTS public.surveys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  goal text not null,
  target_audience text not null,
  context text,
  status text not null default 'DRAFT',
  share_token text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Respondent Fields table
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

-- Questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id uuid default gen_random_uuid() primary key,
  survey_id uuid references public.surveys(id) on delete cascade not null,
  text text not null,
  type text not null,
  category text not null default 'GENERAL',
  options jsonb,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sessions table (for respondents)
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid default gen_random_uuid() primary key,
  survey_id uuid references public.surveys(id) on delete cascade not null,
  respondent_name text,
  respondent_email text,
  respondent_meta jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- Responses table
CREATE TABLE IF NOT EXISTS public.responses (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  question_id uuid references public.questions(id) on delete cascade not null,
  answer text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Analysis table
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

-- Trigger to create profile on sign up
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
`;

const ref = "riisxerekvfswohipiuv";
const token = "sbp_bab732cd05b3ecf06cfb79b747625bebca66fe0a";

const data = JSON.stringify({ query: query });

const options = {
    hostname: 'api.supabase.com',
    port: 443,
    path: '/v1/projects/' + ref + '/query',
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = https.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => responseBody += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', responseBody);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
