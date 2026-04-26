import type { Activity } from "@/app/generated/prisma/client";

const WEEKDAY_MAP: Record<number, string> = {
  0: "SUN",
  1: "MON",
  2: "TUE",
  3: "WED",
  4: "THU",
  5: "FRI",
  6: "SAT",
};

export function shouldRunOn(activity: Pick<Activity, "recurrence" | "weekdays">, date: Date): boolean {
  const dow = WEEKDAY_MAP[date.getDay()];
  switch (activity.recurrence) {
    case "DAILY":
      return true;
    case "WEEKDAYS":
      return dow !== "SAT" && dow !== "SUN";
    case "WEEKLY":
      if (!activity.weekdays) return false;
      return activity.weekdays.split(",").map((d) => d.trim().toUpperCase()).includes(dow);
    case "ONCE":
      return true;
    default:
      return false;
  }
}

export function combineDateAndTime(date: Date, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(h ?? 0, m ?? 0, 0, 0);
  return result;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
