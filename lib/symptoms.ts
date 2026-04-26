// Slownik objawow Homeostazy — klinicznie polski
// Zgodny ze spec § 5.3

export type SymptomCategory =
  | "gut"
  | "mood"
  | "energy"
  | "cognition"
  | "skin"
  | "joints_muscles"
  | "sleep"
  | "vascular";

export const CATEGORY_LABEL: Record<SymptomCategory, string> = {
  gut: "Jelita / żołądek",
  mood: "Nastrój",
  energy: "Energia",
  cognition: "Poznawcze",
  skin: "Skóra",
  joints_muscles: "Stawy / mięśnie",
  sleep: "Sen",
  vascular: "Naczyniowe",
};

export const CATEGORY_ICON: Record<SymptomCategory, string> = {
  gut: "🫃",
  mood: "🧠",
  energy: "⚡",
  cognition: "💭",
  skin: "🟥",
  joints_muscles: "🦴",
  sleep: "🛌",
  vascular: "🩸",
};

type SymptomDef = { code: string; namePl: string; nameEn?: string; category: SymptomCategory; description?: string };

export const SYMPTOM_DICTIONARY: SymptomDef[] = [
  // GUT
  { code: "bloating", namePl: "Wzdęcie", nameEn: "bloating", category: "gut" },
  { code: "reflux", namePl: "Refluks", nameEn: "reflux", category: "gut" },
  { code: "heaviness_after_meal", namePl: "Ciężkość po posiłku", category: "gut" },
  { code: "cramping", namePl: "Skurcze brzucha", category: "gut" },
  { code: "constipation", namePl: "Zaparcie", category: "gut" },
  { code: "urgent_bowel", namePl: "Nagła potrzeba wypróżnienia", category: "gut" },
  { code: "intestinal_gurgling", namePl: "Przelewanie / bulgotanie w jelitach", category: "gut" },
  { code: "stomach_stuck", namePl: "Uczucie utknięcia jedzenia w żołądku", category: "gut" },
  { code: "nausea", namePl: "Nudności", category: "gut" },
  { code: "fizjologiczne_rozladowanie_napiecia", namePl: "Fizjologiczne rozładowanie napięcia", category: "gut" },

  // MOOD
  { code: "anxiety", namePl: "Niepokój", category: "mood" },
  { code: "low_mood", namePl: "Spadek nastroju", category: "mood" },
  { code: "irritability", namePl: "Rozdrażnienie", category: "mood" },
  { code: "apathy", namePl: "Apatia", category: "mood" },
  { code: "emotional_dysregulation", namePl: "Dysregulacja emocjonalna", category: "mood" },
  { code: "depression_episode", namePl: "Epizod depresyjny", category: "mood" },

  // ENERGY
  { code: "energy_drop", namePl: "Spadek energii", category: "energy" },
  { code: "post_meal_crash", namePl: "Spadek po posiłku", category: "energy" },
  { code: "morning_fatigue", namePl: "Zmęczenie poranne", category: "energy" },
  { code: "afternoon_slump", namePl: "Spadek popołudniowy", category: "energy" },
  { code: "wired_tired", namePl: "Zmęczony ale pobudzony", category: "energy" },

  // COGNITION
  { code: "brain_fog", namePl: "Mgła mózgowa", category: "cognition" },
  { code: "reduced_clarity", namePl: "Zmniejszona przejrzystość myślenia", category: "cognition" },
  { code: "difficulty_focusing", namePl: "Trudność skupienia", category: "cognition" },
  { code: "memory_lapse", namePl: "Krótkotrwała luka w pamięci", category: "cognition" },

  // SKIN
  { code: "flushing_face", namePl: "Zaczerwienienie twarzy", category: "skin" },
  { code: "peeling_face", namePl: "Złuszczanie twarzy", category: "skin" },
  { code: "rash_chest", namePl: "Wysypka — klatka piersiowa", category: "skin" },
  { code: "rash_elbows_knees", namePl: "Wysypka — łokcie / kolana", category: "skin" },
  { code: "itching", namePl: "Świąd", category: "skin" },

  // JOINTS / MUSCLES
  { code: "intestinal_tension", namePl: "Napięcie jelitowe", category: "joints_muscles" },
  { code: "muscle_tightness", namePl: "Napięcie mięśniowe", category: "joints_muscles" },
  { code: "shoulder_tension", namePl: "Spięcie barków", category: "joints_muscles" },
  { code: "joint_stiffness", namePl: "Sztywność stawów", category: "joints_muscles" },
  { code: "lower_back_pain", namePl: "Ból lędźwi", category: "joints_muscles" },
  { code: "jaw_tension", namePl: "Spięcie szczęki", category: "joints_muscles" },
  { code: "suboccipital_tension", namePl: "Napięcie podpotyliczne", category: "joints_muscles" },

  // SLEEP
  { code: "difficulty_falling_asleep", namePl: "Trudność zaśnięcia", category: "sleep" },
  { code: "night_waking", namePl: "Pobudki nocne", category: "sleep" },
  { code: "early_waking", namePl: "Wczesne pobudki", category: "sleep" },
  { code: "non_restorative_sleep", namePl: "Nieregenerujący sen", category: "sleep" },
  { code: "vivid_dreams", namePl: "Intensywne sny", category: "sleep" },

  // VASCULAR
  { code: "cold_extremities", namePl: "Zimne kończyny", category: "vascular" },
  { code: "vasoconstriction_signs", namePl: "Objawy zwężenia naczyń", category: "vascular" },
  { code: "flushing_general", namePl: "Ogólne zaczerwienienie", category: "vascular" },
  { code: "lightheaded_standing", namePl: "Zawroty głowy przy wstawaniu", category: "vascular" },
];

