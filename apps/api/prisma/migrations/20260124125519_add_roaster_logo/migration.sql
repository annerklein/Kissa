-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "defaultServings" INTEGER NOT NULL DEFAULT 2,
    "gramsPerServing" INTEGER NOT NULL DEFAULT 15,
    "displayPreferences" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GrinderState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grinderModel" TEXT NOT NULL DEFAULT 'Comandante C40',
    "currentSetting" REAL NOT NULL DEFAULT 20,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Roaster" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Bean" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roasterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originCountry" TEXT,
    "originRegion" TEXT,
    "varietal" TEXT,
    "process" TEXT,
    "roastLevel" TEXT NOT NULL DEFAULT 'MEDIUM',
    "tastingNotesExpected" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bean_roasterId_fkey" FOREIGN KEY ("roasterId") REFERENCES "Roaster" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "beanId" TEXT NOT NULL,
    "roastDate" DATETIME NOT NULL,
    "openedDate" DATETIME,
    "bagSizeGrams" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'UNOPENED',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bag_beanId_fkey" FOREIGN KEY ("beanId") REFERENCES "Bean" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Method" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "scalingRules" TEXT,
    "defaultParams" TEXT,
    "steps" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BagMethodTarget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bagId" TEXT NOT NULL,
    "methodId" TEXT NOT NULL,
    "grinderTarget" REAL,
    "recipeOverrides" TEXT,
    "dialStatus" TEXT NOT NULL DEFAULT 'DIALING_IN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BagMethodTarget_bagId_fkey" FOREIGN KEY ("bagId") REFERENCES "Bag" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BagMethodTarget_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "Method" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BrewLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bagId" TEXT NOT NULL,
    "methodId" TEXT NOT NULL,
    "parameters" TEXT,
    "ratingSliders" TEXT,
    "drawdownTime" REAL,
    "computedScore" REAL,
    "tastingNotesActual" TEXT,
    "notes" TEXT,
    "suggestionShown" TEXT,
    "suggestionAccepted" BOOLEAN,
    "brewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BrewLog_bagId_fkey" FOREIGN KEY ("bagId") REFERENCES "Bag" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BrewLog_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "Method" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Method_name_key" ON "Method"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BagMethodTarget_bagId_methodId_key" ON "BagMethodTarget"("bagId", "methodId");
