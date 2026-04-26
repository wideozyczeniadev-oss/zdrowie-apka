/**
 * Importer historycznego dziennika z dane/dziennik_export_zdrowie.md.
 * Parsuje bloki YAML frontmatter (granice ---) i mapuje na Day + Events.
 *
 * Uruchom: npm run import:diary
 */
import path from "node:path";
import fs from "node:fs";
import yaml from "js-yaml";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const SOURCE_FILE = path.resolve(process.cwd(), "dane", "dziennik_export_zdrowie.md");

// Heurystyki dla "czas" (moze byc HH:MM, ~HH:MM, "rano", "obiad", "wieczor", "po X", "noc")
const FALLBACK_TIMES: Record<string, string> = {
  rano: "07:30",
  poranek: "07:30",
  "śniadanie": "08:00",
  "II śniadanie": "11:00",
  "drugie śniadanie": "11:00",
  obiad: "13:30",
  popołudnie: "15:30",
  popoludnie: "15:30",
  "podwieczorek": "16:30",
  wieczór: "19:00",
  wieczor: "19:00",
  kolacja: "20:00",
  noc: "23:00",
  północ: "00:00",
  polnoc: "00:00",
};

function parseTimeToHHMM(input: string | null | undefined): string | null {
  if (!input) return null;
  const s = String(input).trim();
  // direct HH:MM or ~HH:MM
  const direct = s.match(/(\d{1,2}):(\d{2})/);
  if (direct) {
    const hh = direct[1].padStart(2, "0");
    return `${hh}:${direct[2]}`;
  }
  // fallback ze slownika
  const lower = s.toLowerCase();
  for (const [key, val] of Object.entries(FALLBACK_TIMES)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

function combineDateAndTime(dateStr: string, hhmm: string | null): Date {
  const base = new Date(`${dateStr}T${hhmm ?? "12:00"}:00`);
  return base;
}

type DiaryDay = {
  date: string | Date;
  source?: string;
  confidence?: string;
  meals?: Array<{ time?: string; description?: string; post_meal_state?: string }>;
  supplements_taken?: Array<{ time?: string; name?: string }>;
  symptoms?: Array<{ time?: string; name?: string; severity?: number | null; note?: string }>;
  activities?: Array<{ time?: string; type?: string; duration?: number; intensity?: string }>;
  sleep_quality?: number | null;
  sleep_duration?: number | null;
  morning_energy?: number | null;
  evening_energy?: number | null;
  notes?: string;
  ai_summary?: string | null;
};

function splitYamlBlocks(content: string): string[] {
  // `---` to separator, nie toggle. Dzielimy plik po liniach `---`,
  // nastepnie filtrujemy puste/markdown-only bloki w mainie.
  return content.split(/\r?\n---\r?\n/g).map((b) => b.trim()).filter(Boolean);
}

async function main() {
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error(`Brak pliku: ${SOURCE_FILE}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(SOURCE_FILE, "utf8");
  const blocks = splitYamlBlocks(raw);
  console.log(`Znaleziono ${blocks.length} blokow YAML.`);

  let imported = 0;
  let skipped = 0;
  let totalEvents = 0;

  for (const block of blocks) {
    let parsed: DiaryDay | null = null;
    try {
      parsed = yaml.load(block) as DiaryDay;
    } catch (e) {
      console.warn(`  ! YAML parse error, skipping block: ${(e as Error).message}`);
      continue;
    }
    if (!parsed || typeof parsed !== "object") {
      skipped++;
      continue;
    }
    if (!parsed.date) {
      skipped++;
      continue;
    }
    // YAML moze parsowac date jako Date object lub string
    let dateStr: string;
    let dayDate: Date;
    if (parsed.date instanceof Date) {
      dayDate = new Date(Date.UTC(parsed.date.getUTCFullYear(), parsed.date.getUTCMonth(), parsed.date.getUTCDate()));
      dateStr = `${dayDate.getUTCFullYear()}-${String(dayDate.getUTCMonth() + 1).padStart(2, "0")}-${String(dayDate.getUTCDate()).padStart(2, "0")}`;
    } else {
      dateStr = String(parsed.date);
      dayDate = new Date(`${dateStr}T00:00:00Z`);
    }
    if (isNaN(dayDate.getTime())) {
      console.warn(`  ! pomijam blok z nieprawidlowa data: ${parsed.date}`);
      continue;
    }

    // upsert Day
    const day = await prisma.day.upsert({
      where: { date: dayDate },
      update: {
        morningSleepQuality: parsed.sleep_quality ?? undefined,
        morningSleepDurationH: parsed.sleep_duration ?? undefined,
        morningEnergy: parsed.morning_energy ?? undefined,
        eveningEnergy: parsed.evening_energy ?? undefined,
        notes: parsed.notes ?? undefined,
        source: parsed.source ?? "import:chat_zdrowie",
      },
      create: {
        date: dayDate,
        morningSleepQuality: parsed.sleep_quality ?? null,
        morningSleepDurationH: parsed.sleep_duration ?? null,
        morningEnergy: parsed.morning_energy ?? null,
        eveningEnergy: parsed.evening_energy ?? null,
        notes: parsed.notes ?? null,
        source: parsed.source ?? "import:chat_zdrowie",
      },
    });

    // wyczysc istniejace zdarzenia z importu (idempotentnie)
    await prisma.event.deleteMany({ where: { dayId: day.id } });

    // meals
    for (const meal of parsed.meals ?? []) {
      const hhmm = parseTimeToHHMM(meal.time);
      const occurredAt = combineDateAndTime(dateStr, hhmm);
      await prisma.event.create({
        data: {
          dayId: day.id,
          type: "MEAL",
          occurredAt,
          description: meal.description ?? "(brak opisu)",
          metaJson: meal.post_meal_state ? JSON.stringify({ post_meal_state: meal.post_meal_state, raw_time: meal.time }) : JSON.stringify({ raw_time: meal.time }),
        },
      });
      totalEvents++;
    }

    // symptoms
    for (const symptom of parsed.symptoms ?? []) {
      const hhmm = parseTimeToHHMM(symptom.time);
      const occurredAt = combineDateAndTime(dateStr, hhmm);
      await prisma.event.create({
        data: {
          dayId: day.id,
          type: "SYMPTOM",
          occurredAt,
          description: symptom.name ?? "(nieokreślony objaw)",
          severity: symptom.severity ?? null,
          metaJson: JSON.stringify({ note: symptom.note, raw_time: symptom.time }),
        },
      });
      totalEvents++;
    }

    // supplements_taken
    for (const supp of parsed.supplements_taken ?? []) {
      const hhmm = parseTimeToHHMM(supp.time);
      const occurredAt = combineDateAndTime(dateStr, hhmm);
      await prisma.event.create({
        data: {
          dayId: day.id,
          type: "SUPPLEMENT",
          occurredAt,
          description: supp.name ?? "(nieokreślony suplement)",
          metaJson: JSON.stringify({ raw_time: supp.time }),
        },
      });
      totalEvents++;
    }

    // activities
    for (const act of parsed.activities ?? []) {
      const hhmm = parseTimeToHHMM(act.time);
      const occurredAt = combineDateAndTime(dateStr, hhmm);
      await prisma.event.create({
        data: {
          dayId: day.id,
          type: "ACTIVITY",
          occurredAt,
          description: act.type ?? "(aktywność)",
          metaJson: JSON.stringify({ duration: act.duration, intensity: act.intensity, raw_time: act.time }),
        },
      });
      totalEvents++;
    }

    imported++;
  }

  console.log(`\n✓ Zaimportowano ${imported} dni`);
  console.log(`✓ Utworzono ${totalEvents} zdarzeń`);
  if (skipped) console.log(`✓ Pominieto ${skipped} blokow`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
