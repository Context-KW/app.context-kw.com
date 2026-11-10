# MEMORY.md

## Session directives (read first)
- 🚨 TOKEN-SAVING DIRECTIVE: DO NOT SCAN UNRELATED FILES.
- Apply requested changes by targeting ONLY configuration blocks and immediate UI layout fields.
- Do NOT run full-project TypeScript emits or lint deep-dives until the lines are written.
- Do NOT scan files that do not require layout edits.
- Keep terminal status messages to a maximum of 3 sentences.
- Execute visual overrides immediately.

## Project architecture
- Project: Context (Kuwait). Working dir: `m:\context-portal`. Use absolute paths. Git is not installed.
- Stack: Next.js 14 App Router, React 18, TypeScript, Tailwind 3, Supabase. Hosted on Vercel at `context-kw.com`.
- Single source for copy, prices, options, delivery modes, session lengths, packages: `config.js`.
- Six service cards, defined in catalogs: `app/utils/catalog/learning.ts` (cards 1-3), `app/utils/catalog/business.ts` (cards 4-6).
  1. Tutoring (`config.tutoring`)
  2. Accent coaching (`config.accentCoaching`)
  3. Communicative Arabic Coaching (`config.communicativeArabic`), replaces Translation
  4. University advising (`config.universityAdvising`)
  5. Corporate (`config.corporate`), option key `financialReportReview`
  6. Print shop (`config.printShop`)
- Pricing: `app/utils/pricing/*` (`core.ts`, `communicativeArabic.ts`, `tutoring.ts`, ...). Shared promo logic in `core.ts`.
- Modal sections: `app/utils/sections/coaching.ts`, `business.ts`, `helpers.ts`. Types: `app/utils/serviceTypes.ts`.
- Selection and booking mapping: `app/utils/bookingSelection.ts` (`quoteSelection`, `bookingFields`, consultation lock groups).
- UI: `app/components/ServiceCard.tsx`, `ServiceModal.tsx`, `BookingRequest.tsx`, `ServiceSections.tsx`. Calculator forms in `app/components/calculator/*`.
- Writes: `app/utils/supabase/submissions.ts` inserts into `bookings`, `print_orders`, `quote_requests`, and uploads to bucket `print-documents`.
- Supabase client: `app/utils/supabase/client.ts` reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Supabase project `hdiesffpsqwdwjmajlwm` ("Context Portal", production). Guests use anon key. Staff use service role. Vercel env vars: only the two `NEXT_PUBLIC_SUPABASE_*` keys. Never add the service role key.

## Changes made in the latest session
- Corporate: option `financialReportReview` titled "Financial Report Review & Business Layouts" (مراجعة وتنسيق التقارير المالية للمؤسسات). Already present in `config.js`.
- Communicative Arabic: Delivery modes "Online" (أونلاين) and "In-Person at Center" (حضوري في المركز) in `config.js` and the modal.
- Communicative Arabic: Free 15-Minute Consultation (0.000 KWD) added to `app/utils/sections/coaching.ts` and priced in `app/utils/pricing/communicativeArabic.ts` (uses `CONSULTATION_PRICE` from `tutoring.ts`).
- `app/utils/bookingSelection.ts`: consultation passed into the Communicative Arabic quote; the `rates` group is hidden while the consultation is chosen; `deliveryMode` saved for every service that has a delivery selection.
- `app/components/ServiceModal.tsx`: the delivery pin and lock apply only to tutoring. Communicative Arabic keeps Online and In-Person selectable with the consultation.
- `app/components/ServiceCard.tsx`: Communicative Arabic card shows "0.000 KWD (Free 15-min trial)".
- Card image: `public/images/services/communicative-arabic.jpg` (JPEG, 107,933 bytes), referenced from `app/utils/catalog/learning.ts`.
- Production migration check: `npx supabase db push --remote --yes` reported "Remote database is up to date". `npx supabase migration list --remote` shows `20261111000000` applied on remote.

## Current system state
- `npx tsc --noEmit` passes (last run after the image change).
- `npm run build` passed earlier in this session, before the image change. Not rerun since.
- Browser test not run on the new card image, consultation delivery options, or booking request.
- Production bookings: guest booking end-to-end test passed earlier. Print orders and quote requests not retested on production.

## Unresolved variables
- `bookings_service_id_check` accepts `communicativeArabic` per the migration file, but this has not been confirmed with a direct query against production.
- Session lengths (1, 1.5, 2 hours) are in `config.js` for Communicative Arabic but not wired to pricing. Packages are flat, and `session_duration_hours` is saved as null.
- Arabic copy for the new tier, tagline, and protector strings has not had native review.
- Confirm: "Farwaniya Hub" subtitle in Quote Builder, custom protector count rule (1 to 50 total).
- `app/components/calculator/Calculator.tsx` may be unused. Check before deleting.
- `app/calculator/page.tsx` hardcodes print, protector, and binding rates (marked PLACEHOLDER). They can drift from `config.js`.
- `npm run typecheck` once exited 2 with no output. Not investigated.
- Stray processes (`next dev`, `supabase`, `node`) and temp files `pushrun2.log`, `pushrun3.log`, `dev-server.out.log`, `dev-server.err.log` remain in the root.

## Commands
- `npm run dev`, `npm run lint`, `npm run build`
- `npx tsc --noEmit`
- `npx supabase db push --remote --yes`
- `npx supabase migration list --remote`
- No test runner. No local Supabase (no Docker). Use `--remote` only.
