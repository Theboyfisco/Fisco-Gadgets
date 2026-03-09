# Deployment Guide (Vercel)

Use this checklist to deploy Fisco Gadgets safely.

## 1. Push code

```bash
git add .
git commit -m "chore: prepare deployment"
git push
```

## 2. Import project in Vercel

1. Open [https://vercel.com](https://vercel.com)
2. Add new project
3. Import this repository

## 3. Configure environment variables

Add these in Vercel project settings:

- `DATABASE_URL`
- `DIRECT_URL`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`
- `NEXT_PUBLIC_APP_URL`

Set `NEXT_PUBLIC_APP_URL` to your actual production domain.

## 4. Build and deploy

Vercel build command (default):

```bash
npm run build
```

Prisma client generation is handled by `postinstall` in `package.json`.

## 5. Post-deploy checks

- Home page loads
- Category pages load
- Product page loads with gallery/images
- Cart and compare work
- Checkout initializes payment
- Paystack webhook endpoint is reachable

## 6. Troubleshooting

- If image quality warnings appear, verify `images.qualities` in `next.config.ts`
- If Turbopack root warnings appear, verify `turbopack.root = process.cwd()`
- If DB errors appear, re-check `DATABASE_URL` and `DIRECT_URL`

## 7. Security reminder

If any key was exposed in docs/history, rotate it immediately.
