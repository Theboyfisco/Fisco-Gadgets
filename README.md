# Fisco Gadgets

Fisco Gadgets is a premium gadget storefront built for the Nigerian market, combining a polished, immersive shopping interface with a practical, production-ready checkout flow.

It is designed to feel modern and tactile on the front end (3D interactions, depth galleries, smooth motion), while staying reliable on the back end (Prisma + PostgreSQL + Paystack payment orchestration).

---

## What this app is

At its core, Fisco Gadgets is an end-to-end e-commerce experience focused on discovery and confidence:

- **Discover** products through curated categories and brand pages.
- **Evaluate** devices with rich product pages and side-by-side comparison.
- **Decide** with a fast cart and checkout flow.
- **Pay securely** through Paystack.
- **Track order integrity** through server-side validation and webhook-driven updates.

---

## Core user journeys

### 1) Browse and discover

- Landing experience with featured products
- Category pages for thematic exploration
- Brand storefront pages for brand-led shopping
- Search overlay with keyboard shortcut support (`Cmd/Ctrl + K`)

### 2) Inspect and compare

- Detailed product pages with specs and visual depth
- Stacked gallery interactions for better product context
- Compare workflow for side-by-side decision support

### 3) Buy with confidence

- Persistent cart flow
- Checkout form with server-side order creation
- Paystack initialization for payment handoff
- Webhook endpoint to confirm payment outcomes and update order state

---

## Experience principles

Fisco Gadgets emphasizes:

- **Premium feel**: glassmorphism-inspired UI, depth, animation, and motion polish
- **Clarity**: clean information hierarchy from listing to checkout
- **Responsiveness**: mobile-first behavior with focused purchase CTAs
- **Reliability**: validated backend flows and payment confirmation pipeline

---

## Technical architecture

### Frontend

- Next.js 16 App Router
- React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion

### Backend and data

- Prisma ORM
- PostgreSQL (pooled runtime connection + direct migration connection)
- Server actions / API routes for checkout and payment workflows

### Payments

- Paystack payment initialization
- Paystack webhook verification and order update handling

---

## Project structure

- `app/` — routes, layouts, and page-level composition
- `components/` — reusable UI and feature components
- `actions/` — server actions for search, checkout, and payment initiation
- `lib/` — shared utilities (database, helpers)
- `prisma/` — schema, migrations, and seed scripts
- `docs/` — additional documentation

---

## Local development

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL database (or managed Postgres such as Supabase)

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create `.env` with:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
PAYSTACK_SECRET_KEY="sk_..."
PAYSTACK_PUBLIC_KEY="pk_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
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

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

- `npm run dev` — start local development server
- `npm run build` — create production build
- `npm run start` — run production server
- `npm run lint` — run ESLint checks
- `npx tsc --noEmit` — type-check without emitting files

---

## Deployment notes

- Default target: Vercel
- Prisma client is generated on install via `postinstall`
- Ensure all environment variables are configured in your deployment platform
- Configure Paystack webhook to:

```text
https://<your-domain>/api/paystack/webhook
```

---

## Security and operations

- Keep secrets only in `.env` / deployment settings
- Never commit real API keys to the repository
- Rotate exposed keys immediately
- Verify webhook signature validation stays enabled

---

## Related docs

- [FEATURES.md](./FEATURES.md)
- [BACKEND_SETUP.md](./BACKEND_SETUP.md)
- [deployment_guide.md](./deployment_guide.md)
- [info.md](./info.md)

