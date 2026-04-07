# NOXTECH

NOXTECH is a premium gadget storefront for the Nigerian market, built with Next.js App Router, Prisma, PostgreSQL, and Paystack.

It includes:
- storefront browsing (home, category, brand, product)
- cart, wishlist, compare, and search
- checkout + promo validation
- Paystack payment initialization and webhook confirmation
- customer account routes
- admin tools for products, catalog, promos, orders, and audit logs

## Stack
- Next.js `16.1.6` (App Router)
- React `19.2.3`
- TypeScript `5.x`
- Tailwind CSS `v4`
- Prisma `6.2.1`
- PostgreSQL
- Paystack

## Project Structure
- `app/` route segments and API handlers
- `components/` UI + feature components
- `actions/` server actions
- `lib/` shared utilities/auth/config
- `services/` domain services (orders, promo, shipping)
- `prisma/` schema, migrations, seed
- `tests/` unit and e2e tests

## Quick Start
### 1) Prerequisites
- Node.js 20+
- npm
- PostgreSQL

### 2) Install
```bash
npm install
```

### 3) Configure `.env`
```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
PAYSTACK_SECRET_KEY="sk_..."
PAYSTACK_PUBLIC_KEY="pk_..."
RESEND_API_KEY="re_..."
SUPPORT_FROM_EMAIL="NOXtech Support <onboarding@resend.dev>"
SUPPORT_INBOX_EMAIL="support@noxtech.com.ng"
CLEANUP_CRON_SECRET="replace-with-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ALERT_WEBHOOK_URL="https://your-alert-endpoint.example/webhook" # optional
NOXTECH_FORCE_FALLBACK_DATA="false" # optional
NOXTECH_ENABLE_DB_DURING_BUILD="false" # optional
```

Optional public support fields:
```bash
NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER="2347031606782"
NEXT_PUBLIC_SUPPORT_WHATSAPP_DISPLAY="+234 703 160 6782"
NEXT_PUBLIC_SUPPORT_EMAIL="support@noxtech.com.ng"
NEXT_PUBLIC_SUPPORT_SALES_EMAIL="sales@noxtech.com.ng"
```

### 4) Prisma setup
```bash
npx prisma generate
npx prisma migrate deploy
```

Optional seed:
```bash
npx prisma db seed
```

### 5) Run
```bash
npm run dev
```
Open `http://localhost:3000`.

## Scripts
- `npm run dev` start dev server (webpack mode)
- `npm run dev:turbo` start dev server (turbopack)
- `npm run dev:webpack` explicit webpack dev mode
- `npm run clean:next` remove `.next` cache/build output
- `npm run build` typecheck + production build
- `npm run start` start production server
- `npm run lint` run ESLint
- `npm run test:unit` run unit tests
- `npm run test:e2e` run Playwright tests
- `npm run scrape:images` run image scrape utility

## Key Routes
### Storefront
- `/`
- `/browse`
- `/category/[id]`
- `/brand/[id]`
- `/product/[id]`
- `/search`
- `/compare`
- `/wishlist`
- `/checkout`
- `/checkout/success`

### Account
- `/account`
- `/account/login`
- `/account/register`
- `/account/profile`
- `/account/orders`

### Admin
- `/admin/setup`
- `/admin/login`
- `/admin/products`
- `/admin/catalog`
- `/admin/promos`
- `/admin/orders`
- `/admin/audit`

## API Endpoints (Selected)
- `POST /api/paystack/webhook`
- `GET /api/promos`
- `POST /api/orders/cleanup`
- `POST /api/support/contact`
- `GET/POST /api/account/lists`

## Deployment (Vercel)
1. Push repo to GitHub
2. Import project into Vercel
3. Add all required environment variables
4. Use build command: `npm run build`
5. Set Paystack webhook URL:

```text
https://<your-domain>/api/paystack/webhook
```

`prisma generate` runs automatically via `postinstall`.

## Security Notes
- Never commit real secrets
- Keep webhook signature verification enabled
- Restrict cron endpoint with `CLEANUP_CRON_SECRET`
- Rotate exposed keys immediately


