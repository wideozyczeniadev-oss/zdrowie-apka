import { prisma } from "@/lib/db";
import { QuickLog } from "./components/QuickLog";
import { TodayEvents } from "./components/TodayEvents";
import { Heatmap, type HeatmapDay } from "./components/Heatmap";
import { MorningCheckin } from "./components/MorningCheckin";
import { formatDateISO, formatDatePl } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const weekAgoUTC = new Date(todayUTC);
  weekAgoUTC.setUTCDate(weekAgoUTC.getUTCDate() - 13); // 14 dni

  // dane na dzis
  const today = await prisma.day.findUnique({
    where: { date: todayUTC },
    include: { events: { orderBy: { occurredAt: "asc" } } },
  });

  // 14 ostatnich dni dla heatmapy
  const recentDays = await prisma.day.findMany({
    where: { date: { gte: weekAgoUTC, lte: todayUTC } },
    include: { events: true },
    orderBy: { date: "asc" },
  });

  // wype lnij brakujace dni (zeby heatmapa miala 14 kafelkow)
  const heatmap: HeatmapDay[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(weekAgoUTC);
    d.setUTCDate(d.getUTCDate() + i);
    const iso = formatDateISO(d);
    const found = recentDays.find((r) => formatDateISO(r.date) === iso);
    if (found) {
      const symptoms = found.events.filter((e) => e.type === "SYMPTOM");
      heatmap.push({
        date: iso,
        symptomCount: symptoms.length,
        symptomMaxSeverity: symptoms.length ? Math.max(...symptoms.map((s) => s.severity ?? 0)) : null,
        morningEnergy: found.morningEnergy,
      });
    } else {
      heatmap.push({ date: iso, symptomCount: 0, symptomMaxSeverity: null, morningEnergy: null });
    }
  }

  const symptoms = await prisma.symptomDefinition.findMany({ orderBy: [{ category: "asc" }, { namePl: "asc" }] });
  const supplements = await prisma.supplementProtocol.findMany({ where: { active: true }, orderBy: { name: "asc" } });

  // statystyki (caly import)
  const totalDays = await prisma.day.count();
  const totalEvents = await prisma.event.count();

  const todayEvents = today?.events ?? [];
  const symptomsToday = todayEvents.filter((e) => e.type === "SYMPTOM").length;
  const mealsToday = todayEvents.filter((e) => e.type === "MEAL").length;
  const suppsToday = todayEvents.filter((e) => e.type === "SUPPLEMENT").length;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-5">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Homeostaza</h1>
            <p className="text-xs text-zinc-500">{formatDatePl(now)}</p>
          </div>
          <Link href="/profile" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-4">profil</Link>
        </header>

        <section className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
            <div className="text-2xl font-bold">{mealsToday}</div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">posiłków dziś</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
            <div className="text-2xl font-bold">{suppsToday}</div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">suplementów dziś</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{symptomsToday}</div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">objawów dziś</div>
          </div>
        </section>

        <MorningCheckin today={today} todayISO={formatDateISO(todayUTC)} />

        <section>
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">Quick Log</h2>
          <QuickLog symptoms={symptoms} supplements={supplements} />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">Dziś — {todayEvents.length} zdarzeń</h2>
          <TodayEvents
            events={todayEvents.map((e) => ({
              id: e.id,
              type: e.type,
              occurredAt: e.occurredAt.toISOString(),
              description: e.description,
              severity: e.severity,
              metaJson: e.metaJson,
            }))}
          />
        </section>

        <section>
          <Heatmap days={heatmap} />
        </section>

        <footer className="text-xs text-zinc-500 text-center pt-4 border-t border-zinc-200 dark:border-zinc-800">
          {totalDays} dni • {totalEvents} zdarzeń w bazie
          {" — "}
          <Link href="/history" className="underline underline-offset-2">historia →</Link>
        </footer>
      </div>
    </main>
  );
}
