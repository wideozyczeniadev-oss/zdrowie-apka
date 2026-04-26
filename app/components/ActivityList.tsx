"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type Activity = {
  id: string;
  type: "MEAL" | "WORKOUT" | "ROUTINE";
  title: string;
  description: string | null;
  time: string;
  calories: number | null;
  protein: number | null;
  durationMin: number | null;
  notes: string | null;
  scheduledAt: string;
  log: { id: string; completedAt: Date | null } | null;
};

const TYPE_META: Record<Activity["type"], { label: string; icon: string; color: string }> = {
  MEAL: { label: "Posiłek", icon: "🍽️", color: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200" },
  WORKOUT: { label: "Trening", icon: "💪", color: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200" },
  ROUTINE: { label: "Rutyna", icon: "✨", color: "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200" },
};

export function ActivityList({ activities }: { activities: Activity[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (activities.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center">
        <p className="text-zinc-500">Brak zaplanowanych aktywności na dziś. Dodaj pierwszą poniżej.</p>
      </div>
    );
  }

  async function toggle(activityId: string, scheduledAt: string, done: boolean) {
    startTransition(async () => {
      await fetch("/api/activities/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId, scheduledAt, done }),
      });
      router.refresh();
    });
  }

  async function remove(activityId: string) {
    if (!confirm("Usunąć tę aktywność?")) return;
    startTransition(async () => {
      await fetch(`/api/activities/${activityId}`, { method: "DELETE" });
      router.refresh();
    });
  }

  return (
    <ul className="space-y-2">
      {activities.map((a) => {
        const meta = TYPE_META[a.type];
        const done = !!a.log?.completedAt;
        return (
          <li
            key={a.id}
            className={`flex items-start gap-4 rounded-lg border p-4 transition ${
              done
                ? "bg-zinc-100 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 opacity-60"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <input
              type="checkbox"
              checked={done}
              disabled={isPending}
              onChange={(e) => toggle(a.id, a.scheduledAt, e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-zinc-300 cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm tabular-nums text-zinc-500">{a.time}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>
                  {meta.icon} {meta.label}
                </span>
                <h3 className={`font-medium ${done ? "line-through" : ""}`}>{a.title}</h3>
              </div>
              {a.description && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{a.description}</p>
              )}
              <div className="flex gap-3 mt-1 text-xs text-zinc-500">
                {a.calories != null && <span>{a.calories} kcal</span>}
                {a.protein != null && <span>{a.protein}g białka</span>}
                {a.durationMin != null && <span>{a.durationMin} min</span>}
              </div>
            </div>
            <button
              type="button"
              onClick={() => remove(a.id)}
              disabled={isPending}
              className="text-sm text-zinc-400 hover:text-red-500 px-2"
              title="Usuń"
            >
              ✕
            </button>
          </li>
        );
      })}
    </ul>
  );
}
