-- Heavy cardstock is 240 gsm (was recorded as 250). Existing rows are corrected
-- before the check constraint is tightened to allow 240.
alter table public.print_orders drop constraint if exists print_orders_paper_gsm_check;

update public.print_orders
  set paper_gsm = 240
  where paper_type = 'matte250' and paper_gsm = 250;

alter table public.print_orders
  add constraint print_orders_paper_gsm_check check (paper_gsm in (80, 240));
