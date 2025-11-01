-- AlterTable
-- Drop the index on the old mode column
DROP INDEX IF EXISTS "debates_mode_idx";

-- Make modeId required (NOT NULL)
ALTER TABLE "debates" ALTER COLUMN "modeId" SET NOT NULL;

-- Drop existing foreign key and recreate with RESTRICT
ALTER TABLE "debates" DROP CONSTRAINT IF EXISTS "debates_modeId_fkey";
ALTER TABLE "debates" ADD CONSTRAINT "debates_modeId_fkey" FOREIGN KEY ("modeId") REFERENCES "debate_modes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop the legacy mode enum column
ALTER TABLE "debates" DROP COLUMN "mode";

-- Drop the DebateMode enum type if it exists and is no longer used
-- Note: This will fail if any other tables still use this enum (which is safe - FormatTemplate still uses it)
-- So we'll comment this out and clean it up later when FormatTemplate is migrated
-- DROP TYPE IF EXISTS "DebateMode";
