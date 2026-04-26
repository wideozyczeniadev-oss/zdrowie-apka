import { prisma } from "@/lib/db";
import { combineDateAndTime, endOfDay, shouldRunOn, startOfDay } from "@/lib/schedule";
import { ActivityForm } from "./components/ActivityForm";
import { ActivityList } from "./components/ActivityList";

export const dynamic = "force-dynamic";

export default async function Home() {
  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);

  const activities = await prisma.activity.findMany({
    where: { active: true },
    include: {
      logs: {
        where: { scheduledAt: { gte: dayStart, lte: dayEnd } },
      },
    },
    orderBy: { time: "asc" },
  });

  const todayActivities = activities
    .filter((a) => shouldRunOn(a, today))
    .map((a) => ({
      ...a,
      scheduledAt: combineDateAndTime(today, a.time).toISOString(),
      log: a.logs[0] ?? null,
    }));

  const completedCount = todayActivities.filter((a) => a.log?.completedAt).length;
  const total = todayActivities.length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Zdrowie — plan na dziś</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {today.toLocaleDateString("pl-PL", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-sm font-medium tabular-nums">
              {completedCount}/{total} ({percent}%)
            </span>
          </div>
        </header>

        <ActivityList activities={todayActivities} />

        <section className="border-t border-zinc-200 dark:border-zinc-800 pt-8">
          <h2 className="text-xl font-semibold mb-4">Dodaj aktywność</h2>
          <ActivityForm />
        </section>
      </div>
    </main>
  );
}
