-- Paper weight is no longer offered; all print paper is standard A4 size.
-- paper_type already identifies the paper, so the gsm column is no longer needed.
alter table public.print_orders drop constraint if exists print_orders_paper_gsm_check;

alter table public.print_orders drop column if exists paper_gsm;
