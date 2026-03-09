# Features and Architecture

Fisco Gadgets is a full-stack storefront focused on premium gadget shopping UX.

## Frontend UX

- Clean glassmorphism-inspired interface
- 3D interactions via reusable tilt/spotlight system
- Product depth gallery with stacked selectable thumbnails
- Scroll reveal animations and polished transitions
- Mobile-first layouts and sticky mobile purchase CTA

## Core shopping capabilities

- Product catalog grid (featured + category-based browsing)
- Category pages with visual hero sections
- Brand pages with curated brand storefront feel
- Product detail pages with technical specs
- Search overlay with keyboard shortcut (`Cmd/Ctrl + K`)
- Cart drawer with persisted local state
- Compare flow for product side-by-side evaluation

## Backend and payments

- Prisma ORM with PostgreSQL
- Server-side order creation and validation
- Paystack payment initialization
- Webhook route for payment confirmation and order updates

## Technical stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Prisma
- Zod

## Quality status

- Lint passing
- Type-check passing
- Production build passing

## Key directories

- `app/` - routes and page-level server/client components
- `components/` - reusable UI and feature components
- `actions/` - server actions for checkout/payment/search
- `prisma/` - schema, migrations, and seed setup
- `lib/` - shared server utilities (db, helpers)
