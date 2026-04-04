import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "noxtech_admin_session_v1";

function fromBase64UrlToUtf8(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function fromHex(value: string) {
  if (!/^[0-9a-f]+$/i.test(value) || value.length % 2 !== 0) {
    return null;
  }
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < value.length; index += 2) {
    bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16);
  }
  return bytes;
}

async function importHmacKey(secret: string) {
  const keyData = new TextEncoder().encode(secret);
  return crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
}

async function verifyPayloadSignature(secret: string, payloadB64: string, signatureHex: string) {
  const signatureBytes = fromHex(signatureHex);
  if (!signatureBytes) return false;
  const key = await importHmacKey(secret);
  return crypto.subtle.verify("HMAC", key, signatureBytes, new TextEncoder().encode(payloadB64));
}

async function isValidSession(token: string, secret: string) {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, signature] = parts;
  if (!(await verifyPayloadSignature(secret, payloadB64, signature))) return false;

  try {
    const payload = JSON.parse(fromBase64UrlToUtf8(payloadB64)) as { u?: string; exp?: number };
    return Boolean(payload.u) && typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin/login") || pathname.startsWith("/admin/setup") || pathname.startsWith("/admin/logout")) {
    return NextResponse.next();
  }

  const secret = process.env.ADMIN_SECRET || "";
  const token = request.cookies.get(ADMIN_COOKIE)?.value;

  if (!secret || !token || !(await isValidSession(token, secret))) {
    const loginUrl = new URL("/admin/login", request.url);
    const destination = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set("next", destination);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
