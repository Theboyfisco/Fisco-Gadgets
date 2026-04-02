import { NextRequest, NextResponse } from "next/server";
import { unlink } from "node:fs/promises";
import path from "node:path";
import prisma from "@/lib/db";
import { shouldUseDatabase } from "@/lib/should-use-database";
import { getAdminSessionUsername } from "@/lib/admin-auth";
import { recordAdminAuditLog } from "@/lib/audit-log";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const actor = await getAdminSessionUsername();
  if (!actor) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ success: false, error: "Asset id is required" }, { status: 400 });
  }

  if (!shouldUseDatabase()) {
    return NextResponse.json({ success: false, error: "Database mode disabled" }, { status: 400 });
  }

  const existing = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Asset not found" }, { status: 404 });
  }

  const relative = existing.url.startsWith("/uploads/") ? existing.url.slice("/uploads/".length) : existing.filename;
  const filePath = path.join(process.cwd(), "public", "uploads", relative);

  await unlink(filePath).catch(() => null);
  await prisma.mediaAsset.delete({ where: { id } });

  await recordAdminAuditLog({
    action: "media.delete",
    entityType: "media_asset",
    entityId: id,
    before: {
      filename: existing.filename,
      url: existing.url,
      mimeType: existing.mimeType,
      sizeBytes: existing.sizeBytes,
    },
  });

  return NextResponse.json({ success: true });
}
