-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('SINGLE_SELECT', 'MULTI_SELECT', 'SLIDER', 'TEXT');

-- CreateEnum
CREATE TYPE "PersonaStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DebateMode" AS ENUM ('DEBATE', 'PODCAST');

-- CreateEnum
CREATE TYPE "FormatCategory" AS ENUM ('ACADEMIC', 'PROFESSIONAL', 'CASUAL', 'CULTURAL');

-- CreateEnum
CREATE TYPE "DebateStatus" AS ENUM ('DRAFT', 'GENERATING', 'COMPLETED', 'FAILED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('DEBATER', 'MODERATOR', 'JUDGE', 'EXPERT', 'HOST');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('DEBATE_VIEW', 'DEBATE_PLAY', 'DEBATE_COMPLETE', 'DEBATE_SHARE', 'PERSONA_VIEW');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO', 'PREMIUM');

-- CreateTable
CREATE TABLE "taxonomy_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fieldType" "FieldType" NOT NULL,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "promptWeight" INTEGER NOT NULL DEFAULT 5,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taxonomy_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxonomy_terms" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taxonomy_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "avatarUrl" TEXT,
    "teaser" TEXT,
    "description" TEXT,
    "professionRole" TEXT,
    "quirks" TEXT,
    "status" "PersonaStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persona_taxonomy_values" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "persona_taxonomy_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "format_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "FormatCategory" NOT NULL,
    "mode" "DebateMode" NOT NULL DEFAULT 'DEBATE',
    "isPreset" BOOLEAN NOT NULL DEFAULT false,
    "minParticipants" INTEGER NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "requiresModerator" BOOLEAN NOT NULL DEFAULT false,
    "durationMinutes" INTEGER NOT NULL,
    "flexibleTiming" BOOLEAN NOT NULL DEFAULT true,
    "segmentStructure" JSONB NOT NULL,
    "bestFor" TEXT,
    "personaRecommendations" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "format_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debates" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "mode" "DebateMode" NOT NULL DEFAULT 'DEBATE',
    "formatTemplateId" TEXT,
    "description" TEXT,
    "segmentStructure" JSONB,
    "totalDurationMinutes" INTEGER,
    "flexibleTiming" BOOLEAN NOT NULL DEFAULT true,
    "transcript" TEXT,
    "audioUrl" TEXT,
    "duration" INTEGER,
    "status" "DebateStatus" NOT NULL DEFAULT 'DRAFT',
    "generationStartedAt" TIMESTAMP(3),
    "generationCompletedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debate_participants" (
    "id" TEXT NOT NULL,
    "debateId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "role" "ParticipantRole" NOT NULL,
    "speakingOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "debate_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debate_segments" (
    "id" TEXT NOT NULL,
    "debateId" TEXT NOT NULL,
    "segmentKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "content" TEXT,
    "audioUrl" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debate_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debate_analytics" (
    "id" TEXT NOT NULL,
    "debateId" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "completionCount" INTEGER NOT NULL DEFAULT 0,
    "avgCompletionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debate_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "debateId" TEXT,
    "personaId" TEXT,
    "eventType" "EventType" NOT NULL,
    "metadata" JSONB,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "taxonomy_categories_name_key" ON "taxonomy_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "taxonomy_categories_slug_key" ON "taxonomy_categories"("slug");

-- CreateIndex
CREATE INDEX "taxonomy_categories_slug_idx" ON "taxonomy_categories"("slug");

-- CreateIndex
CREATE INDEX "taxonomy_terms_categoryId_idx" ON "taxonomy_terms"("categoryId");

-- CreateIndex
CREATE INDEX "taxonomy_terms_slug_idx" ON "taxonomy_terms"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "taxonomy_terms_categoryId_slug_key" ON "taxonomy_terms"("categoryId", "slug");

-- CreateIndex
CREATE INDEX "personas_status_idx" ON "personas"("status");

-- CreateIndex
CREATE INDEX "personas_createdBy_idx" ON "personas"("createdBy");

-- CreateIndex
CREATE INDEX "persona_taxonomy_values_personaId_idx" ON "persona_taxonomy_values"("personaId");

-- CreateIndex
CREATE INDEX "persona_taxonomy_values_termId_idx" ON "persona_taxonomy_values"("termId");

-- CreateIndex
CREATE UNIQUE INDEX "persona_taxonomy_values_personaId_termId_key" ON "persona_taxonomy_values"("personaId", "termId");

-- CreateIndex
CREATE UNIQUE INDEX "format_templates_slug_key" ON "format_templates"("slug");

-- CreateIndex
CREATE INDEX "format_templates_slug_idx" ON "format_templates"("slug");

-- CreateIndex
CREATE INDEX "format_templates_category_idx" ON "format_templates"("category");

-- CreateIndex
CREATE INDEX "format_templates_mode_idx" ON "format_templates"("mode");

-- CreateIndex
CREATE INDEX "format_templates_isPreset_idx" ON "format_templates"("isPreset");

-- CreateIndex
CREATE UNIQUE INDEX "debates_slug_key" ON "debates"("slug");

-- CreateIndex
CREATE INDEX "debates_status_idx" ON "debates"("status");

-- CreateIndex
CREATE INDEX "debates_mode_idx" ON "debates"("mode");

-- CreateIndex
CREATE INDEX "debates_slug_idx" ON "debates"("slug");

-- CreateIndex
CREATE INDEX "debates_formatTemplateId_idx" ON "debates"("formatTemplateId");

-- CreateIndex
CREATE INDEX "debates_createdBy_idx" ON "debates"("createdBy");

-- CreateIndex
CREATE INDEX "debates_publishedAt_idx" ON "debates"("publishedAt");

-- CreateIndex
CREATE INDEX "debate_participants_debateId_idx" ON "debate_participants"("debateId");

-- CreateIndex
CREATE INDEX "debate_participants_personaId_idx" ON "debate_participants"("personaId");

-- CreateIndex
CREATE UNIQUE INDEX "debate_participants_debateId_personaId_key" ON "debate_participants"("debateId", "personaId");

-- CreateIndex
CREATE INDEX "debate_segments_debateId_idx" ON "debate_segments"("debateId");

-- CreateIndex
CREATE INDEX "debate_segments_orderIndex_idx" ON "debate_segments"("orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "debate_segments_debateId_segmentKey_key" ON "debate_segments"("debateId", "segmentKey");

-- CreateIndex
CREATE UNIQUE INDEX "debate_analytics_debateId_key" ON "debate_analytics"("debateId");

-- CreateIndex
CREATE INDEX "debate_analytics_debateId_idx" ON "debate_analytics"("debateId");

-- CreateIndex
CREATE INDEX "analytics_events_debateId_idx" ON "analytics_events"("debateId");

-- CreateIndex
CREATE INDEX "analytics_events_personaId_idx" ON "analytics_events"("personaId");

-- CreateIndex
CREATE INDEX "analytics_events_eventType_idx" ON "analytics_events"("eventType");

-- CreateIndex
CREATE INDEX "analytics_events_createdAt_idx" ON "analytics_events"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- AddForeignKey
ALTER TABLE "taxonomy_terms" ADD CONSTRAINT "taxonomy_terms_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "taxonomy_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persona_taxonomy_values" ADD CONSTRAINT "persona_taxonomy_values_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persona_taxonomy_values" ADD CONSTRAINT "persona_taxonomy_values_termId_fkey" FOREIGN KEY ("termId") REFERENCES "taxonomy_terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debates" ADD CONSTRAINT "debates_formatTemplateId_fkey" FOREIGN KEY ("formatTemplateId") REFERENCES "format_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debate_participants" ADD CONSTRAINT "debate_participants_debateId_fkey" FOREIGN KEY ("debateId") REFERENCES "debates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debate_participants" ADD CONSTRAINT "debate_participants_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debate_segments" ADD CONSTRAINT "debate_segments_debateId_fkey" FOREIGN KEY ("debateId") REFERENCES "debates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debate_analytics" ADD CONSTRAINT "debate_analytics_debateId_fkey" FOREIGN KEY ("debateId") REFERENCES "debates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
