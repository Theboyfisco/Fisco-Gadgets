# Fisco Gadgets

Fisco Gadgets is a full-stack e-commerce app for premium gadgets in Nigeria.
It includes catalog browsing, search, cart, checkout, order creation, and Paystack-backed payment flow.

## Highlights

- Modern Next.js 16 App Router architecture
- 3D-enhanced UI interactions (tilt, spotlight, depth cards)
- Product detail depth gallery with stacked thumbnails
- Category and brand showcase pages
- Global cart + comparison flows
- Checkout + Paystack integration
- Prisma + PostgreSQL backend

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Prisma ORM
- PostgreSQL

## Scripts

- `npm run dev` - Start development server
- `npm run lint` - Lint the project
- `npx tsc --noEmit` - Type-check only
- `npm run build` - Build for production
- `npm run start` - Start production server

## Quick start

1. Install dependencies

```bash
npm install
```

2. Configure environment variables in `.env`

3. Run locally

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Verification

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Notes

- `next.config.ts` is configured with:
  - Turbopack root pinning (`turbopack.root = process.cwd()`)
  - Allowed image quality values used by the UI
- Remote media source: `images.unsplash.com`
- Never commit real keys/secrets to Markdown or source files

## Docs

- [FEATURES.md](./FEATURES.md)
- [BACKEND_SETUP.md](./BACKEND_SETUP.md)
- [deployment_guide.md](./deployment_guide.md)
- [info.md](./info.md)
