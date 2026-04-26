/**
 * Scheduler — co minutę sprawdza zaplanowane aktywności i wysyła
 * powiadomienie systemowe (Windows toast / macOS / Linux notify-send).
 *
 * Uruchomienie: npm run scheduler
 */
import cron from "node-cron";
import notifier from "node-notifier";
import path from "node:path";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { combineDateAndTime, endOfDay, shouldRunOn, startOfDay } from "../lib/schedule";

const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const TYPE_LABEL: Record<string, string> = {
  MEAL: "🍽️ Posiłek",
  WORKOUT: "💪 Trening",
  ROUTINE: "✨ Rutyna",
};

async function tick() {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const activities = await prisma.activity.findMany({
    where: { active: true },
    include: {
      logs: { where: { scheduledAt: { gte: dayStart, lte: dayEnd } } },
    },
  });

  for (const activity of activities) {
    if (!shouldRunOn(activity, now)) continue;

    const scheduledAt = combineDateAndTime(now, activity.time);
    const minutesSinceScheduled = (now.getTime() - scheduledAt.getTime()) / 60_000;

    // Powiadom w oknie 0..2 minuty od zaplanowanej godziny
    if (minutesSinceScheduled < 0 || minutesSinceScheduled > 2) continue;

    const existingLog = activity.logs[0];
    if (existingLog?.notifiedAt) continue;
    if (existingLog?.completedAt) continue;

    notifier.notify({
      title: `${TYPE_LABEL[activity.type] ?? activity.type}: ${activity.title}`,
      message: activity.description ?? `Zaplanowane na ${activity.time}`,
      sound: true,
      wait: false,
      appID: "Zdrowie-apka",
    });

    await prisma.activityLog.upsert({
      where: { activityId_scheduledAt: { activityId: activity.id, scheduledAt } },
      update: { notifiedAt: now },
      create: { activityId: activity.id, scheduledAt, notifiedAt: now },
    });

    console.log(`[${now.toISOString()}] notified: ${activity.title}`);
  }
}

console.log("📅 Scheduler started — sprawdza co minutę.");
console.log(`Working dir: ${path.resolve(".")}`);

tick().catch(console.error);
cron.schedule("* * * * *", () => {
  tick().catch(console.error);
});
