# MEMORY.md

## Session directives
- Token-saving: do not scan unrelated files; target only config blocks and immediate UI layout fields.
- Do not run full TypeScript emits or lint deep-dives until the lines are written.
- Keep terminal status messages to 3 sentences max.

## Project architecture
- Project: Context (Kuwait). Working dir: `M:\context-portal`. Use absolute paths. Git not installed.
- Stack: Next.js 14 App Router, React 18, TypeScript, Tailwind 3, Supabase. Hosted on Vercel at `context-kw.com`.
- Single source for copy, prices, options, delivery modes, session lengths, packages: `config.js`.
- Service cards (catalogs: `app/utils/catalog/learning.ts` for cards 1-4, `app/utils/catalog/business.ts` for cards 5-7):
  1. Tutoring (`config.tutoring`)
  2. Accent Coaching & Career Support (`config.accentCoaching`)
  3. Communicative Arabic Coaching (`config.communicativeArabic`)
  4. Resume Writing & Review (`config.resumeWriting`), new this session
  5. University advising (`config.universityAdvising`)
  6. Corporate (`config.corporate`), option key `financialReportReview`
  7. Print shop (`config.printShop`)
- Pricing: `app/utils/pricing/*` (`core.ts` holds shared promo logic; `resumeWriting.ts`, `communicativeArabic.ts`, `accent.ts`, `tutoring.ts`, ...).
- Modal sections: `app/utils/sections/coaching.ts`, `business.ts`, `helpers.ts`; index in `sections/index.ts`. Types: `app/utils/serviceTypes.ts`.
- Selection and booking mapping: `app/utils/bookingSelection.ts`.
- UI: `app/components/ServiceCard.tsx`, `ServiceModal.tsx`, `BookingRequest.tsx`, `ServiceSections.tsx`. Calculator forms in `app/components/calculator/*`; `Calculator.tsx` holds the FORMS map.
- Writes: `app/utils/supabase/submissions.ts` inserts into `bookings`, `print_orders`, `quote_requests`, and uploads to bucket `print-documents`.
- Supabase project `hdiesffpsqwdwjmajlwm` (production). Guests use anon key. Vercel env vars: only the two `NEXT_PUBLIC_SUPABASE_*` keys. Never add the service role key.

## Changes made this session (2026-11-13)
- Accent Coaching card (card 2): title and subtitle in `config.js` (`accentCoaching`) match the requested EN/AR text.
- Accent Coaching: added `deliveryModes` (Online, In-Person at Center) in `config.js`, and a "Delivery modes" section in `app/utils/sections/coaching.ts`.
- Accent Coaching: added a "Session type" section with a Free 15-Minute Consultation (0.000 KWD), priced in `app/utils/pricing/accent.ts` via `CONSULTATION_PRICE`. `bookingSelection.ts` passes the consultation flag and hides `sessions` while it is chosen.
- ServiceCard: shows "0.000 KWD (Free 15-min trial)" for tutoring, communicativeArabic, accentCoaching, and resumeWriting.

- Resume Writing & Review added:
  - `config.js` `resumeWriting` block: tiers Resume Review & ATS Audit (15 -> 7.5 KWD launch) and Full Resume Writing (30 -> 15); add-ons Tailored Cover Letter (10 -> 5) and LinkedIn Profile Optimization (15 -> 7.5); delivery Online / In-Person; 50% launch promo.
  - New files: `app/utils/pricing/resumeWriting.ts`, `app/components/calculator/ResumeWritingForm.tsx`.
  - Wired into `serviceTypes.ts`, `pricing/core.ts` (`PROMO_EXCLUDED_SERVICES`), `pricing/index.ts`, `sections/coaching.ts`, `sections/index.ts`, `catalog/learning.ts`, `Calculator.tsx`, `bookingSelection.ts` (`TIER_GROUP_BY_SERVICE` = `rates`, `quoteSelection` case, hidden groups incl. `addons`), and `submissions.ts` `BookingPayload.serviceId`.
