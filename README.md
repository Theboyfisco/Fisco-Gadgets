# Fisco Gadgets

Premium gadget storefront built for the Nigerian market, pairing an immersive, modern shopping UI with a production-grade checkout and payment pipeline.

This repo focuses on a tactile frontend (depth galleries, smooth motion, rich product pages) and a reliable backend (Prisma + PostgreSQL + Paystack orchestration).

---

## Highlights

- Curated category and brand storefronts
- Rich product detail pages with depth gallery and specs
- Side-by-side product comparison flow
- Fast cart and checkout experience
- Paystack payment initialization and webhook-confirmed order updates
- Mobile-first UX with strong purchase CTAs

---

## Product journey

1. Discover products via landing, categories, and brand pages
2. Inspect details and compare devices side-by-side
3. Checkout quickly with server-validated order creation
4. Pay securely through Paystack
5. Receive confirmed order updates via webhook verification

---

## Tech stack (current)

**Frontend**

- Next.js `16.1.6` (App Router)
- React `19.2.3` + TypeScript `5.x`
- Tailwind CSS `v4`
- Framer Motion `12.x`

**Backend and data**

- Prisma `6.2.1`
- PostgreSQL (pooled runtime connection + direct migration connection)
- Server actions / API routes for checkout + payments

**Payments**

- Paystack initialization + webhook verification

---

## Project structure

- `app/` — routes, layouts, and page-level composition
- `components/` — reusable UI and feature components
- `actions/` — server actions for search, checkout, and payment initiation
- `lib/` — shared utilities (db, helpers)
- `prisma/` — schema, migrations, and seed scripts
- `docs/` — supporting documentation

---

## Local setup

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL (local or hosted, e.g. Supabase)

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create `.env` and set:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
PAYSTACK_SECRET_KEY="sk_..."
PAYSTACK_PUBLIC_KEY="pk_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ALERT_WEBHOOK_URL="https://your-alert-endpoint.example/webhook" # optional
FISCO_FORCE_FALLBACK_DATA="false" # optional
FISCO_ENABLE_DB_DURING_BUILD="false" # optional
```

### 3) Prepare Prisma

```bash
npx prisma generate
npx prisma migrate deploy
```

Optional seed:

```bash
npx prisma db seed
```

### 4) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Runtime pooled connection string |
| `DIRECT_URL` | Direct connection for migrations |
| `PAYSTACK_SECRET_KEY` | Server-side Paystack secret |
| `PAYSTACK_PUBLIC_KEY` | Client-side Paystack public key |
| `NEXT_PUBLIC_APP_URL` | Public base URL for redirects and webhooks |
| `ALERT_WEBHOOK_URL` | Optional webhook for operational alerts |
| `FISCO_FORCE_FALLBACK_DATA` | Force fallback mode even when DB exists (`true`/`false`) |
| `FISCO_ENABLE_DB_DURING_BUILD` | Allow DB reads during Next build phase (`true`/`false`) |
| `PAYSTACK_MOCK_AUTH_URL` | Optional local/e2e mock redirect URL for payment initialization |

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start local development server |
| `npm run build` | Create production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run test:unit` | Run unit tests (shipping, stock/order logic, validation) |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npx tsc --noEmit` | Type-check without emitting files |
| `npm run scrape:images` | Scrape and save product images |

---

## Deployment (Vercel)

1. Push your repository to GitHub
2. Import project in Vercel
3. Add all environment variables from `.env`
4. Build command: `npm run build`
5. Configure Paystack webhook:

```text
https://<your-domain>/api/paystack/webhook
```

Prisma client generation runs automatically on install via `postinstall`.

---

## Security notes

- Keep secrets only in `.env` or your deployment platform settings
- Never commit real API keys
- Rotate keys immediately if exposed
- Ensure webhook signature verification remains enabled

---

## Related docs

- `FEATURES.md`
- `BACKEND_SETUP.md`
- `deployment_guide.md`
- `info.md`

