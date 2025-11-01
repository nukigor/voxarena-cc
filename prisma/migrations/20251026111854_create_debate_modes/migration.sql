-- CreateTable
CREATE TABLE "debate_modes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "teaser" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debate_modes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "debate_modes_name_key" ON "debate_modes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "debate_modes_slug_key" ON "debate_modes"("slug");

-- CreateIndex
CREATE INDEX "debate_modes_slug_idx" ON "debate_modes"("slug");
