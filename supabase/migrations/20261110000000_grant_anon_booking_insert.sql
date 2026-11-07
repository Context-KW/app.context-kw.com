-- Allow guest (anon) and signed-in (authenticated) clients to insert booking requests.
-- RLS is already enabled on public.bookings, and policy bookings_insert_requests
-- limits inserts to status = 'requested' with user_id null or equal to auth.uid().
-- Without this grant, PostgREST rejects the insert with "permission denied" before RLS runs.
grant insert on table public.bookings to anon, authenticated;
