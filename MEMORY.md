# MEMORY.md

## Project architecture
- Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS 3, with Supabase (`@supabase/supabase-js`).
- Scripts: `dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`). No test runner.
- `config.js` is the central source for company text, services, prices, paper types, finishing options, protector thicknesses, bulk steps, and delivery zones.
- Six service cards: 1 tutoring, 2 accent coaching, 3 translation, 4 university advising, 5 corporate, 6 print shop.
- Catalogs: `app/utils/catalog/learning.ts` (cards 1-3), `app/utils/catalog/business.ts` (cards 4-6). Promo applied in `app/utils/services.ts`.
- Pricing: `app/utils/pricing/*` (`core.ts` has `makeLine`, promo, and `discountPercentFor`; `print.ts` has print quotes).
- Modal sections: `app/utils/sections/business.ts`, helpers in `sections/helpers.ts`, types in `app/utils/serviceTypes.ts`.
- UI: `app/components/ServiceCard.tsx`, `ServiceSections.tsx`, shared logo `app/components/Logo.tsx`. Selection logic in `app/utils/bookingSelection.ts`.
- Pages: `app/page.tsx` (language gate), `app/services/page.tsx`, `app/calculator/page.tsx` (Quote Builder), `app/orders/page.tsx` and `app/profile/page.tsx` (both render `ComingSoon.tsx`), `app/contact/page.tsx`.
- Browser Supabase client: `app/utils/supabase/client.ts` reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, returns null if either is missing.
- Write path: `app/utils/supabase/submissions.ts` inserts into `bookings`, `print_orders`, `quote_requests`, and uploads to the `print-documents` bucket.
- Supabase project `hdiesffpsqwdwjmajlwm` ("Context Portal", production). Guests use the anon key; staff use the service role.
- Migrations: `supabase/migrations/` (`supabase/config.toml` created by `supabase init`). Supabase CLI 3.0.0 is a dev dependency. No Docker, so no local stack or `db diff`.

## Changes made this session
- Migration history reconciled: nine older versions (`20261031000000` to `20261108000000`) marked applied on remote.
- `20261109000000_reconcile_live_schema.sql` applied to production. It dropped and recreated `profiles`, `bookings`, `print_orders`, and `quote_requests`, with RLS policies and the `print-documents` bucket. Pre-push checks showed 0 rows in `bookings`, `print_orders`, and `profiles`.
- Created `supabase/migrations/20261110000000_grant_anon_booking_insert.sql`: `grant insert on table public.bookings to anon, authenticated;`. **Not yet applied to production.**
- Dev server: stopped stale `next dev` processes and deleted `.next`. A single `npm run dev` runs on port 3000, with output in `dev-server.out.log` and `dev-server.err.log`. Routes `/`, `/services`, `/calculator`, `/orders`, `/contact` return 200.
- Earlier stale log errors (`Logo is not defined`, `discountPercentFor is not a function`) do not reproduce in the current source. `tsc --noEmit` exits 0.
- Temporary files in the project root that can be deleted: `pushrun2.log`, `pushrun3.log`, `dev-server.out.log`, `dev-server.err.log`.

## Current system state
- RLS is enabled on `bookings`. Policy `bookings_insert_requests` (INSERT for `anon` and `authenticated`) allows only `status = 'requested'` with `user_id` null or `auth.uid()`. `bookings_select_own` is for `authenticated`.
- `anon` and `authenticated` have **no INSERT privilege** on `bookings`, so guest submissions fail with "permission denied for table bookings". Migration `20261110000000` is the fix and is pending.
- `migration list --remote`: versions through `20261109000000` applied. `20261110000000` pending.
- `storage.buckets`: `print-documents` exists, `public = false`.
- REST calls with the anon key return 401 (both the `sb_publishable_` key and the legacy anon JWT). The `.env.local` key exactly matches the CLI publishable key. `/auth/v1/settings` accepts the publishable key. A manual project restart was done in the Supabase dashboard to clear a suspected post-unpause gateway issue. Not re-tested afterwards.
- `supabase db push --remote --yes` hung in this terminal on two attempts. Its output is not reliable here.
- Not yet verified in a browser: guest booking end to end, and the UI changes from the earlier session.

## Unresolved
- Apply `20261110000000` to production. Run `npx supabase db push --remote --yes` from a fresh terminal, then confirm `has_table_privilege('anon','public.bookings','INSERT')` returns true. Alternative: run the same `grant` in the Supabase SQL editor, then repair migration history with `migration repair`.
- Re-test the REST 401 after the project restart. If it persists, check Project Settings → API Keys in the dashboard.
- Guest booking end-to-end test: submit at `http://localhost:3000`, then check the `bookings` table.
- Stop the dev server and any stray `supabase` or `node` processes when finished.
- `app/layout.tsx` metadata title still says "Premium Academic & Corporate Solutions" and does not match the `config.js` tagline.
- Arabic tagline and protector strings have not had native review.
- Services header may wrap awkwardly on narrow screens. Not checked.
- Quote Builder subtitle is still visible ("Farwaniya Hub"). Confirm it is wanted. Quote Builder has no language toggle.
- `app/calculator/page.tsx` hardcodes print, protector, and binding rates (marked PLACEHOLDER). They can drift from `config.js`.
- `app/components/calculator/Calculator.tsx` is unused. Decide whether to delete it.
- Custom protector count is a total across all copies (1 to 50). Confirm this rule.
- Calculator placeholders: WhatsApp number (`965XXXXXXXX`) and pickup address.
- `supabase db dump --linked` hung earlier, so the full live schema was never dumped. `--linked` is deprecated; use `--remote`.
- Local Supabase stack is not possible without Docker.
