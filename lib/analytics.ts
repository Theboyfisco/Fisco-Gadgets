import { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { shouldUseDatabase } from "@/lib/should-use-database";

export type AnalyticsEventInput = {
  name: string;
  path?: string;
  userType?: string;
  sessionId?: string;
  payload?: Record<string, unknown>;
};

export async function recordAnalyticsEvent(input: AnalyticsEventInput) {
  if (!input.name.trim()) return;
  if (!shouldUseDatabase()) return;

  await prisma.analyticsEvent
    .create({
      data: {
        name: input.name,
        path: input.path,
        userType: input.userType,
        sessionId: input.sessionId,
        payload: (input.payload ?? {}) as Prisma.InputJsonValue,
      },
    })
    .catch(() => null);
}
