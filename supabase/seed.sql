-- ============================================================
-- FairGround Dev Seed
-- Run AFTER all migrations.
-- Creates all records via direct SQL (bypasses Auth, so you
-- must also create the auth.users manually in the Supabase
-- dashboard or use the helper instructions below).
--
-- SETUP INSTRUCTIONS:
-- 1. In Supabase dashboard > Authentication > Users, create:
--      super@fairground.dev        password: SuperAdmin1!
--      admin@demo.com              password: DemoAdmin1!
--      supervisor@demo.com         password: DemoSuper1!
--      guard1@demo.com             password: DemoGuard1!
--      guard2@demo.com             password: DemoGuard2!
--
-- 2. Copy each user's UUID from the dashboard into the
--    variables below, then run this script via the SQL editor.
-- ============================================================

-- ----------------------------------------------------------------
-- Replace these UUIDs with the real ones from your auth.users table
-- ----------------------------------------------------------------
do $$
declare
  v_super_id      uuid := '00000000-0000-0000-0000-000000000001';
  v_admin_id      uuid := '00000000-0000-0000-0000-000000000002';
  v_supervisor_id uuid := '00000000-0000-0000-0000-000000000003';
  v_guard1_id     uuid := '00000000-0000-0000-0000-000000000004';
  v_guard2_id     uuid := '00000000-0000-0000-0000-000000000005';
  v_company_id    uuid := gen_random_uuid();
  v_client1_id    uuid := gen_random_uuid();
  v_client2_id    uuid := gen_random_uuid();
  v_client3_id    uuid := gen_random_uuid();
  v_inc1_id       uuid := gen_random_uuid();
  v_inc2_id       uuid := gen_random_uuid();
  v_inc3_id       uuid := gen_random_uuid();
