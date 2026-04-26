export const SEVERITY_COLORS = [
  "bg-zinc-200 dark:bg-zinc-800",
  "bg-emerald-200 dark:bg-emerald-900",
  "bg-emerald-300 dark:bg-emerald-800",
  "bg-yellow-200 dark:bg-yellow-900",
  "bg-yellow-300 dark:bg-yellow-800",
  "bg-orange-300 dark:bg-orange-800",
  "bg-orange-400 dark:bg-orange-700",
  "bg-red-400 dark:bg-red-800",
  "bg-red-500 dark:bg-red-700",
  "bg-red-600 dark:bg-red-600",
  "bg-red-700 dark:bg-red-500",
];

export function severityClass(s: number | null | undefined): string {
  if (s == null) return SEVERITY_COLORS[0];
  return SEVERITY_COLORS[Math.max(0, Math.min(10, s))];
}

export function formatDateISO(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function formatDatePl(d: Date): string {
  return d.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function formatTime(d: Date): string {
  return d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}

export const EVENT_TYPE_META = {
  MEAL: { label: "Posiłek", icon: "🍽️", color: "bg-orange-100 text-orange-900 dark:bg-orange-950/60 dark:text-orange-200" },
  SUPPLEMENT: { label: "Suplement", icon: "💊", color: "bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200" },
  SYMPTOM: { label: "Objaw", icon: "🤕", color: "bg-red-100 text-red-900 dark:bg-red-950/60 dark:text-red-200" },
  ACTIVITY: { label: "Aktywność", icon: "🚶", color: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200" },
  BREAK: { label: "Przerwa", icon: "⏸️", color: "bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200" },
} as const;
