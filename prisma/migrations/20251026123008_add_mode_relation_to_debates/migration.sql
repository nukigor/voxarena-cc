-- AlterTable
ALTER TABLE "debates" ADD COLUMN     "modeId" TEXT;

-- CreateIndex
CREATE INDEX "debates_modeId_idx" ON "debates"("modeId");

-- AddForeignKey
ALTER TABLE "debates" ADD CONSTRAINT "debates_modeId_fkey" FOREIGN KEY ("modeId") REFERENCES "debate_modes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
