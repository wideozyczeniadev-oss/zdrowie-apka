/**
 * Seed — kilka przykładowych aktywności na początek.
 * Uruchom: npm run db:seed
 */
import path from "node:path";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const SEED = [
  { type: "ROUTINE" as const, title: "Szklanka wody po przebudzeniu", time: "07:00", recurrence: "DAILY" as const },
  { type: "MEAL" as const, title: "Śniadanie — owsianka + owoce", time: "08:00", recurrence: "DAILY" as const, calories: 450, protein: 20 },
  { type: "ROUTINE" as const, title: "Witaminy / suplementy", time: "08:15", recurrence: "DAILY" as const },
  { type: "MEAL" as const, title: "Drugie śniadanie", time: "11:00", recurrence: "DAILY" as const, calories: 350 },
  { type: "MEAL" as const, title: "Obiad", time: "14:00", recurrence: "DAILY" as const, calories: 700, protein: 40 },
  { type: "WORKOUT" as const, title: "Trening — siłowo lub bieganie", time: "17:30", recurrence: "WEEKDAYS" as const, durationMin: 60 },
  { type: "MEAL" as const, title: "Kolacja", time: "19:30", recurrence: "DAILY" as const, calories: 500, protein: 30 },
  { type: "ROUTINE" as const, title: "Stretching / mobility", time: "21:30", recurrence: "DAILY" as const, durationMin: 15 },
  { type: "ROUTINE" as const, title: "Telefon na bok — przygotowanie do snu", time: "22:30", recurrence: "DAILY" as const },
];

async function main() {
  console.log("Seeding...");
  for (const item of SEED) {
    await prisma.activity.create({ data: item });
  }
  console.log(`✓ Dodano ${SEED.length} aktywności.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
