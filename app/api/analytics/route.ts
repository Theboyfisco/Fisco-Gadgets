import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recordAnalyticsEvent } from "@/lib/analytics";

const AnalyticsPayloadSchema = z.object({
  name: z.string().trim().min(1).max(100),
  path: z.string().trim().max(250).optional(),
  userType: z.string().trim().max(40).optional(),
  sessionId: z.string().trim().max(120).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const parsed = AnalyticsPayloadSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid analytics payload" }, { status: 400 });
    }

    await recordAnalyticsEvent(parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }
}
