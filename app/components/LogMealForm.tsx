"use client";

import { useState, useTransition } from "react";

export function LogMealForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [pending, startTransition] = useTransition();
  const now = new Date();
  const localISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const [occurredAt, setOccurredAt] = useState(localISO);
  const [description, setDescription] = useState("");
  const [postState, setPostState] = useState("");
  const [tag, setTag] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    startTransition(async () => {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "MEAL",
          occurredAt: new Date(occurredAt).toISOString(),
          description: description.trim(),
          meta: {
            ...(postState.trim() ? { post_meal_state: postState.trim() } : {}),
            ...(tag ? { tag } : {}),
          },
        }),
      });
      onDone();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
      <h3 className="font-semibold flex items-center gap-2"><span>🍽️</span> Log posiłku</h3>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-xs font-medium">Czas</span>
          <input type="datetime-local" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm" />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium">Tag</span>
          <select value={tag} onChange={(e) => setTag(e.target.value)} className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm">
            <option value="">— wybierz —</option>
            <option value="breakfast">Śniadanie</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Kolacja</option>
            <option value="snack">Przekąska</option>
          </select>
        </label>
      </div>
      <label className="space-y-1 block">
        <span className="text-xs font-medium">Co zjadłeś *</span>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="np. Owsianka z jagodami i masłem orzechowym" autoFocus required className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm" />
      </label>
      <label className="space-y-1 block">
        <span className="text-xs font-medium">Stan po posiłku (opcjonalne)</span>
        <textarea value={postState} onChange={(e) => setPostState(e.target.value)} rows={2} placeholder="np. wzdęcie 1h później, energia, ciężkość…" className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-2 py-1.5 text-sm" />
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={pending || !description.trim()} className="flex-1 rounded bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-medium py-2">
          {pending ? "Zapisuję…" : "Zapisz"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 rounded border border-zinc-300 dark:border-zinc-700">Anuluj</button>
      </div>
    </form>
  );
}
