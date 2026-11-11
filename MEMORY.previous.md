# MEMORY.md

## Quick start (read first)
- Project: Context (Kuwait). Next.js 14 App Router, React 18, TypeScript, Tailwind 3, Supabase.
- Commands: `npm run dev`, `npm run lint`, `npx tsc --noEmit`, `npm run build`. No test runner.
- Last verified: `npx tsc --noEmit` and `npm run lint` pass after the Communicative Arabic change. Build and browser test not yet run on that change.
- Git is not installed on this machine. Working dir: `m:\context-portal`. Use absolute paths.

## Service cards (6)
1. Tutoring (`config.tutoring`)
2. Accent coaching (`config.accentCoaching`)
3. Communicative Arabic Coaching (`config.communicativeArabic`), replaces Translation
4. University advising (`config.universityAdvising`)
5. Corporate (`config.corporate`)
6. Print shop (`config.printShop`)

Key files:
- `config.js`: single source for copy, prices, options, paper, protectors, bulk steps, delivery zones.
- Catalogs: `app/utils/catalog/learning.ts` (cards 1-3), `app/utils/catalog/business.ts` (cards 4-6). Card promo applied in `app/utils/services.ts`.
- Pricing: `app/utils/pricing/*`. `core.ts` has `makeLine`, promo, `PROMO_EXCLUDED_SERVICES`. `communicativeArabic.ts` computes 50% launch prices from `launchPromo.discountPercent`.
- Modal sections: `app/utils/sections/coaching.ts`, `business.ts`, `helpers.ts`, index in `sections/index.ts`. Types in `app/utils/serviceTypes.ts`.
- Booking selection: `app/utils/bookingSelection.ts` (`isRequestableService`, `TIER_GROUP_BY_SERVICE`).
- Calculator forms: `app/components/calculator/*`, mapped in `Calculator.tsx`.
- UI: `app/components/ServiceCard.tsx`, `ServiceSections.tsx`, `Logo.tsx`, `BookingRequest.tsx`.
- Pages: `app/page.tsx` (language gate), `app/services/page.tsx`, `app/calculator/page.tsx` (Quote Builder, hardcoded print rates), `app/orders/page.tsx` and `app/profile/page.tsx` (`ComingSoon.tsx`), `app/contact/page.tsx`.
- Writes: `app/utils/supabase/submissions.ts` inserts into `bookings`, `print_orders`, `quote_requests`, and uploads to bucket `print-documents`.
- Supabase client: `app/utils/supabase/client.ts` reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Production status
- Live at `context-kw.com` on Vercel. Vercel env vars: only the two `NEXT_PUBLIC_SUPABASE_*` keys. Never add the service role key.
- Supabase project `hdiesffpsqwdwjmajlwm` ("Context Portal", production). Guests use anon key. Staff use service role.
- Applied to production: migrations through `20261109000000_reconcile_live_schema.sql` (recreated `profiles`, `bookings`, `print_orders`, `quote_requests`, RLS, `print-documents` bucket) and `20261110000000_grant_anon_booking_insert.sql`.
- Pending: `20261111000000_bookings_request_services.sql` (NOT applied). It widens the `bookings.service_id` check to `tutoring`, `universityAdvising`, `accentCoaching`, `communicativeArabic`, `corporate`, and keeps `session_duration_hours` nullable. It was edited in place for `communicativeArabic` and has never run against production.
- `bookings` RLS: `bookings_insert_requests` (anon and authenticated, `status = 'requested'`). `bookings_select_own` for authenticated.
- Guest booking end-to-end test passed on production (user-confirmed row saved). Print orders and quote requests not yet retested on production.

## Communicative Arabic Coaching (current tier)
- EN title: Communicative Arabic Coaching. AR title: التوجيه والتواصل اللغوي العربي.
- Subcategories (original → 50% launch, KWD):
  - Conversational Gulf Arabic for Professionals: Single Diagnostic Assessment 25 → 12.5; Multi-Session Coaching Package 85 → 42.5
  - Applied Modern Standard Arabic: Single Content Literacy Consultation 30 → 15; Multi-Session Literacy Strategy Package 150 → 75
- `PROMO_EXCLUDED_SERVICES` in `core.ts` includes `communicativeArabic`, so the 50% applies once.
- Removed: `config.translation`, `config.linguisticConsultation`, `pricing/translation.ts`, `TranslationForm.tsx`, `public/images/services/translation.png`.
- Booking: `communicativeArabic` stores the chosen `rates` row as `tier_type` and `package_id` (see `bookingSelection.ts`).


## Open items
- Apply `20261111000000` to production. Use `npx supabase db push --remote --yes` from a fresh terminal (an earlier push hung in this terminal). Then confirm `has_table_privilege('anon','public.bookings','INSERT')` is true and `session_duration_hours` is nullable. Alternative: run the SQL in the Supabase SQL editor, then `migration repair`.
- Run `npm run build` and browser-test: cards, modal prices (original vs launch), calculator, booking request.
- `financialTranslation` option remains in the corporate section of `config.js` (around line 286). It is not the Translation tier. Confirm keep or rename.
- Arabic copy (new tier, tagline, protector strings) has not had native review.
- `app/components/calculator/Calculator.tsx` may be unused. Check before deleting.
- `app/calculator/page.tsx` hardcodes print, protector, and binding rates (marked PLACEHOLDER). They can drift from `config.js`.
- Quote Builder subtitle "Farwaniya Hub" is visible. Confirm wanted. Quote Builder has no language toggle.
- Custom protector count is a total across all copies (1 to 50). Confirm this rule.
- New card has no image. Provide one if wanted.
- Services header may wrap on narrow screens. Not checked.
- `npm run typecheck` once exited 2 with no output, while `npx tsc --noEmit` exits 0. Not investigated.
- Earlier REST 401 on the anon key. Guest booking later succeeded, so likely resolved. Not confirmed after the project restart.
- Stop stray `next dev`, `supabase`, or `node` processes. Delete temp root files `pushrun2.log`, `pushrun3.log`, `dev-server.out.log`, `dev-server.err.log`.
- No local Supabase (no Docker). Use `--remote` for `supabase db dump`; it hung earlier.
