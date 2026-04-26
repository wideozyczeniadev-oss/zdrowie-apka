# Zdrowie-apka

Lokalna aplikacja do planowania i przypominania o codziennych rutynach zdrowotnych:
posiłki, treningi, nawyki. Działa lokalnie (SQLite + Next.js) z natywnymi
powiadomieniami systemowymi (Windows toast / macOS / Linux).

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind v4)
- **Prisma + SQLite** — baza lokalna (`prisma/dev.db`)
- **node-notifier** — powiadomienia systemowe
- **node-cron** — scheduler (sprawdza co minutę)

## Setup

```bash
npm install
npm run db:setup     # migracja + seed (przykładowe aktywności)
npm run dev          # UI:        http://localhost:3000
npm run scheduler    # w drugim terminalu — przypomnienia
```

## Skrypty

| Komenda | Opis |
|---------|------|
| `npm run dev` | Uruchamia Next.js dev server |
| `npm run build` | Build produkcyjny |
| `npm run start` | Start produkcyjny |
| `npm run scheduler` | Background worker — wysyła powiadomienia o zaplanowanej godzinie |
| `npm run db:migrate` | Tworzy / aktualizuje schemat bazy |
| `npm run db:seed` | Wypełnia bazę przykładowymi aktywnościami |
| `npm run db:setup` | Migracja + seed razem |
| `npm run db:studio` | Prisma Studio — przeglądanie bazy w GUI |

## Struktura

```
zdrowie-apka/
├── app/
│   ├── page.tsx                    # Główny widok — plan na dziś
│   ├── components/
│   │   ├── ActivityList.tsx        # Lista aktywności z checkboxami
│   │   └── ActivityForm.tsx        # Formularz dodawania
│   ├── api/activities/
│   │   ├── route.ts                # GET / POST aktywności
│   │   ├── [id]/route.ts           # DELETE / PATCH
│   │   └── toggle/route.ts         # Oznaczanie wykonania
│   └── generated/prisma/           # Wygenerowany klient Prisma (gitignored)
├── lib/
│   ├── db.ts                       # Singleton PrismaClient
│   └── schedule.ts                 # Logika powtarzalności
├── prisma/
│   └── schema.prisma               # Model: Activity + ActivityLog
└── scripts/
    ├── scheduler.ts                # Worker — powiadomienia
    └── seed.ts                     # Przykładowe dane
```

## Model danych

**Activity** — aktywność do wykonania (typ: posiłek/trening/rutyna)
- `time` — godzina dzienna w formacie `HH:mm`
- `recurrence` — `DAILY` / `WEEKDAYS` / `WEEKLY` / `ONCE`
- `weekdays` — dla `WEEKLY`, lista np. `MON,WED,FRI`
- pola zdrowotne: `calories`, `protein`, `durationMin`

**ActivityLog** — instancja aktywności w danym dniu
- `scheduledAt` — kiedy miała się odbyć
- `completedAt` — kiedy oznaczono jako wykonane
- `notifiedAt` — kiedy wysłano powiadomienie (zapobiega duplikatom)

## Autostart schedulera (Windows)

Żeby przypomnienia działały bez ręcznego startu:

1. Otwórz **Harmonogram zadań** (Task Scheduler).
2. Utwórz nowe zadanie — uruchamiane przy logowaniu użytkownika.
3. Akcja: program `cmd.exe`, argumenty:
   ```
   /c cd /d D:\Antigrawity\zdrowie-apka && npm run scheduler
   ```

## Roadmapa (kolejne wersje)

- [ ] Widok tygodniowy / miesięczny
- [ ] Statystyki — % wykonania, kalorie/białko per tydzień
- [ ] Import/eksport JSON
- [ ] Integracja z Google Calendar
- [ ] PWA (instalacja na telefonie)
- [ ] Tagowanie aktywności (np. cele zdrowotne)
