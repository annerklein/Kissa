/*
  Warnings:

  - You are about to drop the `BagMethodTarget` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BagMethodTarget";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "BeanMethodRecipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "beanId" TEXT NOT NULL,
    "methodId" TEXT NOT NULL,
    "grinderTarget" REAL,
    "recipeOverrides" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BeanMethodRecipe_beanId_fkey" FOREIGN KEY ("beanId") REFERENCES "Bean" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BeanMethodRecipe_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "Method" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BeanMethodRecipe_beanId_methodId_key" ON "BeanMethodRecipe"("beanId", "methodId");
