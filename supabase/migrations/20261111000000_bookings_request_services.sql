-- Lets the "Request a session" form save bookings for accent coaching,
-- communicative Arabic coaching, and corporate, in addition to tutoring and university advising.
alter table public.bookings drop constraint if exists bookings_service_id_check;
alter table public.bookings add constraint bookings_service_id_check
  check (service_id in ('tutoring', 'universityAdvising', 'accentCoaching', 'communicativeArabic', 'resumeWriting', 'corporate'));

-- Communicative Arabic and corporate requests have no session length, so the column stays nullable.
alter table public.bookings alter column session_duration_hours drop not null;
alter table public.bookings drop constraint if exists bookings_session_duration_hours_check;
alter table public.bookings add constraint bookings_session_duration_hours_check
  check (session_duration_hours is null or session_duration_hours > 0);
