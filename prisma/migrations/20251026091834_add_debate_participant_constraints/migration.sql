-- AlterTable
ALTER TABLE "debates" ADD COLUMN     "maxParticipants" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "minParticipants" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "requiresModerator" BOOLEAN NOT NULL DEFAULT false;
