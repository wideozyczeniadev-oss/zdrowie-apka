import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { activityId, scheduledAt, done } = await req.json();
  if (!activityId || !scheduledAt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const scheduled = new Date(scheduledAt);

  const log = await prisma.activityLog.upsert({
    where: { activityId_scheduledAt: { activityId, scheduledAt: scheduled } },
    update: { completedAt: done ? new Date() : null },
    create: {
      activityId,
      scheduledAt: scheduled,
      completedAt: done ? new Date() : null,
    },
  });

  return NextResponse.json(log);
}
