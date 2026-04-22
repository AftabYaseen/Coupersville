-- ============================================================
-- clients
-- ============================================================
create table clients (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid not null references companies(id) on delete cascade,
  client_name    text not null,
  contact_person text,
  email          text,
  phone          text,
  address        text,
  notes          text,
  status         text not null default 'active'
                   check (status in ('active','inactive')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index clients_company_id_idx on clients(company_id);

create trigger clients_updated_at
  before update on clients
  for each row execute function set_updated_at();

-- ============================================================
-- security_codes
-- Sensitive values encrypted at rest with pgcrypto symmetric
-- encryption.  The passphrase is SECURITY_CODE_SECRET env var.
-- To decrypt in SQL: pgp_sym_decrypt(code_value_enc, 'passphrase')
-- ============================================================
create table security_codes (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid not null references companies(id) on delete cascade,
  client_id      uuid references clients(id) on delete set null,
  code_label     text not null,
  code_value_enc bytea not null,          -- pgp_sym_encrypt output
  notes          text,
  expires_at     timestamptz,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index security_codes_company_id_idx on security_codes(company_id);
create index security_codes_client_id_idx  on security_codes(client_id);

create trigger security_codes_updated_at
  before update on security_codes
  for each row execute function set_updated_at();

-- ============================================================
-- incidents
-- ============================================================
create table incidents (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  reported_by   uuid references profiles(id) on delete set null,
  assigned_to   uuid references profiles(id) on delete set null,
  client_id     uuid references clients(id) on delete set null,
  title         text not null,
  description   text,
  category      text check (category in (
                  'trespassing','vandalism','theft','medical','fire',
                  'suspicious_activity','equipment_damage','other')),
  severity      text not null default 'medium'
                  check (severity in ('low','medium','high','critical')),
  status        text not null default 'draft'
                  check (status in ('draft','open','in_progress','resolved','closed')),
  location      jsonb,                    -- { lat, lng, address }
  evidence_urls text[] default '{}',
  notes         text,                     -- internal management notes
  resolved_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index incidents_company_id_idx  on incidents(company_id);
create index incidents_reported_by_idx on incidents(reported_by);
create index incidents_assigned_to_idx on incidents(assigned_to);
create index incidents_status_idx      on incidents(status);
create index incidents_severity_idx    on incidents(severity);

create trigger incidents_updated_at
  before update on incidents
  for each row execute function set_updated_at();

-- Auto-stamp resolved_at when status changes to resolved or closed
create or replace function stamp_incident_resolved()
returns trigger
language plpgsql
as $$
begin
  if new.status in ('resolved','closed') and old.status not in ('resolved','closed') then
    new.resolved_at = now();
  end if;
  return new;
end;
$$;

create trigger incidents_resolved_at
  before update on incidents
  for each row execute function stamp_incident_resolved();
