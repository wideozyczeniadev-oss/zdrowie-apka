import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const activities = await prisma.activity.findMany({
    where: { active: true },
    orderBy: { time: "asc" },
  });
  return NextResponse.json(activities);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body?.title || !body?.type || !body?.time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const created = await prisma.activity.create({
    data: {
      type: body.type,
      title: body.title,
      time: body.time,
      recurrence: body.recurrence ?? "DAILY",
      weekdays: body.weekdays ?? null,
      description: body.description ?? null,
      calories: body.calories ?? null,
      protein: body.protein ?? null,
      durationMin: body.durationMin ?? null,
      notes: body.notes ?? null,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