- `supabase/migrations/20261111000000_bookings_request_services.sql`: `bookings_service_id_check` now includes `resumeWriting` (file edited, not yet applied to production).
- `npm run build` passed (exit 0, all 9 pages) after the Resume Writing changes.

## Previous session changes (still in place)
- Corporate option `financialReportReview` titled "Financial Report Review & Business Layouts" (مراجعة وتنسيق التقارير المالية للمؤسسات).
- Communicative Arabic: Online / In-Person delivery, free 15-minute consultation, 50% launch promo.
- Deleted `TranslationForm.tsx` and `pricing/translation.ts`.
- Contact page: Instagram, TikTok, Facebook links (`@contextq8`).
- Logo: `app/components/Logo.tsx` loads `/Logo%20(New).png`.

## Current system state
- `npm run build` passed after the Resume Writing changes.
- `npx tsc --noEmit` result after the Accent consultation change was not confirmed (no exit status captured).
- Not browser-tested: new logo, social links, Accent card copy and image, Accent consultation and delivery, Resume Writing form and booking, Communicative Arabic consultation and booking.
- Production DB: `20261111000000` was applied earlier, but the edited file (now including `resumeWriting`) is NOT applied. Bookings with `resumeWriting` will fail on production until a new migration runs.
- Production bookings: guest booking end-to-end passed earlier. Print orders and quote requests not retested.

## Unresolved variables
- Corporate rename: the new English and Arabic name for `financialReportReview` has not been provided. Current title unchanged.
- Resume Writing Arabic copy (tiers, add-ons, description, consultation) is an untested draft and needs native review.
- Accent Arabic copy (title, subtitle, consultation, delivery) needs native review.
- Verify the Accent modal's `sessions` group id matches the hidden-groups list in `bookingSelection.ts`.
- Verify the Resume Writing `addons` group saves to `selection.addons` as expected in the booking request.
- Quote label "Interview Prep" remains in `app/utils/pricing/accent.ts` and the `interviewPrep` option. Rename not decided.
- Session lengths for Communicative Arabic and Resume Writing are not wired into pricing (flat packages); `session_duration_hours` saved as null for them.
- `app/calculator/page.tsx` hardcodes print, protector, and binding rates (marked PLACEHOLDER); can drift from `config.js`.
- `app/components/calculator/Calculator.tsx` may be unused. Check before deleting.
- Stray processes (`next dev`, `supabase`, `node`) and temp logs (`pushrun2.log`, `pushrun3.log`, `dev-server.out.log`, `dev-server.err.log`) may remain in root.

## Session changes (2026-11-13, later session)
- Free Trial and Delivery Modes: already on card 02 (Accent Coaching). No edit needed.
- Session lengths: `sessionDurations` is now `[0.5, 1, 1.5, 2]` with `shortSessionRatio: 0.6` in `config.js` for tutoring, accentCoaching, and communicativeArabic (same 60% rule as universityAdvising).
  - `app/utils/pricing/tutoring.ts` and `accent.ts` bill 30-min sessions at 60% of the hourly rate (`billedRate`); tutoring strikethrough uses the same factor.
  - Communicative Arabic: config only. Its session lengths are not wired into pricing (flat packages), so the 30-min option changes no price.
- Resume services moved into card 02 (Accent Coaching), and the standalone Resume Writing card was removed from `app/utils/catalog/learning.ts`.
  - `config.js` tier renamed: "Resume Review & ATS Audit" -> "Resume Review" (مراجعة السيرة الذاتية).
  - `app/utils/sections/coaching.ts` `accentCoaching`: resume tiers appended to the "Hourly rates & resume services" group; new "addons" group (multiple) for Tailored Cover Letter and LinkedIn Profile Optimization.
  - `app/utils/bookingSelection.ts`: `RESUME_TIER_IDS`, `isResumeSelected`, `RESUME_HIDDEN_GROUPS`. `quoteSelection` prices resume tiers via `quoteResumeWriting`. `bookingFields` sets no session length and no consultation for resume tiers.
  - `app/components/ServiceModal.tsx`: when a resume tier is chosen, shows "addons" and hides focus/durations/sessions/consultation.
