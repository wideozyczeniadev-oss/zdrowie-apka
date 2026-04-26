import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PATCH: aktualizuj morning / evening check-in dla podanego dnia
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { date, ...fields } = body;
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  const d = new Date(date);
  const dayDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

  const day = await prisma.day.upsert({
    where: { date: dayDate },
    update: fields,
    create: { date: dayDate, source: "manual", ...fields },
  });
  return NextResponse.json(day);
}
