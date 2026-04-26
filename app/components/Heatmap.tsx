import { severityClass } from "@/lib/format";

export type HeatmapDay = {
  date: string; // ISO YYYY-MM-DD
  symptomCount: number;
  symptomMaxSeverity: number | null;
  morningEnergy: number | null;
};

export function Heatmap({ days }: { days: HeatmapDay[] }) {
  if (days.length === 0) return null;
  const maxCount = Math.max(1, ...days.map((d) => d.symptomCount));
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
      <h3 className="text-sm font-semibold mb-3">Ostatnie {days.length} dni — intensywność objawów</h3>
      <div className="flex gap-1 overflow-x-auto">
        {days.map((d) => {
          const intensity = Math.round((d.symptomCount / maxCount) * 10);
          const cls = severityClass(d.symptomMaxSeverity ?? intensity);
          const date = new Date(d.date + "T12:00:00");
          return (
            <div key={d.date} className="flex flex-col items-center gap-1 shrink-0" title={`${d.date}: ${d.symptomCount} objawów${d.symptomMaxSeverity ? `, max ${d.symptomMaxSeverity}/10` : ""}`}>
              <div className={`w-8 h-8 rounded ${cls} flex items-center justify-center text-xs font-mono`}>
                {d.symptomCount > 0 ? d.symptomCount : ""}
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">{String(date.getDate()).padStart(2, "0")}/{String(date.getMonth() + 1).padStart(2, "0")}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
