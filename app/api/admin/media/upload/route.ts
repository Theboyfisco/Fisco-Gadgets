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
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 140);
}

function startsWithBytes(bytes: Uint8Array, signature: number[]) {
  if (bytes.length < signature.length) return false;
  return signature.every((value, index) => bytes[index] === value);
}

function detectImageType(bytes: Uint8Array) {
  if (startsWithBytes(bytes, [0xff, 0xd8, 0xff])) {
    return { mimeType: "image/jpeg", extension: "jpg" };
  }
  if (startsWithBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { mimeType: "image/png", extension: "png" };
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { mimeType: "image/webp", extension: "webp" };
  }
  if (startsWithBytes(bytes, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) || startsWithBytes(bytes, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])) {
    return { mimeType: "image/gif", extension: "gif" };
  }
  return null;
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

  if (file.type && !ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ success: false, error: "Unsupported file type" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ success: false, error: "File too large (max 6MB)" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const imageBytes = new Uint8Array(bytes);
  const detectedType = detectImageType(imageBytes);
  if (!detectedType) {
    return NextResponse.json({ success: false, error: "Invalid image file." }, { status: 400 });
  }

  if (file.type && file.type !== detectedType.mimeType) {
    return NextResponse.json({ success: false, error: "File MIME type does not match file content." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(detectedType.mimeType)) {
    return NextResponse.json({ success: false, error: "Unsupported file type" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const uniquePrefix = `${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const original = sanitizeFileName(file.name || "upload");
  const stem = sanitizeFileName(path.parse(original).name || "upload");
  const fileName = `${uniquePrefix}_${stem}.${detectedType.extension}`;
  const destination = path.join(uploadDir, fileName);
  await writeFile(destination, Buffer.from(imageBytes));

  const url = `/uploads/${fileName}`;
  let assetId: string | undefined;

  if (shouldUseDatabase()) {
    const asset = await prisma.mediaAsset
      .create({
        data: {
          filename: fileName,
          url,
          mimeType: detectedType.mimeType,
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
      mimeType: detectedType.mimeType,
      sizeBytes: file.size,
    },
  });

  return NextResponse.json({
    success: true,
    asset: {
      id: assetId,
      filename: fileName,
      url,
      mimeType: detectedType.mimeType,
      sizeBytes: file.size,
    },
  });
}
