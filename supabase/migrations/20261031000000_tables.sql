-- Context Portal: core tables for profiles, bookings, print orders, and quote requests.
-- Migrations run in filename order. Apply with `supabase db push`, or paste into the SQL editor.

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
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  preferred_language text not null default 'en'
    check (preferred_language in ('en', 'ar')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- bookings: tutoring and university advising session requests.
-- tier_type stores the selected option id from config.js (e.g. 'ielts', 'applications').
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  service_id text not null
    check (service_id in ('tutoring', 'universityAdvising')),
  tier_type text not null,
  delivery_mode text,
  session_duration_hours numeric(3, 1) not null
    check (session_duration_hours > 0),
  package_id text,
  session_date date not null,
  session_time time not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  status text not null default 'requested'
    check (status in ('requested', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists bookings_session_date_idx on public.bookings (session_date);
create index if not exists bookings_user_id_idx on public.bookings (user_id);

-- print_orders: print shop jobs with completion buffer and pickup window.
-- ready_at = submission time + completion buffer (earliest moment to collect).
-- pickup_at = the customer's chosen pickup time, which must not precede ready_at.
create table if not exists public.print_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  paper_type text not null check (paper_type in ('plain80', 'matte250')),
  paper_gsm integer not null check (paper_gsm in (80, 250)),
  pages_per_copy integer not null check (pages_per_copy >= 1),
  copies integer not null check (copies between 1 and 10000),
  total_pages integer generated always as (pages_per_copy * copies) stored,
  print_minutes integer not null check (print_minutes >= 0),
  buffer_minutes integer not null check (buffer_minutes >= 0),
  is_high_volume boolean not null default false,
  ready_at timestamptz not null,
  pickup_at timestamptz not null,
  document_path text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  status text not null default 'requested'
    check (status in ('requested', 'in_progress', 'ready', 'collected', 'cancelled')),
  created_at timestamptz not null default now(),
  constraint print_orders_pickup_after_ready check (pickup_at >= ready_at)
);

create index if not exists print_orders_pickup_at_idx on public.print_orders (pickup_at);
create index if not exists print_orders_user_id_idx on public.print_orders (user_id);

-- quote_requests: quote builder carts submitted for a team follow-up.
create table if not exists public.quote_requests (
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

create index if not exists quote_requests_user_id_idx on public.quote_requests (user_id);
