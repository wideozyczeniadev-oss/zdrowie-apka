"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function MorningCheckin({ today, todayISO }: { today: { morningSleepQuality: number | null; morningSleepDurationH: number | null; morningEnergy: number | null; morningMood: number | null } | null; todayISO: string }) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(today?.morningEnergy == null);
  const [sleepQ, setSleepQ] = useState(today?.morningSleepQuality ?? 7);
  const [sleepH, setSleepH] = useState(today?.morningSleepDurationH ?? 7.5);
  const [energy, setEnergy] = useState(today?.morningEnergy ?? 6);
  const [mood, setMood] = useState(today?.morningMood ?? 6);
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      await fetch("/api/days", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: todayISO,
          morningSleepQuality: sleepQ,
          morningSleepDurationH: sleepH,
          morningEnergy: energy,
          morningMood: mood,
        }),
      });
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-left w-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-2xl">🌅</span>
          <div className="flex-1">
            <div className="font-medium">Poranny check-in</div>
            <div className="text-zinc-500 text-xs">Sen {today?.morningSleepQuality ?? "—"}/10 • Energia {today?.morningEnergy ?? "—"}/10 • Nastrój {today?.morningMood ?? "—"}/10</div>
          </div>
          <span className="text-xs text-zinc-400">edytuj</span>
        </div>
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
      <h3 className="font-semibold flex items-center gap-2"><span>🌅</span> Poranny check-in</h3>
      <Slider label="Jakość snu" value={sleepQ} onChange={setSleepQ} />
      <label className="block space-y-1">
        <span className="text-xs font-medium">Długość snu (h)</span>
        <input type="number" step={0.25} min={0} max={14} value={sleepH} onChange={(e) => setSleepH(Number(e.target.value))} className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm" />
      </label>
      <Slider label="Energia teraz" value={energy} onChange={setEnergy} />
      <Slider label="Nastrój teraz" value={mood} onChange={setMood} />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="flex-1 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium py-2 text-sm">
          {pending ? "Zapisuję…" : "Zapisz"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-3 rounded border border-zinc-300 dark:border-zinc-700 text-sm">Zamknij</button>
      </div>
    </form>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium flex justify-between"><span>{label}</span><span className="tabular-nums">{value}/10</span></span>
      <input type="range" min={1} max={10} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </label>
  );
}
