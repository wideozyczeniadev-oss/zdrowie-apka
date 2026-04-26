import { prisma } from "@/lib/db";
import { EVENT_TYPE_META } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const days = await prisma.day.findMany({
    include: { events: { orderBy: { occurredAt: "asc" } } },
    orderBy: { date: "desc" },
    take: 60,
  });

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Historia</h1>
          <Link href="/" className="text-sm underline underline-offset-4">← powrót</Link>
        </header>

        {days.length === 0 && <p className="text-zinc-500">Brak danych.</p>}

        {days.map((day) => {
          const date = day.date;
          const iso = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
          const dateLabel = new Date(`${iso}T12:00:00`).toLocaleDateString("pl-PL", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
          const symptomCount = day.events.filter((e) => e.type === "SYMPTOM").length;
          const mealCount = day.events.filter((e) => e.type === "MEAL").length;
          return (
            <article key={day.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <header className="flex items-baseline justify-between mb-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <h2 className="font-semibold">{dateLabel}</h2>
                <div className="text-xs text-zinc-500 space-x-3">
                  {day.morningEnergy != null && <span>energia rano {day.morningEnergy}/10</span>}
                  {symptomCount > 0 && <span className="text-red-600 dark:text-red-400">{symptomCount} obj.</span>}
                  {mealCount > 0 && <span>{mealCount} posił.</span>}
                </div>
              </header>
              {day.events.length === 0 && day.notes && (
                <p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">{day.notes}</p>
              )}
              <ul className="space-y-0.5 text-sm">
                {day.events.map((e) => {
                  const meta = EVENT_TYPE_META[e.type as keyof typeof EVENT_TYPE_META];
                  const time = e.occurredAt.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
                  const meta_obj = e.metaJson ? JSON.parse(e.metaJson) : null;
                  return (
                    <li key={e.id} className="flex gap-2 items-start">
                      <span className="font-mono text-xs text-zinc-500 w-12 shrink-0">{time}</span>
                      <span className="shrink-0">{meta.icon}</span>
                      <span className="flex-1">
                        {e.description}
                        {e.severity != null && <span className="text-xs text-red-600 dark:text-red-400 ml-1">{e.severity}/10</span>}
                        {meta_obj?.post_meal_state && <span className="text-xs text-zinc-500 ml-1">→ {meta_obj.post_meal_state}</span>}
                        {meta_obj?.note && <span className="text-xs text-zinc-500 ml-1">({meta_obj.note})</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {day.notes && day.events.length > 0 && (
                <details className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <summary className="text-xs text-zinc-500 cursor-pointer">notatka</summary>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap mt-1">{day.notes}</p>
                </details>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
