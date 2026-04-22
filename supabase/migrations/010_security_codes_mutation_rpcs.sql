-- Insert security code with encryption
create or replace function insert_security_code(
  p_company_id uuid,
  p_label      text,
  p_value      text,
  p_client_id  uuid,
  p_notes      text,
  p_expires_at timestamptz,
  p_passphrase text
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into security_codes
    (company_id, client_id, code_label, code_value_enc, notes, expires_at)
  values (
    p_company_id, p_client_id, p_label,
    pgp_sym_encrypt(p_value, p_passphrase),
    p_notes, p_expires_at
  );
$$;

-- Update security code with re-encryption
create or replace function update_security_code(
  p_id         uuid,
  p_company_id uuid,
  p_label      text,
  p_value      text,
  p_client_id  uuid,
  p_notes      text,
  p_expires_at timestamptz,
  p_is_active  boolean,
  p_passphrase text
)
returns void
language sql
security definer
set search_path = public
as $$
  update security_codes set
    code_label      = p_label,
    code_value_enc  = pgp_sym_encrypt(p_value, p_passphrase),
    client_id       = p_client_id,
    notes           = p_notes,
    expires_at      = p_expires_at,
    is_active       = p_is_active,
    updated_at      = now()
  where id = p_id and company_id = p_company_id;
$$;
