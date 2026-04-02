import { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { shouldUseDatabase } from "@/lib/should-use-database";

type AlertSeverity = "info" | "warning" | "critical";

type CaptureAlertInput = {
  source: string;
  severity: AlertSeverity;
  message: string;
  context?: Record<string, unknown>;
};

const ALERT_WEBHOOK_URL = process.env.ALERT_WEBHOOK_URL;

export async function captureOperationalAlert(input: CaptureAlertInput) {
  const payload = {
    source: input.source,
    severity: input.severity,
    message: input.message,
    context: input.context ?? {},
    timestamp: new Date().toISOString(),
  };

  if (input.severity === "critical" || input.severity === "warning") {
    console.error("[ops-alert]", payload);
  } else {
    console.log("[ops-alert]", payload);
  }

  if (shouldUseDatabase()) {
    await prisma.operationalAlert
      .create({
        data: {
          source: input.source,
          severity: input.severity,
          message: input.message,
          context: payload.context as Prisma.InputJsonValue,
        },
      })
      .catch(() => null);
  }

  if (ALERT_WEBHOOK_URL) {
    await fetch(ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    }).catch(() => null);
  }
}
