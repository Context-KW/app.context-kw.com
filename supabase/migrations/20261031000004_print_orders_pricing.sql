-- Pricing and delivery columns for print orders and bookings.
alter table public.print_orders
  add column if not exists original_price_kwd numeric(12, 3) not null default 0 check (original_price_kwd >= 0),
  add column if not exists discounted_price_kwd numeric(12, 3) not null default 0 check (discounted_price_kwd >= 0),
  add column if not exists delivery_zone text,
  add column if not exists delivery_fee_kwd numeric(12, 3) not null default 0 check (delivery_fee_kwd >= 0);

alter table public.bookings
  add column if not exists original_price_kwd numeric(12, 3) not null default 0 check (original_price_kwd >= 0),
  add column if not exists discounted_price_kwd numeric(12, 3) not null default 0 check (discounted_price_kwd >= 0);
