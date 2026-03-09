# Backend Setup

This document covers backend environment setup for local development and production.

## 1. Required environment variables

Create/update `.env` with the following:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
PAYSTACK_SECRET_KEY="sk_..."
PAYSTACK_PUBLIC_KEY="pk_..."
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## 2. Database connection model

- `DATABASE_URL`: pooled connection (runtime queries)
- `DIRECT_URL`: direct connection (migrations)

For Supabase, pooled and direct ports are usually different.

## 3. Prisma workflow

```bash
npx prisma generate
npx prisma migrate deploy
```

Optional local seed (if configured):

```bash
npx prisma db seed
```

## 4. Paystack setup

- Set webhook URL to:

```text
https://your-domain.com/api/paystack/webhook
```

- Ensure your server has `PAYSTACK_SECRET_KEY`
- Confirm webhook signature verification remains enabled in code

## 5. Backend sanity checks

- Run lint/type/build:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

- Validate checkout end-to-end:
1. Add product to cart
2. Submit checkout details
3. Redirect to Paystack
4. Complete test payment
5. Confirm order status updates

## Security checklist

- Do not store secrets in Markdown files
- Rotate any keys that were ever committed or shared
- Keep production keys only in deployment platform env settings
