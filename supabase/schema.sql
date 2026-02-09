create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  created_at timestamptz not null default now(),
  first_name text,
  preferred_name text,
  middle_name text,
  last_name text,
  gt_email text,
  alt_email text,
  gt_username text,
  gt_id text
);

create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  created_at timestamptz not null default now(),
  linkedin text,
  github text,
  gatech text,
  personal text,
  employer text,
  projects text,
  research text
);

create table if not exists majors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  created_at timestamptz not null default now(),
  selected_major text,
  other_text text
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  created_at timestamptz not null default now(),
  course_code text not null,
  selected boolean not null default false,
  year text,
  term text,
  finished boolean not null default false,
  grade text
);

create table if not exists ta_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  created_at timestamptz not null default now(),
  applied boolean not null default false
);

create table if not exists project_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  created_at timestamptz not null default now(),
  project_id integer not null,
  applied boolean not null default false
);

create unique index if not exists courses_user_course on courses (user_id, course_code);
create unique index if not exists project_apps_user_project on project_applications (user_id, project_id);

create table if not exists project_detail_clicks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  created_at timestamptz not null default now(),
  project_id integer not null,
  link_type text not null
);

create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  created_at timestamptz not null default now(),
  page_key text not null,
  url_path text not null,
  user_agent text,
  ip_address text
);
