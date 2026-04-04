import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

const ADMIN_COOKIE = "noxtech_admin_session_v1";
const SESSION_TTL_MS = 1000 * 60 * 60 * 6;

const ADMIN_COOKIE_SECRET = process.env.ADMIN_SECRET || "";

type AdminCredentialRecord = {
  id: string;
  username: string;
  password_hash: string;
};

function normalizeAdminUsername(username: string) {
  return username.trim().toLowerCase();
}

function assertCookieSecret() {
  if (!ADMIN_COOKIE_SECRET) {
    throw new Error("ADMIN_SECRET is required for middleware session signing.");
  }
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payloadB64: string) {
  return crypto.createHmac("sha256", ADMIN_COOKIE_SECRET).update(payloadB64).digest("hex");
}

function constantTimeEqual(value: string, expected: string) {
  const valueBuffer = Buffer.from(value, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(valueBuffer, expectedBuffer);
}

export function verifySessionCookie(value?: string) {
  if (!value || !ADMIN_COOKIE_SECRET) return false;
  const parts = value.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, signature] = parts;
  const expected = signPayload(payloadB64);
  if (!constantTimeEqual(signature, expected)) return false;

  try {
    const payload = JSON.parse(fromBase64Url(payloadB64)) as { u: string; exp: number };
    if (!payload?.u || !payload?.exp) return false;
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

type AdminSessionPayload = { u: string; exp: number };

function parseSessionCookie(value?: string): AdminSessionPayload | null {
  if (!value || !ADMIN_COOKIE_SECRET) return null;
  const parts = value.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;
  const expected = signPayload(payloadB64);
  if (!constantTimeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(fromBase64Url(payloadB64)) as AdminSessionPayload;
    if (!payload?.u || !payload?.exp || payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

async function findAdminByUsername(username: string) {
  const normalizedUsername = normalizeAdminUsername(username);
  if (!normalizedUsername) return null;
  const result = await prisma.$queryRaw<AdminCredentialRecord[]>`
    SELECT id, username, password_hash
    FROM admin_credentials
    WHERE LOWER(username) = LOWER(${normalizedUsername})
    LIMIT 1
  `;
  return result[0] ?? null;
}

export async function hasAdminUser() {
  const result = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM admin_credentials
    LIMIT 1
  `;
  return result.length > 0;
}

export async function createAdminUser(username: string, password: string) {
  const normalizedUsername = normalizeAdminUsername(username);
  if (!normalizedUsername) return null;

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await prisma.$queryRaw<AdminCredentialRecord[]>`
    INSERT INTO admin_credentials (username, password_hash)
    VALUES (${normalizedUsername}, ${passwordHash})
    RETURNING id, username, password_hash
  `;
  return result[0] ?? null;
}

export async function authenticateAdmin(username: string, password: string) {
  const user = await findAdminByUsername(username);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  return ok ? user : null;
}

export async function createAdminSession(username: string) {
  assertCookieSecret();
  const payload = {
    u: username,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const payloadB64 = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(payloadB64);
  const token = `${payloadB64}.${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", { maxAge: 0, path: "/" });
}

export async function isAdminSessionValid() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return verifySessionCookie(token);
}

export async function getAdminSessionUsername() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const parsed = parseSessionCookie(token);
  return parsed?.u ?? null;
}

export async function requireAdmin() {
  const ok = await isAdminSessionValid();
  if (!ok) {
    redirect("/admin/login");
  }
}

export function getAdminCookieName() {
  return ADMIN_COOKIE;
}
