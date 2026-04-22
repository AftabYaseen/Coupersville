-- ============================================================
-- Enable RLS on every table
-- ============================================================
alter table companies          enable row level security;
alter table profiles           enable row level security;
alter table pending_invitations enable row level security;
alter table clients            enable row level security;
alter table security_codes     enable row level security;
alter table incidents          enable row level security;
alter table check_ins          enable row level security;
alter table breaks             enable row level security;
alter table activity_logs      enable row level security;
alter table files              enable row level security;
alter table system_settings    enable row level security;
alter table suggestions        enable row level security;

-- ============================================================
-- COMPANIES
-- ============================================================
create policy "super_admin full access on companies"
  on companies for all
  using (auth.user_role() = 'super_admin');

create policy "management read own company"
  on companies for select
  using (id = auth.user_company_id());

create policy "management update own company"
  on companies for update
  using (id = auth.user_company_id());

-- field staff can read their own company
create policy "staff read own company"
  on companies for select
  using (
    id = auth.user_company_id()
    and auth.user_role() in ('supervisor','guard','rover')
  );

-- ============================================================
-- PROFILES
-- ============================================================
create policy "super_admin full access on profiles"
  on profiles for all
  using (auth.user_role() = 'super_admin');

create policy "management full access on own company profiles"
  on profiles for all
  using (
    auth.user_role() = 'management'
    and company_id = auth.user_company_id()
  );

create policy "staff read own company profiles"
  on profiles for select
  using (
    auth.user_role() in ('supervisor','guard','rover')
    and company_id = auth.user_company_id()
  );

create policy "any user can read and update their own profile"
  on profiles for all
  using (id = auth.uid());

-- ============================================================
-- PENDING INVITATIONS
-- ============================================================
create policy "management manage own company invitations"
  on pending_invitations for all
  using (
    auth.user_role() in ('management','super_admin')
    and (
      auth.user_role() = 'super_admin'
      or company_id = auth.user_company_id()
    )
  );

-- ============================================================
-- CLIENTS
-- ============================================================
create policy "super_admin full access on clients"
  on clients for all
  using (auth.user_role() = 'super_admin');

create policy "management full access on own company clients"
  on clients for all
  using (
    auth.user_role() = 'management'
    and company_id = auth.user_company_id()
  );

create policy "staff read own company clients"
  on clients for select
  using (
    auth.user_role() in ('supervisor','guard','rover')
    and company_id = auth.user_company_id()
  );

-- ============================================================
-- SECURITY CODES
-- ============================================================
create policy "super_admin full access on security_codes"
  on security_codes for all
  using (auth.user_role() = 'super_admin');

create policy "management full access on own company codes"
  on security_codes for all
  using (
    auth.user_role() = 'management'
    and company_id = auth.user_company_id()
  );

create policy "staff read active own company codes"
  on security_codes for select
  using (
    auth.user_role() in ('supervisor','guard','rover')
    and company_id = auth.user_company_id()
    and is_active = true
  );

-- ============================================================
-- INCIDENTS
-- ============================================================
create policy "super_admin full access on incidents"
  on incidents for all
  using (auth.user_role() = 'super_admin');

create policy "management full access on own company incidents"
  on incidents for all
  using (
    auth.user_role() = 'management'
    and company_id = auth.user_company_id()
  );

create policy "supervisor read own company incidents"
  on incidents for select
  using (
    auth.user_role() = 'supervisor'
    and company_id = auth.user_company_id()
  );

create policy "guard rover read own company incidents"
  on incidents for select
  using (
    auth.user_role() in ('guard','rover')
    and company_id = auth.user_company_id()
  );

create policy "guard rover insert own incidents"
  on incidents for insert
  with check (
    auth.user_role() in ('guard','rover','supervisor')
    and company_id = auth.user_company_id()
    and reported_by = auth.uid()
  );

create policy "guard rover update own draft incidents"
  on incidents for update
  using (
    auth.user_role() in ('guard','rover','supervisor')
    and company_id = auth.user_company_id()
    and reported_by = auth.uid()
    and status = 'draft'
  );

-- ============================================================
-- CHECK_INS
-- ============================================================
create policy "super_admin full access on check_ins"
  on check_ins for all
  using (auth.user_role() = 'super_admin');

create policy "management read own company check_ins"
  on check_ins for select
  using (
    auth.user_role() = 'management'
    and company_id = auth.user_company_id()
  );

create policy "supervisor read own company check_ins"
  on check_ins for select
  using (
    auth.user_role() = 'supervisor'
    and company_id = auth.user_company_id()
  );

create policy "staff insert own check_ins"
  on check_ins for insert
  with check (
    auth.user_role() in ('guard','rover','supervisor')
    and company_id = auth.user_company_id()
    and user_id = auth.uid()
  );

create policy "staff read own check_ins"
  on check_ins for select
  using (
    auth.user_role() in ('guard','rover')
    and user_id = auth.uid()
  );

-- ============================================================
-- BREAKS
-- ============================================================
create policy "super_admin full access on breaks"
  on breaks for all
  using (auth.user_role() = 'super_admin');

create policy "management read own company breaks"
  on breaks for select
  using (
    auth.user_role() = 'management'
    and company_id = auth.user_company_id()
  );

create policy "staff manage own breaks"
  on breaks for all
  using (
    auth.user_role() in ('guard','rover','supervisor')
    and user_id = auth.uid()
  );

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================
create policy "super_admin full access on activity_logs"
  on activity_logs for all
  using (auth.user_role() = 'super_admin');

create policy "management read own company activity_logs"
  on activity_logs for select
  using (
    auth.user_role() = 'management'
    and company_id = auth.user_company_id()
  );

create policy "authenticated users can insert activity_logs"
  on activity_logs for insert
  with check (
    auth.uid() is not null
    and company_id = auth.user_company_id()
  );

-- ============================================================
-- FILES
-- ============================================================
create policy "super_admin full access on files"
  on files for all
  using (auth.user_role() = 'super_admin');

create policy "management full access on own company files"
  on files for all
  using (
    auth.user_role() = 'management'
    and company_id = auth.user_company_id()
  );

create policy "staff insert own files"
  on files for insert
  with check (
    auth.user_role() in ('guard','rover','supervisor')
    and company_id = auth.user_company_id()
    and uploaded_by = auth.uid()
  );

create policy "staff read own company files"
  on files for select
  using (
    auth.user_role() in ('guard','rover','supervisor')
    and company_id = auth.user_company_id()
  );

-- ============================================================
-- SYSTEM SETTINGS
-- ============================================================
create policy "super_admin full access on system_settings"
  on system_settings for all
  using (auth.user_role() = 'super_admin');

create policy "all authenticated users can read system_settings"
  on system_settings for select
  using (auth.uid() is not null);

-- ============================================================
-- SUGGESTIONS
-- ============================================================
create policy "super_admin full access on suggestions"
  on suggestions for all
  using (auth.user_role() = 'super_admin');

create policy "users insert own suggestions"
  on suggestions for insert
  with check (
    auth.uid() is not null
    and submitted_by = auth.uid()
  );

create policy "users read own suggestions"
  on suggestions for select
  using (submitted_by = auth.uid());

create policy "management read own company suggestions"
  on suggestions for select
  using (
    auth.user_role() = 'management'
    and company_id = auth.user_company_id()
  );
