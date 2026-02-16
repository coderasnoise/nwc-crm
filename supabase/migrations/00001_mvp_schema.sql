-- ============================================================
-- NWC CRM — MVP Schema Migration
-- Generated: 2026-02-15
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

-- Profiles (extends auth.users)
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  role       text not null check (role in ('admin', 'sales')),
  created_at timestamptz not null default now()
);

-- Leads
create table public.leads (
  id         uuid primary key default gen_random_uuid(),
  first_name text,
  last_name  text,
  phone      text,
  email      text,
  country    text,
  language   text,
  source     text,
  stage      text,
  owner_id   uuid references auth.users (id),
  created_at timestamptz not null default now()
);

-- Surgery types (lookup)
create table public.surgery_types (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- Lead ↔ Surgery many-to-many
create table public.lead_surgeries (
  lead_id         uuid not null references public.leads (id) on delete cascade,
  surgery_type_id uuid not null references public.surgery_types (id) on delete cascade,
  primary key (lead_id, surgery_type_id)
);

-- Offers
create table public.offers (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads (id) on delete cascade,
  currency    text check (currency in ('GBP', 'AUD', 'EUR')),
  amount      numeric,
  offer_text  text not null,
  created_by  uuid references auth.users (id),
  created_at  timestamptz not null default now()
);

-- Events (surgery, transfer, control, payment, hotel)
create table public.events (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads (id) on delete cascade,
  type        text not null check (type in ('surgery', 'transfer', 'control', 'payment', 'hotel')),
  start_at    timestamptz not null,
  notes       text,
  created_by  uuid references auth.users (id),
  created_at  timestamptz not null default now()
);

-- Attachments (pre-op / post-op / document)
create table public.attachments (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads (id) on delete cascade,
  file_path   text not null,
  label       text check (label in ('preop', 'postop', 'document')),
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

-- Audit logs
create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id   uuid not null,
  action      text not null,
  before      jsonb,
  after       jsonb,
  actor_id    uuid references auth.users (id),
  created_at  timestamptz not null default now()
);


-- ============================================================
-- 2. INDEXES
-- ============================================================

create index idx_leads_phone    on public.leads (phone);
create index idx_leads_email    on public.leads (email);
create index idx_leads_owner_id on public.leads (owner_id);
create index idx_leads_stage    on public.leads (stage);


-- ============================================================
-- 3. ROW LEVEL SECURITY — enable
-- ============================================================

alter table public.leads       enable row level security;
alter table public.offers      enable row level security;
alter table public.events      enable row level security;
alter table public.attachments enable row level security;


-- ============================================================
-- 4. HELPER — resolve caller role from profiles
-- ============================================================
-- Used in every policy so we don't repeat the sub-select.

create or replace function public.auth_role()
returns text
language sql
stable
security definer
as $$
  select role from public.profiles where id = auth.uid()
$$;


-- ============================================================
-- 5. RLS POLICIES
-- ============================================================

-- ----- LEADS -------------------------------------------------

-- Admin: full access
create policy "leads_admin_all" on public.leads
  for all
  using  (public.auth_role() = 'admin')
  with check (public.auth_role() = 'admin');

-- Sales: access only own leads
create policy "leads_sales_all" on public.leads
  for all
  using  (public.auth_role() = 'sales' and owner_id = auth.uid())
  with check (public.auth_role() = 'sales' and owner_id = auth.uid());

-- ----- OFFERS ------------------------------------------------

-- Admin: full access
create policy "offers_admin_all" on public.offers
  for all
  using  (public.auth_role() = 'admin')
  with check (public.auth_role() = 'admin');

-- Sales: only offers linked to own leads
create policy "offers_sales_all" on public.offers
  for all
  using (
    public.auth_role() = 'sales'
    and lead_id in (select id from public.leads where owner_id = auth.uid())
  )
  with check (
    public.auth_role() = 'sales'
    and lead_id in (select id from public.leads where owner_id = auth.uid())
  );

-- ----- EVENTS ------------------------------------------------

-- Admin: full access
create policy "events_admin_all" on public.events
  for all
  using  (public.auth_role() = 'admin')
  with check (public.auth_role() = 'admin');

-- Sales: only events linked to own leads
create policy "events_sales_all" on public.events
  for all
  using (
    public.auth_role() = 'sales'
    and lead_id in (select id from public.leads where owner_id = auth.uid())
  )
  with check (
    public.auth_role() = 'sales'
    and lead_id in (select id from public.leads where owner_id = auth.uid())
  );

-- ----- ATTACHMENTS -------------------------------------------

-- Admin: full access
create policy "attachments_admin_all" on public.attachments
  for all
  using  (public.auth_role() = 'admin')
  with check (public.auth_role() = 'admin');

-- Sales: only attachments linked to own leads
create policy "attachments_sales_all" on public.attachments
  for all
  using (
    public.auth_role() = 'sales'
    and lead_id in (select id from public.leads where owner_id = auth.uid())
  )
  with check (
    public.auth_role() = 'sales'
    and lead_id in (select id from public.leads where owner_id = auth.uid())
  );
