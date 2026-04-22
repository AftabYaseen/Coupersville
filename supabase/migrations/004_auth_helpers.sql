-- ============================================================
-- Helper functions used by RLS policies
-- ============================================================

-- Returns the company_id of the currently authenticated user
create or replace function auth.user_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

-- Returns the role of the currently authenticated user
create or replace function auth.user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- Pending invitations table
-- Holds role + company for invited users before they sign up
-- ============================================================
create table pending_invitations (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  role        text not null
                check (role in ('management','supervisor','guard','rover')),
  company_id  uuid not null references companies(id) on delete cascade,
  invited_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique(email, company_id)
);

create index pending_invitations_email_idx on pending_invitations(email);

-- ============================================================
-- Auto-create profile on auth.users insert
-- ============================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role        text;
  v_company_id  uuid;
  v_inv         pending_invitations%rowtype;
begin
  -- Check if this email was invited to a company
  select * into v_inv
    from pending_invitations
   where email = new.email
   limit 1;

  if found then
    v_role       := v_inv.role;
    v_company_id := v_inv.company_id;
    -- Clean up the invitation row
    delete from pending_invitations where id = v_inv.id;
  else
    -- Check raw_user_meta_data for role/company set during registration
    v_role       := coalesce(new.raw_user_meta_data->>'role', 'management');
    v_company_id := (new.raw_user_meta_data->>'company_id')::uuid;
  end if;

  insert into public.profiles (id, email, full_name, role, company_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    v_role,
    v_company_id
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
