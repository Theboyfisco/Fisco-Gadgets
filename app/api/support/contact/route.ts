import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recordAnalyticsEvent } from "@/lib/analytics";
import { SUPPORT_EMAIL } from "@/lib/support-config";
import { captureOperationalAlert } from "@/lib/monitoring";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const SupportContactSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(120),
  orderRef: z.string().trim().max(60).optional(),
  message: z.string().trim().min(3).max(2000),
  path: z.string().trim().max(250).optional(),
  website: z.string().trim().optional(),
});

const SUPPORT_FROM_EMAIL = process.env.SUPPORT_FROM_EMAIL ?? "NOXtech Support <onboarding@resend.dev>";
const SUPPORT_INBOX_EMAIL = process.env.SUPPORT_INBOX_EMAIL ?? SUPPORT_EMAIL;

type SupportContactPayload = z.infer<typeof SupportContactSchema>;

function getRequestIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const current = rateLimitStore.get(ip);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  current.count += 1;
  rateLimitStore.set(ip, current);
  return false;
}

async function sendSupportEmail(message: SupportContactPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false as const, error: "Support email is not configured. Set RESEND_API_KEY." };
  }

  const orderLine = message.orderRef ? `Order Ref: ${message.orderRef}\n` : "";
  const pathLine = message.path ? `Page: ${message.path}\n` : "";
  const now = new Date().toISOString();
  const subject = message.orderRef
    ? `Support request (${message.orderRef}) from ${message.name}`
    : `Support request from ${message.name}`;

  const text = [
    "New support message from NOXtech",
    "",
    `Name: ${message.name}`,
    `Email: ${message.email}`,
    orderLine.trimEnd(),
    pathLine.trimEnd(),
    `Received: ${now}`,
    "",
    "Message:",
    message.message,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: SUPPORT_FROM_EMAIL,
      to: [SUPPORT_INBOX_EMAIL],
      subject,
      text,
      reply_to: message.email,
    }),
  });

  if (!response.ok) {
    const resendError = await response.text().catch(() => "");
    let parsedMessage = "";
    try {
      const parsed = JSON.parse(resendError) as { message?: string; name?: string };
      parsedMessage = parsed.message ?? "";
      if (parsed.name === "validation_error" && parsedMessage.includes("testing emails")) {
        return {
          ok: false as const,
          error:
            "Resend test mode: set SUPPORT_INBOX_EMAIL to your Resend account email, or verify a domain and use SUPPORT_FROM_EMAIL on that domain.",
        };
      }
    } catch {}

    return {
      ok: false as const,
      error: parsedMessage || resendError || "Failed to deliver support email via Resend.",
    };
  }

  return { ok: true as const };
}

export async function POST(request: NextRequest) {
  const requestIp = getRequestIp(request);
  if (isRateLimited(requestIp)) {
    return NextResponse.json(
      { ok: false, error: "Too many messages sent. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = SupportContactSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const message = firstIssue?.message || "Invalid support message payload.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  const honeypot = parsed.data.website?.trim();
  if (honeypot) {
    await recordAnalyticsEvent({
      name: "support_contact_spam_blocked",
      path: parsed.data.path,
      userType: "shopper",
      payload: { source: "support_widget", ip: requestIp },
    });
    return NextResponse.json({ ok: true });
  }

  await recordAnalyticsEvent({
    name: "support_contact_message",
    path: parsed.data.path,
    userType: "shopper",
    payload: {
      source: "support_widget",
      ip: requestIp,
      name: parsed.data.name,
      email: parsed.data.email,
      orderRef: parsed.data.orderRef ?? null,
      message: parsed.data.message,
    },
  });

  try {
    const emailResult = await sendSupportEmail(parsed.data);
    if (!emailResult.ok) {
      await captureOperationalAlert({
        source: "support.contact.email",
        severity: "warning",
        message: emailResult.error,
        context: {
          path: parsed.data.path,
          email: parsed.data.email,
          orderRef: parsed.data.orderRef ?? null,
        },
      });
      await recordAnalyticsEvent({
        name: "support_contact_email_failed",
        path: parsed.data.path,
        userType: "shopper",
        payload: { source: "support_widget", ip: requestIp, reason: emailResult.error },
      });
      return NextResponse.json({ ok: true, queued: true });
    }
  } catch {
    await captureOperationalAlert({
      source: "support.contact.email",
      severity: "warning",
      message: "Unable to reach email provider",
      context: {
        path: parsed.data.path,
        email: parsed.data.email,
        orderRef: parsed.data.orderRef ?? null,
      },
    });
    await recordAnalyticsEvent({
      name: "support_contact_email_failed",
      path: parsed.data.path,
      userType: "shopper",
      payload: { source: "support_widget", ip: requestIp, reason: "provider_unreachable" },
    });
    return NextResponse.json({ ok: true, queued: true });
  }

  return NextResponse.json({ ok: true });
}
