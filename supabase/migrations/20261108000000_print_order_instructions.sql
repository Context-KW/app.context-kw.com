-- Customer notes for a print job (for example: staple each copy, print double-sided).
alter table public.print_orders
  add column if not exists instructions text;
