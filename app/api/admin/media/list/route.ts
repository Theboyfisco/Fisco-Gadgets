import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { shouldUseDatabase } from "@/lib/should-use-database";
import { getAdminSessionUsername } from "@/lib/admin-auth";

export async function GET() {
  const actor = await getAdminSessionUsername();
  if (!actor) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!shouldUseDatabase()) {
    return NextResponse.json({ success: true, assets: [] });
  }

  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    select: {
      id: true,
      filename: true,
      url: true,
      mimeType: true,
      sizeBytes: true,
      uploadedBy: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, assets });
}
