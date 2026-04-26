"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { EVENT_TYPE_META } from "@/lib/format";

type EventDTO = {
  id: string;
  type: keyof typeof EVENT_TYPE_META;
  occurredAt: string;
  description: string | null;
  severity: number | null;
  metaJson: string | null;
};

export function TodayEvents({ events }: { events: EventDTO[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function remove(id: string) {
    if (!confirm("Usunąć?")) return;
    start(async () => {
      await fetch(`/api/events/${id}`, { method: "DELETE" });
      router.refresh();
    });
  }

  if (events.length === 0) {
    return <p className="text-sm text-zinc-500 text-center py-6">Brak zdarzeń. Dodaj pierwsze przez Quick Log powyżej.</p>;
  }

  return (
    <ul className="space-y-1.5">
      {events.map((e) => {
        const meta = EVENT_TYPE_META[e.type];
        const time = new Date(e.occurredAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
        const meta_obj = e.metaJson ? JSON.parse(e.metaJson) : null;
        return (
          <li key={e.id} className="flex items-start gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2">
            <span className="font-mono text-xs tabular-nums text-zinc-500 mt-0.5 w-12 shrink-0">{time}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${meta.color}`}>{meta.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm">
                {e.description}
                {e.severity != null && <span className="ml-2 text-xs text-red-600 dark:text-red-400">{e.severity}/10</span>}
              </div>
              {meta_obj?.post_meal_state && (
                <div className="text-xs text-zinc-500 mt-0.5">→ {meta_obj.post_meal_state}</div>
              )}
              {meta_obj?.note && (
                <div className="text-xs text-zinc-500 mt-0.5">{meta_obj.note}</div>
              )}
            </div>
            <button type="button" onClick={() => remove(e.id)} disabled={pending} className="text-zinc-400 hover:text-red-500 text-sm shrink-0">✕</button>
          </li>
        );
      })}
    </ul>
  );
}
