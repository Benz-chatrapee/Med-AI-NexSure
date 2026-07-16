-- Med AI NexSure MVP 1 tenant, identity, and membership compatibility
-- Additive migration: preserves existing MVP tables and adds missing tenant-safe foundations.

alter table public.organizations add column if not exists code text;
alter table public.organizations add column if not exists organization_type text not null default 'healthcare_provider';
alter table public.organizations add column if not exists locale text not null default 'en-TH';

update public.organizations
set code = upper(regexp_replace(coalesce(code, name, id::text), '[^a-zA-Z0-9]+', '_', 'g'))
where code is null;

alter table public.organizations alter column code set not null;

create unique index if not exists uq_organizations_code_active
on public.organizations (code)
where deleted_at is null;

alter table public.clinics add column if not exists clinic_type text not null default 'clinic';
alter table public.clinics add column if not exists is_primary boolean not null default false;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'uq_clinics_organization_id_id'
      and conrelid = 'public.clinics'::regclass
  ) then
    alter table public.clinics add constraint uq_clinics_organization_id_id unique (organization_id, id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'fk_user_profiles_primary_clinic_tenant'
      and conrelid = 'public.user_profiles'::regclass
  ) then
    alter table public.user_profiles
      add constraint fk_user_profiles_primary_clinic_tenant
      foreign key (organization_id, primary_clinic_id)
      references public.clinics (organization_id, id);
  end if;
end $$;

create table if not exists public.organization_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  display_name text not null,
  tax_identifier_reference text,
  website_url text,
  support_email text,
  support_phone text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint uq_organization_profiles_org unique (organization_id)
);

create table if not exists public.organization_addresses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  address_type text not null default 'registered',
  address_line1 text not null,
  address_line2 text,
  city text,
  province text,
  postal_code text,
  country_code char(2) not null default 'TH',
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint ck_organization_addresses_type check (address_type in ('registered', 'billing', 'mailing', 'other'))
);

create table if not exists public.organization_branding (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  logo_storage_path text,
  primary_color text,
  secondary_color text,
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint uq_organization_branding_org unique (organization_id)
);

create table if not exists public.clinic_addresses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  address_type text not null default 'service',
  address_line1 text not null,
  address_line2 text,
  city text,
  province text,
  postal_code text,
  country_code char(2) not null default 'TH',
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint fk_clinic_addresses_clinic_tenant foreign key (organization_id, clinic_id)
    references public.clinics (organization_id, id),
  constraint ck_clinic_addresses_type check (address_type in ('service', 'billing', 'mailing', 'other'))
);

create table if not exists public.clinic_business_hours (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  day_of_week smallint not null,
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint fk_clinic_business_hours_clinic_tenant foreign key (organization_id, clinic_id)
    references public.clinics (organization_id, id),
  constraint ck_clinic_business_hours_day check (day_of_week between 0 and 6),
  constraint ck_clinic_business_hours_time check (is_closed = true or (opens_at is not null and closes_at is not null and opens_at < closes_at)),
  constraint uq_clinic_business_hours_day unique (clinic_id, day_of_week)
);

create table if not exists public.clinic_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  default_visit_duration_minutes integer not null default 30,
  appointment_buffer_minutes integer not null default 0,
  settings_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint fk_clinic_settings_clinic_tenant foreign key (organization_id, clinic_id)
    references public.clinics (organization_id, id),
  constraint uq_clinic_settings_clinic unique (clinic_id),
  constraint ck_clinic_settings_duration check (default_visit_duration_minutes > 0),
  constraint ck_clinic_settings_buffer check (appointment_buffer_minutes >= 0)
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_profile_id uuid not null references public.user_profiles(id) on delete cascade,
  membership_status text not null default 'active',
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint uq_organization_memberships_user unique (organization_id, user_profile_id),
  constraint ck_organization_memberships_status check (membership_status in ('invited', 'active', 'suspended', 'revoked'))
);

create table if not exists public.clinic_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  clinic_id uuid not null,
  user_profile_id uuid not null references public.user_profiles(id) on delete cascade,
  membership_status text not null default 'active',
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.user_profiles(id),
  deleted_at timestamptz,
  deleted_by uuid references public.user_profiles(id),
  is_active boolean not null default true,
  constraint fk_clinic_memberships_clinic_tenant foreign key (organization_id, clinic_id)
    references public.clinics (organization_id, id),
  constraint uq_clinic_memberships_user unique (organization_id, clinic_id, user_profile_id),
  constraint ck_clinic_memberships_status check (membership_status in ('active', 'suspended', 'revoked'))
);

insert into public.organization_memberships (organization_id, user_profile_id)
select up.organization_id, up.id
from public.user_profiles up
where up.deleted_at is null
on conflict (organization_id, user_profile_id) do nothing;

insert into public.clinic_memberships (organization_id, clinic_id, user_profile_id)
select up.organization_id, up.primary_clinic_id, up.id
from public.user_profiles up
where up.primary_clinic_id is not null
  and up.deleted_at is null
on conflict (organization_id, clinic_id, user_profile_id) do nothing;

do $$
declare
  v_table text;
  v_trigger text;
begin
  foreach v_table in array array[
    'organization_profiles',
    'organization_addresses',
    'organization_branding',
    'clinic_addresses',
    'clinic_business_hours',
    'clinic_settings',
    'organization_memberships',
    'clinic_memberships'
  ]
  loop
    v_trigger := 'set_' || v_table || '_updated_at';
    if not exists (
      select 1
      from pg_trigger
      where tgname = v_trigger
        and tgrelid = format('public.%I', v_table)::regclass
    ) then
      execute format(
        'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
        v_trigger,
        v_table
      );
    end if;
  end loop;
end $$;