begin

  -- ----------------------------------------------------------------
  -- Companies
  -- ----------------------------------------------------------------
  insert into companies (id, company_name, business_type, service_type, status)
  values (
    v_company_id,
    'Apex Security Group',
    'security',
    'Commercial and residential security services',
    'active'
  );

  -- ----------------------------------------------------------------
  -- Profiles
  -- ----------------------------------------------------------------
  -- Super admin (no company)
  insert into profiles (id, email, full_name, role, company_id)
  values (v_super_id, 'super@fairground.dev', 'Platform Admin', 'super_admin', null)
  on conflict (id) do update set role = 'super_admin', full_name = 'Platform Admin';

  -- Company management
  insert into profiles (id, email, full_name, role, company_id)
  values (v_admin_id, 'admin@demo.com', 'Sarah Mitchell', 'management', v_company_id)
  on conflict (id) do update set role = 'management', company_id = v_company_id;

  -- Supervisor
  insert into profiles (id, email, full_name, role, company_id)
  values (v_supervisor_id, 'supervisor@demo.com', 'James Okafor', 'supervisor', v_company_id)
  on conflict (id) do update set role = 'supervisor', company_id = v_company_id;

  -- Guards
  insert into profiles (id, email, full_name, role, company_id, phone)
  values (v_guard1_id, 'guard1@demo.com', 'Maria Santos', 'guard', v_company_id, '555-0101')
  on conflict (id) do update set role = 'guard', company_id = v_company_id;

  insert into profiles (id, email, full_name, role, company_id, phone)
  values (v_guard2_id, 'guard2@demo.com', 'Derek Williams', 'guard', v_company_id, '555-0102')
  on conflict (id) do update set role = 'guard', company_id = v_company_id;

  -- ----------------------------------------------------------------
  -- Clients
  -- ----------------------------------------------------------------
  insert into clients (id, company_id, client_name, contact_person, email, phone, address, status)
  values
    (v_client1_id, v_company_id, 'Northgate Mall',
     'Tom Reyes', 'treyes@northgate.com', '555-2001',
     '1200 Northgate Blvd, Springfield, IL 62701', 'active'),

    (v_client2_id, v_company_id, 'Harbor View Apartments',
     'Linda Chen', 'lchen@harborview.com', '555-2002',
     '800 Harbor Dr, Springfield, IL 62702', 'active'),

    (v_client3_id, v_company_id, 'TechPlex Office Park',
     'Raj Patel', 'rpatel@techplex.com', '555-2003',
     '45 Innovation Way, Springfield, IL 62703', 'active');

  -- ----------------------------------------------------------------
  -- Security codes (encrypted with placeholder passphrase)
  -- In production the passphrase is SECURITY_CODE_SECRET env var.
  -- ----------------------------------------------------------------
  insert into security_codes
    (company_id, client_id, code_label, code_value_enc, notes, expires_at)
  values
    (v_company_id, v_client1_id, 'Main Entrance Alarm',
     pgp_sym_encrypt('4821', 'dev_secret_change_me'),
     'Disarm within 30 seconds of entry',
     now() + interval '90 days'),

    (v_company_id, v_client2_id, 'Parking Gate Code',
     pgp_sym_encrypt('7734', 'dev_secret_change_me'),
     'Works on both north and south gates',
     now() + interval '60 days'),

    (v_company_id, v_client3_id, 'Server Room Access',
     pgp_sym_encrypt('9901#', 'dev_secret_change_me'),
     'Badge + code required. Do not share.',
     now() + interval '30 days');

  -- ----------------------------------------------------------------
  -- Incidents
  -- ----------------------------------------------------------------
  insert into incidents
    (id, company_id, reported_by, client_id, title, description, category,
     severity, status, location)
  values
    (v_inc1_id, v_company_id, v_guard1_id, v_client1_id,
     'Suspected Shoplifter at North Entrance',
     'Observed individual concealing merchandise near north entrance. Approached and escorted off premises. No police contact made.',
     'theft', 'medium', 'resolved',
     '{"lat":39.7817,"lng":-89.6501,"address":"1200 Northgate Blvd, North Entrance"}'::jsonb),

    (v_inc2_id, v_company_id, v_guard2_id, v_client2_id,
     'Broken Window in Building C',
     'Ground floor window in Building C found shattered during patrol at 02:15. No one on premises. Possible vandalism.',
     'vandalism', 'high', 'open',
     '{"lat":39.7820,"lng":-89.6510,"address":"800 Harbor Dr, Building C"}'::jsonb),

    (v_inc3_id, v_company_id, v_guard1_id, v_client3_id,
     'Unauthorized Access Attempt - Server Room',
     'Badge reader logged three failed attempts at server room door between 23:00 and 23:05. No one was seen in the corridor on camera review.',
     'suspicious_activity', 'critical', 'in_progress',
     '{"lat":39.7830,"lng":-89.6490,"address":"45 Innovation Way, Floor 2"}'::jsonb);

  -- ----------------------------------------------------------------
  -- Check-ins
  -- ----------------------------------------------------------------
  insert into check_ins (company_id, user_id, client_id, check_in_type, location)
  values
    (v_company_id, v_guard1_id, v_client1_id, 'shift_start',
     '{"lat":39.7817,"lng":-89.6501,"accuracy":12}'::jsonb),
    (v_company_id, v_guard1_id, v_client1_id, 'patrol',
     '{"lat":39.7818,"lng":-89.6503,"accuracy":15}'::jsonb),
    (v_company_id, v_guard1_id, v_client1_id, 'shift_end',
     '{"lat":39.7817,"lng":-89.6501,"accuracy":10}'::jsonb),
    (v_company_id, v_guard2_id, v_client2_id, 'shift_start',
     '{"lat":39.7820,"lng":-89.6510,"accuracy":14}'::jsonb),
    (v_company_id, v_guard2_id, v_client2_id, 'shift_end',
     '{"lat":39.7820,"lng":-89.6510,"accuracy":11}'::jsonb);

  -- ----------------------------------------------------------------
  -- Activity log entries
  -- ----------------------------------------------------------------
  insert into activity_logs (company_id, user_id, action, entity_type, entity_id, details)
  values
    (v_company_id, v_guard1_id, 'incident.created',
     'incident', v_inc1_id, '{"title":"Suspected Shoplifter at North Entrance"}'::jsonb),
    (v_company_id, v_guard2_id, 'incident.created',
     'incident', v_inc2_id, '{"title":"Broken Window in Building C"}'::jsonb),
    (v_company_id, v_admin_id,  'incident.status_changed',
     'incident', v_inc1_id, '{"from":"open","to":"resolved"}'::jsonb),
    (v_company_id, v_admin_id,  'user.invited',
     'user', v_guard1_id, '{"email":"guard1@demo.com","role":"guard"}'::jsonb);

end $$;
