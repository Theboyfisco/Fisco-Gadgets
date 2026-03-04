# Fisco Gadgets — Backend Setup & Deployment Guide

## 🛠 Supabase Configuration

### 1. Database Connection

Supabase uses Connection Pooling. In your `prisma/schema.prisma`, we use two URLs:

- `DATABASE_URL`: Transaction mode (usually port 6543) for application queries.
- `DIRECT_URL`: Session mode (usually port 5432) for migrations.

**Format**:

- `DATABASE_URL="postgres://postgres.[YOUR_PROJECT_ID]:[YOUR_PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"`
- `DIRECT_URL="postgres://postgres.[YOUR_PROJECT_ID]:[YOUR_PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"`

### 2. Row Level Security (RLS)

- **Status**: Enabled (Supabase default).
- **Prisma Context**: Prisma bypasses RLS when using the `service_role` or a superuser (like `postgres`). For this internal e-commerce backend, we interact via the `postgres` user, so RLS doesn't block the server actions.

## 💳 Paystack Integration Setup

1. **Environment Variables**:
   - `PAYSTACK_SECRET_KEY`: Get this from your Paystack Dashboard (Settings > API Keys & Webhooks).
   - `NEXT_PUBLIC_APP_URL`: Your production URL (e.g., `https://fiscogadgets.com.ng`).

2. **Webhook URL**:
   - Set your webhook URL in Paystack Dashboard to: `https://your-domain.com/api/paystack/webhook`.
   - Ensure the event `charge.success` is selected.

## 🚀 Deployment Checklist

### 1. Environment Variables (Vercel)

Add the following to your Vercel project settings:

```bash
DATABASE_URL=...
DIRECT_URL=...
PAYSTACK_SECRET_KEY=...
NEXT_PUBLIC_APP_URL=...
```

### 2. Database Migrations

Run these commands locally before deploying, or as part of your CI/CD:

```bash
# Apply migrations to Supabase
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 3. Verification Workflow

1. **Product Seed**: Ensure your database has products (use a seed script or manual entry in Supabase Table Editor).
2. **Checkout**: Select items -> Proceed to Checkout -> Enter Details.
3. **Payment**: Redirect to Paystack -> Complete Test Payment.
4. **Callback**: Verify redirect to `/checkout/success`.
5. **Database Check**: Confirm the order status in Subabase is now `PAID`.

---

_Senior Backend Engineering Guide — Fisco Gadgets_
