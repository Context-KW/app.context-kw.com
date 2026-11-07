-- Row-level security. Guests (anon) may only INSERT requests with status 'requested',
-- and only unlinked or linked to their own account. They cannot read rows back.
-- Signed-in users can read the requests they own. Staff use the service role.

alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.print_orders enable row level security;
alter table public.quote_requests enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "bookings_insert_requests" on public.bookings;
create policy "bookings_insert_requests" on public.bookings
  for insert to anon, authenticated
  with check (status = 'requested' and (user_id is null or user_id = auth.uid()));

drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own" on public.bookings
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "print_orders_insert_requests" on public.print_orders;
create policy "print_orders_insert_requests" on public.print_orders
  for insert to anon, authenticated
  with check (status = 'requested' and (user_id is null or user_id = auth.uid()));

drop policy if exists "print_orders_select_own" on public.print_orders;
create policy "print_orders_select_own" on public.print_orders
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "quote_requests_insert_requests" on public.quote_requests;
create policy "quote_requests_insert_requests" on public.quote_requests
  for insert to anon, authenticated
  with check (status = 'requested' and (user_id is null or user_id = auth.uid()));

drop policy if exists "quote_requests_select_own" on public.quote_requests;
create policy "quote_requests_select_own" on public.quote_requests
  for select to authenticated using (user_id = auth.uid());