// Profil Jacka — z spec § 2.1
export const JACEK_PROFILE = {
  fullName: "Jacek Osojca",
  heightCm: 191,
  weightKg: 76,
  diagnoses: [
    "Zespół Gilberta (UGT1A1 homozygota TA7/TA7)",
    "Niewydolność zwieracza przełyku + refluks żółciowy",
    "Zapalenie błony śluzowej żołądka (gastroskopia + histopatologia)",
    "Niedobory: wapń, B12, kwas foliowy (z podwyższoną homocysteiną)",
    "Podejrzenie Hashimoto (anty-TG 25.10 IU/ml — 25x norma)",
    "Raynaud (zimne kończyny)",
  ],
  eliminations: [
    { name: "Białko mleka krowiego (kazeina)", reason: "Spadki nastroju, wykwity skórne — dose-dependent" },
    { name: "Jajka", reason: "Zaczerwienienie twarzy + złuszczanie" },
    { name: "Kofeina", reason: "Zwężenie naczyń, spadek koncentracji" },
    { name: "Wędliny przetworzone", reason: "Napięcie + spadek energii" },
    { name: "Pomidory", reason: "Aktywna eliminacja post-gastroskopia" },
    { name: "Cytrusy", reason: "Aktywna eliminacja post-gastroskopia" },
    { name: "Smażone", reason: "Aktywna eliminacja post-gastroskopia" },
    { name: "Czosnek", reason: "Aktywna eliminacja post-gastroskopia" },
    { name: "Ostre przyprawy", reason: "Aktywna eliminacja post-gastroskopia" },
  ],
  knownTriggers: [
    { name: "Jedzenie po 21:00", severity: 8, note: "Trudne poranki — sphincter insufficiency potwierdzone klinicznie" },
    { name: "Cukry proste wieczorem", severity: 6, note: "Fermentacja + zły sen" },
    { name: "Owoce solo", severity: 4, note: "Glukozowe huśtawki" },
    { name: "Duże dawki tłuszczu", severity: 6, note: "Spadki energii — dysfunkcja woreczka żółciowego" },
  ],
  goal: "Budowa masy mięśniowej 76 → 80 kg w 12 tygodni; korekta APT + propriocepcja + asymetria L/R",
};

export const JACEK_SUPPLEMENTS = [
  { name: "Mastyka", timingRule: "Przed snem", purpose: "Mucosa" },
  { name: "Lypo Gold", timingRule: "Start każdego posiłku", purpose: "Lipaza" },
  { name: "TUDCA", timingRule: "1.5h po kolacji", purpose: "Bile flow" },
  { name: "Psyllium husk", timingRule: "1× między posiłkami", purpose: "Fiber" },
  { name: "LiverCare", timingRule: "30 min przed posiłkiem", purpose: "Liver support" },
  { name: "Two-Per-Day", defaultTime: "08:30", timingRule: "Po śniadaniu", purpose: "Multi" },
  { name: "Omega-3", purpose: "Anti-inflammatory (UWAGA: >500mg/dzień hamuje UGT1A1)" },
  { name: "Calcium", timingRule: "Z każdym posiłkiem", purpose: "Niedobór" },
  { name: "Norsa (creatine/carnitine/nucleotides)", purpose: "Performance" },
  { name: "Homocysteine regulator", purpose: "Folate cycle" },
  { name: "Methylcobalamin B12", timingRule: "Krople pod język", purpose: "Niedobór B12" },
  { name: "Collagen peptides", purpose: "Joints / skin" },
  { name: "L-glutamine", purpose: "Mucosa" },
];
