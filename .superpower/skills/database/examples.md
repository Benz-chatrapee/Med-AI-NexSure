# Database Examples

## Patient Table Example

```sql
create table patients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  clinic_id uuid references clinics(id),
  medical_record_number text,
  display_name text not null,
  date_of_birth date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);
```

## Visit Table Example

```sql
create table visits (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  clinic_id uuid not null references clinics(id),
  patient_id uuid not null references patients(id),
  status text not null check (status in ('draft', 'in_review', 'completed', 'archived')),
  visit_date timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## SOAP Note Versioning Example

```sql
create table soap_notes (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references visits(id),
  version integer not null,
  subjective text,
  objective text,
  assessment text,
  plan text,
  status text not null check (status in ('draft', 'submitted', 'reviewed', 'amended')),
  created_by uuid not null references user_profiles(id),
  created_at timestamptz not null default now(),
  unique (visit_id, version)
);
```

## Claim Readiness Assessment Table Example

```sql
create table claim_readiness_assessments (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references visits(id),
  version integer not null,
  readiness_score integer check (readiness_score between 0 and 100),
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  requires_reviewer_review boolean not null default true,
  calculated_at timestamptz not null default now(),
  unique (visit_id, version)
);
```

## Evidence Package Table Example

```sql
create table evidence_packages (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references visits(id),
  version integer not null,
  status text not null check (status in ('draft', 'generated', 'reviewed', 'exported', 'archived')),
  generated_by uuid references user_profiles(id),
  generated_at timestamptz not null default now(),
  unique (visit_id, version)
);
```

## Audit Log Table Example

```sql
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  actor_id uuid references user_profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  reason text,
  before jsonb,
  after jsonb,
  source text not null,
  correlation_id text,
  outcome text not null,
  created_at timestamptz not null default now()
);
```

## RLS Policy Example

```sql
alter table patients enable row level security;

create policy patients_org_read
on patients
for select
using (
  organization_id = auth.jwt() ->> 'organization_id'::text
);
```

## Index Example

```sql
create index visits_org_clinic_status_date_idx
on visits (organization_id, clinic_id, status, visit_date desc);
```

## Dashboard View Example

```sql
create view dashboard_claim_readiness_summary as
select
  v.organization_id,
  v.clinic_id,
  cra.risk_level,
  count(*) as assessment_count
from claim_readiness_assessments cra
join visits v on v.id = cra.visit_id
group by v.organization_id, v.clinic_id, cra.risk_level;
```

## Migration Example

```sql
alter table visits add column if not exists archived_at timestamptz;

create index if not exists visits_archived_at_idx
on visits (archived_at)
where archived_at is not null;
```

## Data Dictionary Example

| Table | Column | Type | Sensitive | Description |
| --- | --- | --- | --- | --- |
| `patients` | `display_name` | `text` | Yes | Patient display name for authorized users |
| `soap_notes` | `assessment` | `text` | Yes | Clinical assessment note content |
| `audit_logs` | `reason` | `text` | Maybe | User-provided reason, must avoid unnecessary PHI |
