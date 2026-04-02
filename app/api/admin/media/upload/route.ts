import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import prisma from "@/lib/db";
import { shouldUseDatabase } from "@/lib/should-use-database";
import { getAdminSessionUsername } from "@/lib/admin-auth";
import { recordAdminAuditLog } from "@/lib/audit-log";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 6 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 140);
}

export async function POST(req: NextRequest) {
  const actor = await getAdminSessionUsername();
  if (!actor) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.formData().catch(() => null);
  const file = data?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "Missing file" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ success: false, error: "Unsupported file type" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ success: false, error: "File too large (max 6MB)" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const uniquePrefix = `${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const original = sanitizeFileName(file.name || "upload");
  const fileName = `${uniquePrefix}_${original}`;
  const destination = path.join(uploadDir, fileName);
  await writeFile(destination, Buffer.from(bytes));

  const url = `/uploads/${fileName}`;
  let assetId: string | undefined;

  if (shouldUseDatabase()) {
    const asset = await prisma.mediaAsset
      .create({
        data: {
          filename: fileName,
          url,
          mimeType: file.type,
          sizeBytes: file.size,
          uploadedBy: actor,
        },
      })
      .catch(() => null);
    assetId = asset?.id;
  }

  await recordAdminAuditLog({
    action: "media.upload",
    entityType: "media_asset",
    entityId: assetId,
    after: {
      filename: fileName,
      url,
      mimeType: file.type,
      sizeBytes: file.size,
    },
  });

  return NextResponse.json({
    success: true,
    asset: {
      id: assetId,
      filename: fileName,
      url,
      mimeType: file.type,
      sizeBytes: file.size,
    },
  });
}
