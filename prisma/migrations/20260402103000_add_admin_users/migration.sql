-- Admin credentials store (Supabase-managed).
-- This migration is marked as applied to align Prisma history with existing DB state.
CREATE TABLE "admin_credentials" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "admin_credentials_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_credentials_username_key" ON "admin_credentials"("username");
