"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogMealForm } from "./LogMealForm";
import { LogSymptomForm } from "./LogSymptomForm";
import { LogSupplementForm } from "./LogSupplementForm";

type Symptom = { id: number; code: string; namePl: string; category: string };
type Supplement = { id: string; name: string; timingRule: string | null; defaultTime: string | null };

type Mode = "menu" | "meal" | "symptom" | "supplement";

export function QuickLog({
  symptoms,
  supplements,
}: {
  symptoms: Symptom[];
  supplements: Supplement[];
}) {
  const [mode, setMode] = useState<Mode>("menu");
  const router = useRouter();

  function done() {
    setMode("menu");
    router.refresh();
  }

  if (mode === "meal") return <LogMealForm onDone={done} onCancel={() => setMode("menu")} />;
  if (mode === "symptom") return <LogSymptomForm symptoms={symptoms} onDone={done} onCancel={() => setMode("menu")} />;
  if (mode === "supplement") return <LogSupplementForm supplements={supplements} onDone={done} onCancel={() => setMode("menu")} />;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <button onClick={() => setMode("meal")} className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-orange-50 dark:hover:bg-orange-950/30 p-6 transition">
        <span className="text-4xl">🍽️</span>
        <span className="font-medium">Posiłek</span>
      </button>
      <button onClick={() => setMode("symptom")} className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-950/30 p-6 transition">
        <span className="text-4xl">🤕</span>
        <span className="font-medium">Objaw</span>
      </button>
      <button onClick={() => setMode("supplement")} className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 p-6 transition">
        <span className="text-4xl">💊</span>
        <span className="font-medium">Suplement</span>
      </button>
    </div>
  );
}
