-- ============================================================
-- Storage buckets
-- Run this migration after creating the buckets in the
-- Supabase dashboard, OR use the Supabase CLI:
--   supabase storage create company-logos --public
-- etc. These inserts target the storage schema directly.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'company-logos',
    'company-logos',
    true,
    5242880,    -- 5 MB
    array['image/jpeg','image/png','image/webp','image/svg+xml']
  ),
  (
    'user-avatars',
    'user-avatars',
    true,
    2097152,    -- 2 MB
    array['image/jpeg','image/png','image/webp']
  ),
  (
    'incident-evidence',
    'incident-evidence',
    false,
    20971520,   -- 20 MB
    array['image/jpeg','image/png','image/webp','application/pdf',
          'video/mp4','video/quicktime']
  ),
  (
    'system-assets',
    'system-assets',
    true,
    5242880,
    array['image/jpeg','image/png','image/webp','image/svg+xml']
  )
on conflict (id) do nothing;

-- ============================================================
-- Storage RLS policies
-- ============================================================

-- company-logos: public read, authenticated write scoped to own company
create policy "company logos public read"
  on storage.objects for select
  using (bucket_id = 'company-logos');

create policy "company logos authenticated write"
  on storage.objects for insert
  with check (
    bucket_id = 'company-logos'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.user_company_id()::text
  );

create policy "company logos owner update"
  on storage.objects for update
  using (
    bucket_id = 'company-logos'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.user_company_id()::text
  );

-- user-avatars: public read, owner write
create policy "user avatars public read"
  on storage.objects for select
  using (bucket_id = 'user-avatars');

create policy "user avatars owner write"
  on storage.objects for insert
  with check (
    bucket_id = 'user-avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "user avatars owner update"
  on storage.objects for update
  using (
    bucket_id = 'user-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- incident-evidence: authenticated read within own company, insert for staff
create policy "incident evidence company read"
  on storage.objects for select
  using (
    bucket_id = 'incident-evidence'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.user_company_id()::text
  );

create policy "incident evidence staff insert"
  on storage.objects for insert
  with check (
    bucket_id = 'incident-evidence'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.user_company_id()::text
  );

-- system-assets: public read, super_admin write
create policy "system assets public read"
  on storage.objects for select
  using (bucket_id = 'system-assets');

create policy "system assets super admin write"
  on storage.objects for insert
  with check (
    bucket_id = 'system-assets'
    and auth.user_role() = 'super_admin'
  );
