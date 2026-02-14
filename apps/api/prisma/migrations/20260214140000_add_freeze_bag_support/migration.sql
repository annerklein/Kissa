-- Add freeze bag support: frozenAt, totalFrozenDays, isFrozenBag columns and FROZEN status
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "beanId" TEXT NOT NULL,
    "roastDate" DATETIME NOT NULL,
    "openedDate" DATETIME,
    "bagSizeGrams" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'UNOPENED',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "tubePosition" TEXT,
    "notes" TEXT,
    "frozenAt" DATETIME,
    "totalFrozenDays" INTEGER NOT NULL DEFAULT 0,
    "isFrozenBag" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bag_beanId_fkey" FOREIGN KEY ("beanId") REFERENCES "Bean" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Bag" ("id", "beanId", "roastDate", "openedDate", "bagSizeGrams", "status", "isAvailable", "tubePosition", "notes", "createdAt", "updatedAt", "frozenAt", "totalFrozenDays", "isFrozenBag")
    SELECT "id", "beanId", "roastDate", "openedDate", "bagSizeGrams", "status", "isAvailable", "tubePosition", "notes", "createdAt", "updatedAt", NULL, 0, false FROM "Bag";
DROP TABLE "Bag";
ALTER TABLE "new_Bag" RENAME TO "Bag";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
