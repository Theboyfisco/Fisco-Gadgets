import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const ADMIN_COOKIE = "noxtech_admin_session_v1";
const SESSION_TTL_MS = 1000 * 60 * 60 * 6;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.service_role_key ||
  process.env.service_role ||
  process.env.SUPABASE_SERVICE_ROLE ||
  "";
const ADMIN_COOKIE_SECRET = process.env.ADMIN_SECRET || "";

type SupabaseAdminUser = {
  id: string;
  username: string;
  password_hash: string;
};

function assertSupabaseConfigured() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase admin auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and service role key.");
  }
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

export function verifySessionCookie(value?: string) {
  if (!value || !ADMIN_COOKIE_SECRET) return false;
  const parts = value.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, signature] = parts;
  const expected = signPayload(payloadB64);
  if (signature !== expected) return false;

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
  if (signature !== expected) return null;

  try {
    const payload = JSON.parse(fromBase64Url(payloadB64)) as AdminSessionPayload;
    if (!payload?.u || !payload?.exp || payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

async function supabaseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  assertSupabaseConfigured();
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${body}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

async function findAdminByUsername(username: string) {
  const encoded = encodeURIComponent(username);
  const result = await supabaseRequest<SupabaseAdminUser[]>(
    `admin_credentials?select=id,username,password_hash&username=eq.${encoded}&limit=1`,
  );
  return result[0] || null;
}

export async function hasAdminUser() {
  const result = await supabaseRequest<Array<{ id: string }>>("admin_credentials?select=id&limit=1");
  return result.length > 0;
}

export async function createAdminUser(username: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 12);
  const payload = [{ username, password_hash: passwordHash }];
  const result = await supabaseRequest<SupabaseAdminUser[]>("admin_credentials", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  return result[0];
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
