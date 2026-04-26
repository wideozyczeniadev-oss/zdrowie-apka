"use client";

import { useState, useTransition } from "react";

type Supplement = { id: string; name: string; timingRule: string | null; defaultTime: string | null };

export function LogSupplementForm({
  supplements,
  onDone,
  onCancel,
}: {
  supplements: Supplement[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.size === 0) return;
    const now = new Date();
    startTransition(async () => {
      for (const id of selected) {
        const s = supplements.find((x) => x.id === id);
        await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "SUPPLEMENT",
            occurredAt: now.toISOString(),
            description: s?.name,
            supplementProtocolId: id,
          }),
        });
      }
      onDone();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
      <h3 className="font-semibold flex items-center gap-2"><span>💊</span> Log suplementów <span className="text-xs text-zinc-500">({selected.size} wybr.)</span></h3>
      <div className="space-y-1.5 max-h-80 overflow-y-auto">
        {supplements.map((s) => (
          <label key={s.id} className="flex items-start gap-3 rounded p-2 border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
            <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} className="mt-0.5 h-4 w-4" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{s.name}</div>
              {s.timingRule && <div className="text-xs text-zinc-500 truncate">⏰ {s.timingRule}</div>}
            </div>
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={pending || selected.size === 0} className="flex-1 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2">
          {pending ? "Zapisuję…" : `Zapisz (${selected.size})`}
        </button>
        <button type="button" onClick={onCancel} className="px-4 rounded border border-zinc-300 dark:border-zinc-700">Anuluj</button>
      </div>
    </form>
  );
}
