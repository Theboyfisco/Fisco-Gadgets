import { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { getAdminSessionUsername } from "@/lib/admin-auth";
import { shouldUseDatabase } from "@/lib/should-use-database";

type AuditLogInput = {
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
};

export async function recordAdminAuditLog(input: AuditLogInput) {
  if (!shouldUseDatabase()) return;

  const actor = (await getAdminSessionUsername()) || "unknown-admin";
  await prisma.adminAuditLog
    .create({
      data: {
        actor,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId || null,
        before: input.before ? (input.before as Prisma.InputJsonValue) : undefined,
        after: input.after ? (input.after as Prisma.InputJsonValue) : undefined,
      },
    })
    .catch(() => null);
}
