import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await prisma.profile.findFirst();
  const supplements = await prisma.supplementProtocol.findMany({ where: { active: true }, orderBy: { name: "asc" } });

  if (!profile) {
    return (
      <main className="p-6">
        <p>Brak profilu. Uruchom <code>npm run db:seed</code>.</p>
      </main>
    );
  }

  const diagnoses: string[] = JSON.parse(profile.diagnosesJson);
  const eliminations: { name: string; reason: string }[] = JSON.parse(profile.eliminationsJson);
  const triggers: { name: string; severity: number; note?: string }[] = JSON.parse(profile.knownTriggersJson);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 pb-20">
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-5">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
          <Link href="/" className="text-sm underline underline-offset-4">← powrót</Link>
        </header>

        <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
          <h2 className="font-semibold">{profile.fullName}</h2>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div><span className="text-zinc-500">Wzrost:</span> {profile.heightCm ?? "—"} cm</div>
            <div><span className="text-zinc-500">Waga:</span> {profile.weightKg ?? "—"} kg</div>
            <div><span className="text-zinc-500">BMI:</span> {profile.heightCm && profile.weightKg ? (profile.weightKg / Math.pow(profile.heightCm / 100, 2)).toFixed(1) : "—"}</div>
          </div>
          {profile.goal && <p className="text-sm text-zinc-600 dark:text-zinc-300 pt-1 border-t border-zinc-200 dark:border-zinc-800">🎯 {profile.goal}</p>}
        </section>

        <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <h2 className="font-semibold mb-2">Diagnozy ({diagnoses.length})</h2>
          <ul className="space-y-1 text-sm">
            {diagnoses.map((d, i) => <li key={i} className="flex gap-2"><span>•</span><span>{d}</span></li>)}
          </ul>
        </section>

        <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <h2 className="font-semibold mb-2">Eliminacje aktywne ({eliminations.length})</h2>
          <ul className="space-y-1.5 text-sm">
            {eliminations.map((e, i) => (
              <li key={i} className="flex flex-col">
                <span className="font-medium">🚫 {e.name}</span>
                <span className="text-xs text-zinc-500">{e.reason}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <h2 className="font-semibold mb-2">Znane triggery ({triggers.length})</h2>
          <ul className="space-y-1.5 text-sm">
            {triggers.map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={`shrink-0 text-xs font-mono px-1.5 py-0.5 rounded ${t.severity >= 7 ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"}`}>
                  {t.severity}/10
                </span>
                <div className="flex-1">
                  <div className="font-medium">{t.name}</div>
                  {t.note && <div className="text-xs text-zinc-500">{t.note}</div>}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <h2 className="font-semibold mb-2">Protokół suplementów ({supplements.length})</h2>
          <ul className="space-y-1.5 text-sm">
            {supplements.map((s) => (
              <li key={s.id} className="flex flex-col">
                <span className="font-medium">💊 {s.name}</span>
                {s.timingRule && <span className="text-xs text-zinc-500">⏰ {s.timingRule}</span>}
                {s.purpose && <span className="text-xs text-zinc-500">→ {s.purpose}</span>}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
