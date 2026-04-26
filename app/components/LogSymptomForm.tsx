"use client";

import { useState, useTransition, useMemo } from "react";
import { CATEGORY_LABEL, CATEGORY_ICON, type SymptomCategory } from "@/lib/symptoms";

type Symptom = { id: number; code: string; namePl: string; category: string };

export function LogSymptomForm({
  symptoms,
  onDone,
  onCancel,
}: {
  symptoms: Symptom[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const now = new Date();
  const localISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const [occurredAt, setOccurredAt] = useState(localISO);
  const [category, setCategory] = useState<SymptomCategory>("gut");
  const [symptomId, setSymptomId] = useState<number | null>(null);
  const [severity, setSeverity] = useState(5);
  const [note, setNote] = useState("");

  const filtered = useMemo(() => symptoms.filter((s) => s.category === category), [symptoms, category]);
  const categories = useMemo(() => Array.from(new Set(symptoms.map((s) => s.category))), [symptoms]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!symptomId) return;
    const symptom = symptoms.find((s) => s.id === symptomId);
    startTransition(async () => {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SYMPTOM",
          occurredAt: new Date(occurredAt).toISOString(),
          description: symptom?.namePl,
          severity,
          symptomDefinitionId: symptomId,
          meta: note.trim() ? { note: note.trim() } : undefined,
        }),
      });
      onDone();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
      <h3 className="font-semibold flex items-center gap-2"><span>🤕</span> Log objawu</h3>
      <label className="space-y-1 block">
        <span className="text-xs font-medium">Czas</span>
        <input type="datetime-local" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm" />
      </label>
      <div className="space-y-1">
        <span className="text-xs font-medium">Kategoria</span>
        <div className="grid grid-cols-4 gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { setCategory(c as SymptomCategory); setSymptomId(null); }}
              className={`rounded p-2 border text-xs transition ${category === c ? "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700" : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
            >
              <div>{CATEGORY_ICON[c as SymptomCategory]}</div>
              <div className="leading-tight">{CATEGORY_LABEL[c as SymptomCategory] ?? c}</div>
            </button>
          ))}
        </div>
      </div>
      <label className="space-y-1 block">
        <span className="text-xs font-medium">Konkretny objaw *</span>
        <select value={symptomId ?? ""} onChange={(e) => setSymptomId(Number(e.target.value) || null)} required className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm">
          <option value="">— wybierz —</option>
          {filtered.map((s) => (
            <option key={s.id} value={s.id}>{s.namePl}</option>
          ))}
        </select>
      </label>
      <label className="space-y-1 block">
        <span className="text-xs font-medium">Nasilenie: {severity}/10</span>
        <input type="range" min={1} max={10} value={severity} onChange={(e) => setSeverity(Number(e.target.value))} className="w-full" />
      </label>
      <label className="space-y-1 block">
        <span className="text-xs font-medium">Notatka (opcjonalna)</span>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm" />
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={pending || !symptomId} className="flex-1 rounded bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2">
          {pending ? "Zapisuję…" : "Zapisz"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 rounded border border-zinc-300 dark:border-zinc-700">Anuluj</button>
      </div>
    </form>
  );
}
