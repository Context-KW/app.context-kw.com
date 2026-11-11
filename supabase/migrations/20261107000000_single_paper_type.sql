-- Only one paper is offered now (standard A4, id 'plain'). Existing plain orders are
-- relabelled. Historical 'matte250' orders stay valid so past records are not rejected.
alter table public.print_orders drop constraint if exists print_orders_paper_type_check;

update public.print_orders
  set paper_type = 'plain'
  where paper_type = 'plain80';

alter table public.print_orders
  add constraint print_orders_paper_type_check check (paper_type in ('plain', 'matte250'));
