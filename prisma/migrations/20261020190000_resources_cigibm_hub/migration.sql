-- CreateEnum
CREATE TYPE "ResourceKind" AS ENUM ('note', 'file');

-- CreateEnum
CREATE TYPE "ResourceCategory" AS ENUM ('cigibm', 'ong', 'institutionnel', 'communication', 'autre');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('todo', 'doing', 'done');

-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('programme', 'logistique', 'communication', 'partenaires', 'finances', 'bilan');

-- AlterTable
ALTER TABLE "Edition" ADD COLUMN     "eventDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "ResourceCategory" NOT NULL DEFAULT 'autre',
    "kind" "ResourceKind" NOT NULL,
    "body" TEXT,
    "filePath" TEXT,
    "fileName" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "editionNumber" INTEGER,
    "updatedByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CigibmTask" (
    "id" TEXT NOT NULL,
    "editionNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "category" "TaskCategory" NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'todo',
    "dueDate" TIMESTAMP(3),
    "owner" TEXT,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CigibmTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Resource_category_idx" ON "Resource"("category");

-- CreateIndex
CREATE INDEX "Resource_editionNumber_idx" ON "Resource"("editionNumber");

-- CreateIndex
CREATE INDEX "CigibmTask_editionNumber_category_idx" ON "CigibmTask"("editionNumber", "category");

