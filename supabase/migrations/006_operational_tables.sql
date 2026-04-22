-- ============================================================
-- check_ins
-- ============================================================
create table check_ins (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid not null references companies(id) on delete cascade,
  user_id        uuid not null references profiles(id) on delete cascade,
  client_id      uuid references clients(id) on delete set null,
  check_in_type  text not null
                   check (check_in_type in (
                     'shift_start','shift_end','patrol','break_start','break_end')),
  location       jsonb,                   -- { lat, lng, accuracy }
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index check_ins_company_id_idx on check_ins(company_id);
create index check_ins_user_id_idx    on check_ins(user_id);
create index check_ins_created_at_idx on check_ins(created_at desc);

create trigger check_ins_updated_at
  before update on check_ins
  for each row execute function set_updated_at();

-- ============================================================
-- breaks
-- duration_minutes computed by trigger when ended_at is set
-- ============================================================
create table breaks (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid not null references companies(id) on delete cascade,
  user_id          uuid not null references profiles(id) on delete cascade,
  check_in_id      uuid references check_ins(id) on delete set null,
  started_at       timestamptz not null default now(),
  ended_at         timestamptz,
  duration_minutes integer,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index breaks_user_id_idx on breaks(user_id);

create or replace function compute_break_duration()
returns trigger
language plpgsql
as $$
begin
  if new.ended_at is not null then
    new.duration_minutes :=
      extract(epoch from (new.ended_at - new.started_at)) / 60;
  end if;
  return new;
end;
$$;

create trigger breaks_duration
  before insert or update on breaks
  for each row execute function compute_break_duration();

create trigger breaks_updated_at
  before update on breaks
  for each row execute function set_updated_at();

-- ============================================================
-- activity_logs
-- ============================================================
create table activity_logs (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid not null references companies(id) on delete cascade,
  user_id      uuid references profiles(id) on delete set null,
  action       text not null,             -- 'incident.created', 'user.deactivated', etc.
  entity_type  text,                      -- 'incident', 'user', 'client', etc.
  entity_id    uuid,
  details      jsonb,
  ip_address   text,
  user_agent   text,
  created_at   timestamptz not null default now()
);

create index activity_logs_company_id_idx on activity_logs(company_id);
create index activity_logs_user_id_idx    on activity_logs(user_id);
create index activity_logs_created_at_idx on activity_logs(created_at desc);

-- activity_logs has no updated_at - it is append-only

-- ============================================================
-- files
-- ============================================================
create table files (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid references companies(id) on delete cascade,
  uploaded_by  uuid references profiles(id) on delete set null,
  file_name    text not null,
  file_type    text,
  file_size    bigint,
  storage_path text not null,
  public_url   text,
  entity_type  text,  -- 'incident_evidence','company_logo','user_avatar','system_logo'
  entity_id    uuid,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index files_entity_idx on files(entity_type, entity_id);

create trigger files_updated_at
  before update on files
  for each row execute function set_updated_at();

-- ============================================================
-- system_settings  (super admin only, no company_id)
-- ============================================================
create table system_settings (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  value       jsonb,
  updated_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger system_settings_updated_at
  before update on system_settings
  for each row execute function set_updated_at();

-- Seed default system settings
insert into system_settings (key, value)
values
  ('platform_name',  '"FairGround"'::jsonb),
  ('platform_logo',  'null'::jsonb),
  ('maintenance',    'false'::jsonb);

-- ============================================================
-- suggestions
-- ============================================================
create table suggestions (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid references companies(id) on delete set null,
  submitted_by uuid references profiles(id) on delete set null,
  title        text not null,
  body         text,
  status       text not null default 'new'
                 check (status in ('new','reviewed','planned','done','declined')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index suggestions_status_idx on suggestions(status);

create trigger suggestions_updated_at
  before update on suggestions
  for each row execute function set_updated_at();
