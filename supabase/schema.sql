-- TANZANIA CONTACTS: run this entire file in Supabase SQL Editor.
-- Public users must use the registration RPC; direct table access is denied by RLS.

create table if not exists public.contacts (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 2 and 80),
  phone text not null unique check (phone ~ '^\+255[67][0-9]{8}$'),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  id integer primary key check (id = 1),
  registration_open boolean not null default true,
  whatsapp_group_link text,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id, registration_open)
values (1, true)
on conflict (id) do nothing;

alter table public.contacts enable row level security;
alter table public.app_settings enable row level security;

-- No anon/authenticated policies are intentionally created.
revoke all on public.contacts from anon, authenticated;
revoke all on public.app_settings from anon, authenticated;
grant all on public.contacts to service_role;
grant all on public.app_settings to service_role;

create or replace function public.register_contact(
  p_name text,
  p_phone text,
  p_ip_hint text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
  settings_row public.app_settings%rowtype;
  new_id bigint;
begin
  -- Serializes all registrations, preventing the 1,000 limit being exceeded.
  perform pg_advisory_xact_lock(20261118);

  select * into settings_row from public.app_settings where id = 1 for update;
  if not found or not settings_row.registration_open then
    return jsonb_build_object('success', false, 'code', 'closed');
  end if;

  if p_name is null or char_length(trim(p_name)) < 2 or char_length(trim(p_name)) > 80
     or p_phone !~ '^\+255[67][0-9]{8}$' then
    return jsonb_build_object('success', false, 'code', 'invalid');
  end if;

  if exists (select 1 from public.contacts where phone = p_phone) then
    return jsonb_build_object('success', false, 'code', 'duplicate');
  end if;

  select count(*) into current_count from public.contacts;
  if current_count >= 1000 then
    update public.app_settings set registration_open = false, updated_at = now() where id = 1;
    return jsonb_build_object('success', false, 'code', 'full');
  end if;

  insert into public.contacts(name, phone, consent_at)
  values (trim(p_name), p_phone, now())
  returning id into new_id;

  select count(*) into current_count from public.contacts;
  if current_count >= 1000 then
    update public.app_settings set registration_open = false, updated_at = now() where id = 1;
  end if;

  return jsonb_build_object('success', true, 'id', new_id);
end;
$$;

revoke all on function public.register_contact(text, text, text) from public;
grant execute on function public.register_contact(text, text, text) to service_role;
