import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, occurredAt, description, severity, symptomDefinitionId, supplementProtocolId, meta } = body;

  if (!type || !occurredAt) {
    return NextResponse.json({ error: "type and occurredAt required" }, { status: 400 });
  }

  const date = new Date(occurredAt);
  // znajdz lub utworz dzien
  const dayDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = await prisma.day.upsert({
    where: { date: dayDate },
    update: {},
    create: { date: dayDate, source: "manual" },
  });

  const event = await prisma.event.create({
    data: {
      dayId: day.id,
      type,
      occurredAt: date,
      description: description ?? null,
      severity: severity ?? null,
      symptomDefinitionId: symptomDefinitionId ?? null,
      supplementProtocolId: supplementProtocolId ?? null,
      metaJson: meta ? JSON.stringify(meta) : null,
    },
  });
  return NextResponse.json(event, { status: 201 });
}
