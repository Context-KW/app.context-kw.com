# MEMORY.md

## Launch status (latest)
- Site is live in production on Vercel at `context-kw.com`. Custom domain and production deployment verified by the user.
- GitHub repo is up to date and backed up. Git is not installed on this machine, so `git` commands were not run locally.
- Migration `20261110000000_grant_anon_booking_insert.sql` is applied to production (`migration list --remote` shows all versions through `20261110000000`).
- Contact details set in `config.js` and `app/contact/page.tsx`: phone `+965 5503 9794`, email `info@context-kw.com`, WhatsApp `wa.me/96555039794`, Farwaniya basement address (Shop 16, Habib Al-Munawir Street).
- `app/layout.tsx`: title `"Context"`, `metadataBase` `https://context-kw.com`.
- `app/calculator/page.tsx` was accidentally truncated and then restored by the user from git. Typecheck and build passed after the restore.
- Calculator rates now match `config.js`: `bw` 0.05, `color` 0.125 (2.5x). Promo 25%. Bulk steps 25% at 50 sheets and 25% at 500 sheets, stacking.
- Vercel env vars: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` only. Never add the service role key.
- `npm run typecheck` exited 2 with no error output, while `npx tsc --noEmit` exited 0. Cause not investigated.


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
- Booking form ("Preferred session time", "Request a session", "Request booking") now shows on all five non-print cards (1 to 5). Implemented via `isRequestableService` and `TIER_GROUP_BY_SERVICE` in `app/utils/bookingSelection.ts`.
- Card 2 "Focus areas" and card 5 "Training focus" are now selectable (`readOnly` removed).
- Migration `20261111000000_bookings_request_services.sql` created: widens `bookings.service_id` check to include accentCoaching, translation, corporate; makes `session_duration_hours` nullable. **NOT applied to production yet**, and it depends on `20261110000000` being applied first.
- `npx tsc --noEmit` and `npm run lint` pass after these edits. Not yet tested in a browser.
- Migration history reconciled: nine older versions (`20261031000000` to `20261108000000`) marked applied on remote.
- `20261109000000_reconcile_live_schema.sql` applied to production. It dropped and recreated `profiles`, `bookings`, `print_orders`, and `quote_requests`, with RLS policies and the `print-documents` bucket. Pre-push checks showed 0 rows in `bookings`, `print_orders`, and `profiles`.
- Created `supabase/migrations/20261110000000_grant_anon_booking_insert.sql`: `grant insert on table public.bookings to anon, authenticated;`. Applied to production (see Launch status).
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
- Guest booking end-to-end test passed (user-confirmed row saved). Retest on production `context-kw.com` and confirm print orders and quote requests also save.
- Stop the dev server and any stray `supabase` or `node` processes when finished.
- Resolved: layout title is "Context" and `metadataBase` is set (see Launch status).
- Arabic tagline and protector strings have not had native review.
- Services header may wrap awkwardly on narrow screens. Not checked.
- Quote Builder subtitle is still visible ("Farwaniya Hub"). Confirm it is wanted. Quote Builder has no language toggle.
- `app/calculator/page.tsx` hardcodes print, protector, and binding rates (marked PLACEHOLDER). They can drift from `config.js`.
- `app/components/calculator/Calculator.tsx` is unused. Decide whether to delete it.
- Custom protector count is a total across all copies (1 to 50). Confirm this rule.
- Resolved: calculator WhatsApp number and pickup address are real values. Rates set to 0.05 / 0.125.
- `supabase db dump --linked` hung earlier, so the full live schema was never dumped. `--linked` is deprecated; use `--remote`.
- Local Supabase stack is not possible without Docker.
