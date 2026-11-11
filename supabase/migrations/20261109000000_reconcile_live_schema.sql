-- Reconciles the live database with the current application schema.
-- The live tables used an older design and held no rows, so they are rebuilt
-- from the final definitions. This supersedes migrations 20261031000000 through
-- 20261108000000, which are recorded as applied in the remote history.
-- Do not run this against a database that holds real customer rows.

drop table if exists public.quote_requests cascade;
drop table if exists public.print_orders cascade;
drop table if exists public.bookings cascade;
drop table if exists public.profiles cascade;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles: one row per signed-in account (id matches auth.users.id).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  preferred_language text not null default 'en'
    check (preferred_language in ('en', 'ar')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- bookings: tutoring and university advising session requests.
-- tier_type stores the selected option id from config.js (e.g. 'ielts', 'applications').
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  service_id text not null
    check (service_id in ('tutoring', 'universityAdvising')),
  tier_type text not null,
  delivery_mode text,
  session_duration_hours numeric(3, 1) not null
    check (session_duration_hours > 0),
  package_id text,
  is_consultation boolean not null default false,
  session_date date not null,
  session_time time not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  original_price_kwd numeric(12, 3) not null default 0 check (original_price_kwd >= 0),
  discounted_price_kwd numeric(12, 3) not null default 0 check (discounted_price_kwd >= 0),
  status text not null default 'requested'
    check (status in ('requested', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

create index bookings_session_date_idx on public.bookings (session_date);
create index bookings_user_id_idx on public.bookings (user_id);

-- print_orders: print shop jobs with completion buffer and pickup window.
-- ready_at = submission time + completion buffer (earliest moment to collect).
-- pickup_at = the customer's chosen pickup time, which must not precede ready_at.
create table public.print_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  paper_type text not null check (paper_type in ('plain', 'matte250')),
  pages_per_copy integer not null check (pages_per_copy >= 1),
  copies integer not null check (copies between 1 and 10000),
  total_pages integer generated always as (pages_per_copy * copies) stored,
  print_minutes integer not null check (print_minutes >= 0),
  buffer_minutes integer not null check (buffer_minutes >= 0),
  is_high_volume boolean not null default false,
  original_price_kwd numeric(12, 3) not null default 0 check (original_price_kwd >= 0),
  discounted_price_kwd numeric(12, 3) not null default 0 check (discounted_price_kwd >= 0),
  delivery_zone text,
  delivery_fee_kwd numeric(12, 3) not null default 0 check (delivery_fee_kwd >= 0),
  ready_at timestamptz not null,
  pickup_at timestamptz not null,
  document_path text,
  instructions text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  status text not null default 'requested'
    check (status in ('requested', 'in_progress', 'ready', 'collected', 'cancelled')),
  created_at timestamptz not null default now(),
  constraint print_orders_pickup_after_ready check (pickup_at >= ready_at)
);

create index print_orders_pickup_at_idx on public.print_orders (pickup_at);
create index print_orders_user_id_idx on public.print_orders (user_id);

-- quote_requests: quote builder carts submitted for a team follow-up.
create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  language text not null check (language in ('en', 'ar')),
  lines jsonb not null,
  total numeric(12, 3) not null check (total >= 0),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  status text not null default 'requested'
    check (status in ('requested', 'quoted', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

create index quote_requests_user_id_idx on public.quote_requests (user_id);

-- Row-level security. Guests (anon) may only INSERT requests with status 'requested',
-- and only unlinked or linked to their own account. They cannot read rows back.
-- Signed-in users can read the requests they own. Staff use the service role.
alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.print_orders enable row level security;
alter table public.quote_requests enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "bookings_insert_requests" on public.bookings
  for insert to anon, authenticated
  with check (status = 'requested' and (user_id is null or user_id = auth.uid()));

create policy "bookings_select_own" on public.bookings
  for select to authenticated using (user_id = auth.uid());

create policy "print_orders_insert_requests" on public.print_orders
  for insert to anon, authenticated
  with check (status = 'requested' and (user_id is null or user_id = auth.uid()));

create policy "print_orders_select_own" on public.print_orders
  for select to authenticated using (user_id = auth.uid());

create policy "quote_requests_insert_requests" on public.quote_requests
  for insert to anon, authenticated
  with check (status = 'requested' and (user_id is null or user_id = auth.uid()));

create policy "quote_requests_select_own" on public.quote_requests
  for select to authenticated using (user_id = auth.uid());

-- Private bucket for customer print documents (20 MB limit).
-- Guests can upload here but cannot list or download objects.
-- The bucket id must match PRINT_DOCUMENT_BUCKET in app/utils/supabase/submissions.ts.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'print-documents',
  'print-documents',
  false,
  20971520,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "print_documents_upload" on storage.objects;
create policy "print_documents_upload" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'print-documents');

