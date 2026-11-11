-- Adds the free 15-minute consultation flag to bookings.
alter table public.bookings
  add column if not exists is_consultation boolean not null default false;