- `npx tsc --noEmit` passed (exit 0) after these changes. Not browser-tested.

## Known issues from this session (open)
- BUG: for resume bookings from card 02, `bookingFields` takes `tierType` from `TIER_GROUP_BY_SERVICE.accentCoaching` (`"focus"`), so `tier_type` saves empty. It should use the `rates` value (the resume tier id) when `isResume` is true.
- Resume bookings are sent with `serviceId: "accentCoaching"`. Production `bookings_service_id_check` must allow `accentCoaching` (migration `20261111000000` lists it, but the edited file is not applied to production). Verify before testing bookings.
- Card 02 still shows "0.000 KWD (Free 15-min trial)" on the card even when resume is chosen (only hidden inside the modal).
- Card starting price (`learning.ts`) for Accent Coaching uses only accent rates, not resume tiers.
- `SERVICE_SECTIONS.resumeWriting` in `app/utils/sections/coaching.ts` is now unused by the catalog. Check before deleting.
- `/calculator` page still has its separate `ResumeWritingForm.tsx`, which still shows "Resume Review & ATS" wording if any copy remains. Not updated.
- Corporate rename (`financialReportReview` in `config.js` ~line 336) still pending. Waiting for the new English and Arabic names.


## Commands
- `npm run dev`, `npm run lint`, `npm run build`, `npx tsc --noEmit`
- `npx supabase db push --remote --yes`, `npx supabase migration list --remote`
- No test runner. No local Supabase (no Docker). Use `--remote` only.

## Session changes (2026-11-13, latest)
- Modal groups (`app/utils/sections/coaching.ts`): accentCoaching and communicativeArabic rates/packages group moved above "Session type" and titled "Choose an option" (Arabic "اختر خياراً"). Card 01's "Choose an option" is generated in `bookingSelection.ts`. Card 04 still says "Service levels & launch prices".
- Accent labels (`config.js`): `accentReduction` -> "Accent Coaching"; `interviewPrep` -> "Job Interview Preparation". Arabic labels unchanged.
- Removed the `combined` ("Accent Coaching + Interview Prep") rate and label from `config.js` and `pricing/accent.ts` (`AccentRateKey` = accentCoaching | interviewPrep).
- Double-discount fix: `accentCoaching` added to `PROMO_EXCLUDED_SERVICES` (`pricing/core.ts`). `quoteAccent` bills `accentLaunchRate`.
- 30-minute sessions (accent and tutoring): billed per 30 minutes at launch rate x `shortSessionRatio` (0.6), quantity = number of sessions. Labels read "per 30 minutes" / "30 دقيقة". Hourly sessions unchanged.
- `catalog/learning.ts` accentCoaching: `startingPrice` = lowest launch rate; `startingOriginalPrice` added so the strikethrough shows like cards 01 and 03.
- Logo: `public/Logo (New).png` made transparent and cropped to 680x637 (was 1024x1024 opaque). Backup: `C:\Users\Omar\AppData\Local\Temp\Logo (New) original.png` (275,784 bytes).
- Floating WhatsApp button (`app/components/WhatsAppButton.tsx`): heartbeat animation (`animate-whatsapp-heartbeat`, keyframe in `app/globals.css`) plus green `animate-ping` halo (#25D366).
- `npx tsc --noEmit` exit 0 after the last edits. Not browser-tested.

## Open issues (from this session)
- LOGO TEXT CHANGED UNINTENDEDLY: the first preview read "Translation • Education • Training", but the processed `Logo (New).png` reads "Language & Document Center". Confirm the correct wording; restore the backup if needed.
- 30-minute price rows and the modal price display (`ServiceModal`) are not verified in the browser and may still say "per hour" in places.
- Accent Coaching card badge (`ServiceCard.tsx`) still shows the shared "0.000 KWD (Free 15-min trial)" text.
- Accent Coaching Arabic name still "تطوير اللهجة الإنجليزية".
- Heartbeat is on the floating button only; the contact page button has ping only.
