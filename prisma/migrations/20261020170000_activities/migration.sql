
-- CreateEnum
CREATE TYPE "ActivityAxis" AS ENUM ('humanitaire', 'guerison', 'autonomisation');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('en_cours', 'en_projet', 'terminee');

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "axis" "ActivityAxis" NOT NULL,
    "audience" TEXT,
    "status" "ActivityStatus" NOT NULL DEFAULT 'en_projet',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "href" TEXT,
    "internalNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Activity_slug_key" ON "Activity"("slug");

-- CreateIndex
CREATE INDEX "Activity_axis_sortOrder_idx" ON "Activity"("axis", "sortOrder");

