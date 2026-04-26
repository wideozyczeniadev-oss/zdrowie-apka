"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ActivityForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<"MEAL" | "WORKOUT" | "ROUTINE">("MEAL");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("08:00");
  const [recurrence, setRecurrence] = useState<"DAILY" | "WEEKDAYS" | "WEEKLY" | "ONCE">("DAILY");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [description, setDescription] = useState("");

  function reset() {
    setTitle("");
    setTime("08:00");
    setCalories("");
    setProtein("");
    setDurationMin("");
    setDescription("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    startTransition(async () => {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: title.trim(),
          time,
          recurrence,
          description: description.trim() || null,
          calories: calories ? Number(calories) : null,
          protein: protein ? Number(protein) : null,
          durationMin: durationMin ? Number(durationMin) : null,
        }),
      });
      if (res.ok) {
        reset();
        router.refresh();
      } else {
        alert("Nie udało się zapisać.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className="text-sm font-medium">Typ</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
          >
            <option value="MEAL">🍽️ Posiłek</option>
            <option value="WORKOUT">💪 Trening</option>
            <option value="ROUTINE">✨ Rutyna</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Powtarzalność</span>
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value as typeof recurrence)}
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
          >
            <option value="DAILY">Codziennie</option>
            <option value="WEEKDAYS">Dni robocze (pn-pt)</option>
            <option value="WEEKLY">Wybrane dni</option>
            <option value="ONCE">Jednorazowo</option>
          </select>
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium">Tytuł *</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="np. Owsianka z owocami"
            required
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Godzina</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
          />
        </label>
        {type === "MEAL" && (
          <>
            <label className="space-y-1">
              <span className="text-sm font-medium">Kalorie</span>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="kcal"
                className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Białko (g)</span>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
              />
            </label>
          </>
        )}
        {(type === "WORKOUT" || type === "ROUTINE") && (
          <label className="space-y-1">
            <span className="text-sm font-medium">Czas (min)</span>
            <input
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
            />
          </label>
        )}
      </div>
      <label className="space-y-1 block">
        <span className="text-sm font-medium">Notatki</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={isPending || !title.trim()}
        className="w-full md:w-auto rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium px-6 py-2"
      >
        {isPending ? "Zapisuję…" : "Dodaj aktywność"}
      </button>
    </form>
  );
}
