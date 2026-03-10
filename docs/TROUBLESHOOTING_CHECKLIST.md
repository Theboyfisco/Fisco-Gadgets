# Troubleshooting & Quality Checklist

## 1) Runtime / Environment
- [ ] `DATABASE_URL` is set in `.env` for full live data mode.
- [ ] `PAYSTACK_SECRET_KEY` is set for webhook signature verification.
- [ ] Run `npm run lint` and confirm no ESLint errors.
- [ ] Run `npm run build` and confirm successful production compile.

## 2) Data Loading Fallback Behavior
- [ ] Start app without `DATABASE_URL`; homepage and layout should still render with fallback categories/products.
- [ ] Verify navigation still shows categories with fallback dataset.
- [ ] Verify hero/featured section renders using fallback content.

## 3) Payment/Webhook Safety Checks
- [ ] Webhook rejects missing signature requests (401).
- [ ] Webhook rejects malformed JSON payloads (400).
- [ ] Webhook uses timing-safe signature comparison.
- [ ] Webhook keeps idempotency behavior for already-paid order references.

## 4) UI/UX Consistency Pass (New Design)
- [ ] Header, hero, cards, and footer all use the same glassmorphism + neon accent language.
- [ ] Mobile menu style matches desktop visual tone.
- [ ] CTA contrast (text/background) is readable on dark backgrounds.
- [ ] Category cards and product cards use consistent corner radii and border opacity.

## 5) Security & Risk Review (Current Status)
### Fixed in this pass
- Added graceful no-DB fallback to avoid runtime crashes when `DATABASE_URL` is missing.
- Hardened webhook signature check using `crypto.timingSafeEqual`.
- Added malformed JSON handling for webhook requests.

### Remaining recommendations
- Add API rate limiting for checkout/payment endpoints.
- Add stricter validation on webhook event schema (zod or similar).
- Replace generic console logs with structured redacted logging.
- Consider CSP + security headers in `next.config.ts` or middleware.

## 6) Release Gate
- [ ] New seed data is applied using `npx prisma db seed` in staging/prod pipeline.
- [ ] Manual smoke test: home, category, product, cart, checkout, webhook endpoint.
- [ ] Capture fresh screenshot of homepage after final merge for QA artifact.
