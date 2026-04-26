# Homeostaza

Personalna platforma zarządzania zdrowiem dla osób z **wielopłaszczyznowymi schorzeniami przewlekłymi**, gdzie standardowe aplikacje fitness/zdrowotne nie radzą sobie z **interakcjami między obszarami** (jedzenie ↔ trawienie ↔ trening ↔ sen ↔ samopoczucie ↔ suplementacja).

> "Operating system dnia dla osób z przewlekłymi syndromami, które nie mieszczą się w standardowych aplikacjach zdrowotnych."

**Status:** MVP Faza 1 (zgodnie ze spec § 6).

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4) — mobile-first
- **Prisma 7 + SQLite** (better-sqlite3 adapter) — local-first MVP, single-user
- **YAML+MD** dla importu/eksportu dziennika

> Spec rekomenduje Supabase + Vercel. Zaczynamy lokalnie (single-user, prywatne dane) — migracja do Supabase w fazie 4 (multi-user / komercjalizacja).

## Setup

```bash
npm install
npm run db:setup         # migracja + seed słownika objawów + profilu + suplementów
npm run import:diary     # opcjonalne — import historycznego dziennika z dane/
npm run dev              # http://localhost:3000
```

## Funkcje (MVP Faza 1)

### ✅ Co działa
- **Dashboard** z heatmapą 14 dni (intensywność objawów), Quick Log, podsumowaniem dnia
- **Quick Log** — 3 wielkie przyciski (Posiłek / Objaw / Suplement) z formularzami
- **Log Posiłku** — czas, opis, tag (śniadanie/lunch/kolacja), stan po posiłku
- **Log Objawu** — kategoria (gut/mood/energy/cognition/skin/joints_muscles/sleep/vascular), konkretny objaw ze słownika 46 pozycji, severity 1-10, notatka
- **Log Suplementu** — multi-select z protokołu (13 suplementów Jacka)
- **Morning Check-in** — sen jakość/długość, energia, nastrój
- **Profile** — diagnozy, eliminacje, znane triggery, protokół suplementów
- **Historia** — wszystkie dni chronologicznie z eventami i notatkami
- **Importer dziennika** z YAML+MD (zaimportowano 21 dni / 112 zdarzeń z chat_zdrowie)

### ⏭️ Co dodać (Faza 2 wg spec § 9)
- [ ] Evening reflection
- [ ] Dashboard tygodniowy z wykresami (recharts)
- [ ] Eksport do .md (jeden plik per dzień)
- [ ] PWA (offline-first, instalacja na telefonie)
- [ ] Schedule template (rytm dnia)
- [ ] Push notifications
- [ ] **Silnik korelacji** (time-lag, day-of-week, trigger compounding, suplement correlation)
- [ ] Tygodniowy raport AI (Claude API z `anthropic-skip-retention`)
- [ ] Free-text → strukturalne objawy (Claude tagging)

### ⏭️ Faza 3: Trening + Hevy + Postura
- Import treningów z Hevy (CSV)
- Codzienna mini-rutyna korekcyjna (10 min, APT)
- Pomiary co 4 tygodnie
- Workspace mode tracking

### ⏭️ Faza 4: Komercjalizacja
- Supabase migration (multi-user)
- Onboarding dla nowych personae (Hashimoto+IBS, posturalne, IBS+FODMAP)
- Templates protokołów
- Pricing model

## Skrypty

| Komenda | Opis |
|---------|------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Build produkcyjny |
| `npm run db:migrate` | Migracja schematu |
| `npm run db:seed` | Seed słownika + profilu + suplementów |
| `npm run db:setup` | Migracja + seed razem |
| `npm run db:studio` | Prisma Studio (GUI bazy) |
| `npm run import:diary` | Import dziennika z `dane/dziennik_export_zdrowie.md` |

## Model danych

```
Profile         — single-user (diagnozy, eliminacje, triggery, cele)
Day             — 1 rekord / data (morning + evening check-in, notes)
Event           — meal | supplement | symptom | activity | break
SymptomDefinition — słownik 46 objawów PL (8 kategorii)
SupplementProtocol — protokół suplementów użytkownika
```

## Privacy

- **Dane medyczne** — maksymalna ochrona.
- Wszystko **lokalnie** w SQLite (`prisma/dev.db`).
- `/dane/` w `.gitignore` — **NIGDY** nie commitować dziennika, badań, pomiarów.
- Brak telemetrii, brak zewnętrznych API w MVP.
- (Faza 2 — Claude API z `anthropic-skip-retention: true`.)

## Profil bazowy (seed)

Aplikacja jest seedowana dla **Jacka Osojcy** (191 cm, 76 kg) — diagnozy:
Zespół Gilberta (UGT1A1 TA7/TA7), niewydolność zwieracza przełyku + refluks żółciowy,
gastritis, podejrzenie Hashimoto (anty-TG 25.10 IU/ml), Raynaud, niedobory B12/folowy/wapń.
Protokół 13 suplementów (dietetyk: Nadiia Reczek).

Aby zacząć z czystym profilem — usuń seed z `scripts/seed.ts` i `lib/symptoms.ts`.

## Dokumentacja źródłowa

- **`dane/homeostaza_spec_dla_manusa.md`** — pełna specyfikacja produktu (gitignored, prywatne)
- **`dane/dziennik_export_zdrowie.md`** — historyczny dziennik (gitignored)
- **`dane/wyniki_historia_pelna.html`** — historia badań krwi 2019-2026 (gitignored)
