/**
 * Seed Homeostazy — slownik objawow + profil Jacka + protokol suplementow.
 * Uruchom: npm run db:seed
 */
import path from "node:path";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { SYMPTOM_DICTIONARY, JACEK_PROFILE, JACEK_SUPPLEMENTS } from "../lib/symptoms";

const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Homeostaza...");

  // 1. Slownik objawow
  for (const s of SYMPTOM_DICTIONARY) {
    await prisma.symptomDefinition.upsert({
      where: { code: s.code },
      update: {},
      create: s,
    });
  }
  console.log(`  ✓ ${SYMPTOM_DICTIONARY.length} objawow w slowniku`);

  // 2. Profil Jacka (single-user)
  const existing = await prisma.profile.findFirst();
  if (!existing) {
    await prisma.profile.create({
      data: {
        fullName: JACEK_PROFILE.fullName,
        heightCm: JACEK_PROFILE.heightCm,
        weightKg: JACEK_PROFILE.weightKg,
        diagnosesJson: JSON.stringify(JACEK_PROFILE.diagnoses),
        eliminationsJson: JSON.stringify(JACEK_PROFILE.eliminations),
        knownTriggersJson: JSON.stringify(JACEK_PROFILE.knownTriggers),
        goal: JACEK_PROFILE.goal,
      },
    });
    console.log(`  ✓ profil: ${JACEK_PROFILE.fullName}`);
  } else {
    console.log(`  - profil juz istnieje, pomijam`);
  }

  // 3. Protokol suplementow
  const supplCount = await prisma.supplementProtocol.count();
  if (supplCount === 0) {
    for (const s of JACEK_SUPPLEMENTS) {
      await prisma.supplementProtocol.create({ data: s });
    }
    console.log(`  ✓ ${JACEK_SUPPLEMENTS.length} suplementow w protokole`);
  } else {
    console.log(`  - protokol ma ${supplCount} suplementow, pomijam`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
