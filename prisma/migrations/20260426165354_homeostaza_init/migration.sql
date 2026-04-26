-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "heightCm" INTEGER,
    "weightKg" REAL,
    "birthDate" DATETIME,
    "diagnosesJson" TEXT NOT NULL DEFAULT '[]',
    "eliminationsJson" TEXT NOT NULL DEFAULT '[]',
    "knownTriggersJson" TEXT NOT NULL DEFAULT '[]',
    "goal" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SymptomDefinition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "namePl" TEXT NOT NULL,
    "nameEn" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "SupplementProtocol" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "defaultTime" TEXT,
    "timingRule" TEXT,
    "purpose" TEXT,
    "dosage" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Day" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "morningSleepQuality" INTEGER,
    "morningSleepDurationH" REAL,
    "morningEnergy" INTEGER,
    "morningMood" INTEGER,
    "eveningEnergy" INTEGER,
    "eveningOverall" INTEGER,
    "eveningStress" INTEGER,
    "whatWorked" TEXT,
    "whatDidntWork" TEXT,
    "notes" TEXT,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "occurredAt" DATETIME NOT NULL,
    "description" TEXT,
    "severity" INTEGER,
    "symptomDefinitionId" INTEGER,
    "supplementProtocolId" TEXT,
    "metaJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Event_symptomDefinitionId_fkey" FOREIGN KEY ("symptomDefinitionId") REFERENCES "SymptomDefinition" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Event_supplementProtocolId_fkey" FOREIGN KEY ("supplementProtocolId") REFERENCES "SupplementProtocol" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SymptomDefinition_code_key" ON "SymptomDefinition"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Day_date_key" ON "Day"("date");

-- CreateIndex
CREATE INDEX "Day_date_idx" ON "Day"("date");

-- CreateIndex
CREATE INDEX "Event_dayId_occurredAt_idx" ON "Event"("dayId", "occurredAt");

-- CreateIndex
CREATE INDEX "Event_type_idx" ON "Event"("type");
