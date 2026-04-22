-- RPC to return decrypted security codes for a given company.
-- Only callable server-side (service role), never exposed to anon.
create or replace function get_decrypted_security_codes(
  p_company_id uuid,
  p_passphrase text
)
returns table (
  id          uuid,
  company_id  uuid,
  client_id   uuid,
  client_name text,
  code_label  text,
  code_value  text,
  notes       text,
  expires_at  timestamptz,
  is_active   boolean,
  created_at  timestamptz,
  updated_at  timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    sc.id,
    sc.company_id,
    sc.client_id,
    c.client_name,
    sc.code_label,
    pgp_sym_decrypt(sc.code_value_enc, p_passphrase)::text as code_value,
    sc.notes,
    sc.expires_at,
    sc.is_active,
    sc.created_at,
    sc.updated_at
  from security_codes sc
  left join clients c on c.id = sc.client_id
  where sc.company_id = p_company_id
  order by sc.created_at desc;
$$;
