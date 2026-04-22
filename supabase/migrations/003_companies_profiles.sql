-- ============================================================
-- companies
-- ============================================================
create table companies (
  id            uuid primary key default gen_random_uuid(),
  company_name  text not null,
  business_type text check (business_type in (
                  'security','construction','cleaning',
                  'manufacturing','technology','other')),
  service_type  text,
  logo_url      text,
  color_scheme  jsonb default '{"primary":"#3b82f6","secondary":"#1e40af","accent":"#60a5fa"}'::jsonb,
  status        text not null default 'active'
                  check (status in ('active','inactive','suspended')),
  subscription  jsonb default '{"status":"trial","plan":"beta","trial_ends_at":null}'::jsonb,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger companies_updated_at
  before update on companies
  for each row execute function set_updated_at();

-- ============================================================
-- profiles  (linked 1:1 to auth.users)
-- ============================================================
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  company_id  uuid references companies(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null
                check (role in ('super_admin','management','supervisor','guard','rover')),
  phone       text,
  avatar_url  text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index profiles_company_id_idx on profiles(company_id);
create index profiles_role_idx       on profiles(role);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();
