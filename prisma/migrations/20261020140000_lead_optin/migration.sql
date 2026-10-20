
-- CreateEnum
CREATE TYPE "LeadChannel" AS ENUM ('email', 'whatsapp');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "channel" "LeadChannel" NOT NULL,
    "email" TEXT,
    "whatsapp" TEXT,
    "needsHelp" BOOLEAN NOT NULL DEFAULT false,
    "sourcePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contactedAt" TIMESTAMP(3),

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

