# Fisco Gadgets — Feature Guide & Implementation Details

Fisco Gadgets is a premium, high-conversion e-commerce frontend designed for gadget retailers. It prioritizes speed, minimalist aesthetics, and mobile-first accessibility.

## 🛠 Backend Architecture

- **Database**: PostgreSQL hosted on **Supabase** with connection pooling (PgBouncer).
- **ORM**: **Prisma 6.2.1** for type-safe database queries and migrations.
- **Order Management**:
  - Secure Server Actions for order creation with Prisma transactions.
  - Server-side price and stock verification (never trust client data).
  - Validation via **Zod** (email, phone, shipping).
- **Payments**:
  - Integrated with **Paystack** for NGN transactions.
  - Secure Webhook handler with **HMAC SHA512 signature verification**.
  - Automatic order status updates (`PENDING` -> `PAID`).
- **Shipping**:
  - Modular shipping service with location-based fee logic (Asaba-specific free zone).

## 🚀 Core Features

### 1. Dynamic Bento Grid Storefront

- **Visual Hierarchy**: Uses a bento-style grid to emphasize featured products while maintaining a clean scan-line for other items.
- **Glassmorphism 2.0**: Sophisticated use of background blurs and translucent borders for a premium "Apple-style" feel.
- **Framer Motion Animations**: Smooth scale-up effects on hover and staggered entrance animations for product cards.

### 2. High-Performance Search Experience 🔍

- **React Portals**: The search overlay is rendered via `createPortal`, ensuring it stays on top of all other elements by escaping the header's stacking context.
- **Keyboard Shortcuts**: Power users can trigger search instantly with `Cmd+K` or `Ctrl+K`.
- **Intelligent Results**: Real-time filtering with trending categories and product suggestions.
- **Navigation Shortcuts**: Pressing `Enter` automatically navigates to the first search result.

### 3. Advanced Product Detail Views 📱

- **Technical Specs Table**: Automatically generates a clean, side-by-side comparison of gadget specifications.
- **Adaptive Layout**: Specs are always visible on mobile/tablet for quick comparison, while desktop viewers see them on hover to maintain a minimalist look.
- **Trust Indicators**: Integrated shipping guarantees, authentic warranty badges, and secure payment highlights.

### 4. Seamless Shopping Experience 🛒

- **Global Cart State**: Lightweight React Context manager for cart operations (Add/Remove/Toggle).
- **Persistent Storage**: Syncs automatically with `LocalStorage` so users don't lose their cart on refresh.
- **Slide-in Cart Drawer**: A non-disruptive cart interface that allows users to keep shopping while reviewing items.
- **Mobile-First CTAs**: A `StickyBottomCTA` ensures "Add to Cart" and "WhatsApp Buy" are always within thumb-reach on mobile devices.

## 🛠 Technical Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (using `@theme` and `oklch` colors)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: [Geist Sans & Mono](https://vercel.com/font)
- **Deployment Ready**: Optimized for Vercel with zero TypeScript or Lint errors.

## 🏗 Implementation Chronology

1. **Foundation**: Initialized Next.js 15 and configured the Zinc/Emerald dark theme.
2. **Core Components**: Developed the `BentoProductCard`, `CartDrawer`, and `SpecComparison` systems.
3. **Responsive Refinement**: Implemented the mobile-first `StickyBottomCTA` and scroll-aware `Navbar`.
4. **UX Overhaul**: Added the `SearchOverlay` with React Portal support and keyboard accessibility.
5. **Quality Polish**: Audited and fixed all broken image assets, opacity failures, and dead navigation links.
6. **Documentation**: Finalized project overview and feature guides.

---

_Official Platform Guide for Fisco Gadgets_
