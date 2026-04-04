import crypto from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";

const CUSTOMER_COOKIE = "noxtech_customer_session_v1";
const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 24;
const REMEMBER_ME_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function sanitizeCustomer(customer: { id: string; email: string; fullName: string | null }) {
  return {
    id: customer.id,
    email: customer.email,
    fullName: customer.fullName,
  };
}

export async function createCustomerUser(input: { email: string; fullName?: string; password: string }) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  return prisma.customer.create({
    data: {
      email: input.email.toLowerCase().trim(),
      fullName: input.fullName?.trim() || null,
      passwordHash,
    },
    select: { id: true, email: true, fullName: true },
  });
}

export async function authenticateCustomer(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const customer = await prisma.customer.findUnique({
    where: { email: normalizedEmail },
  });
  if (!customer) return null;

  const ok = await bcrypt.compare(password, customer.passwordHash);
  if (!ok) return null;

  return sanitizeCustomer(customer);
}

export async function createCustomerSession(
  customerId: string,
  options?: {
    rememberMe?: boolean;
  },
) {
  const ttlMs = options?.rememberMe ? REMEMBER_ME_SESSION_TTL_MS : DEFAULT_SESSION_TTL_MS;
  const rawToken = crypto.randomBytes(32).toString("hex");
  const sessionTokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + ttlMs);

  await prisma.customerSession.create({
    data: {
      customerId,
      sessionTokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ttlMs / 1000,
    path: "/",
  });
}

export async function clearCustomerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE)?.value;

  if (token) {
    await prisma.customerSession
      .deleteMany({
        where: { sessionTokenHash: hashToken(token) },
      })
      .catch(() => null);
  }

  cookieStore.set(CUSTOMER_COOKIE, "", { maxAge: 0, path: "/" });
}

export async function getCurrentCustomer() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.customerSession.findFirst({
    where: {
      sessionTokenHash: hashToken(token),
      expiresAt: { gt: new Date() },
    },
    include: {
      customer: {
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      },
    },
  });

  if (!session?.customer) return null;
  return sanitizeCustomer(session.customer);
}

export async function requireCustomer() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/account/login");
  }
  return customer;
}

export function getCustomerCookieName() {
  return CUSTOMER_COOKIE;
}
