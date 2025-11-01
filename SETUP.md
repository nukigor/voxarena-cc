# VoxArena Setup Guide

This guide will help you get VoxArena up and running on your local machine.

## Initial Setup Complete

The project has been initialized with:

✅ Next.js 14+ with TypeScript and App Router
✅ Tailwind CSS with shadcn/ui configuration
✅ Prisma ORM with complete database schema
✅ OpenAI integration for AI generation
✅ ElevenLabs integration for voice synthesis
✅ Cloudflare R2 integration for media storage
✅ Project structure and core utilities

## Next Steps

### 1. Configure Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Fill in your credentials:

**Required immediately:**
- `DATABASE_URL` - Your Neon PostgreSQL connection string

**Required before running AI features:**
- `OPENAI_API_KEY` - From platform.openai.com
- `ELEVENLABS_API_KEY` - From elevenlabs.io
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` - From Cloudflare
- `R2_BUCKET_NAME` - Your R2 bucket name
- `R2_PUBLIC_URL` - Your R2 public URL

### 2. Initialize Database

Generate Prisma client and push schema to your database:

```bash
npx prisma generate
npx prisma db push
```

This will create all necessary tables in your Neon database.

### 3. Seed Initial Data (Optional)

You'll need to create initial taxonomy categories and terms for persona creation. You can:

**Option A:** Create them through the admin UI (once built)

**Option B:** Create a seed script at `prisma/seed.ts` with initial taxonomy data

Example seed script structure:
```typescript
import { PrismaClient, FieldType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Age Group category
  await prisma.taxonomyCategory.create({
    data: {
      name: 'Age Group',
      slug: 'age-group',
      description: 'The age range of the persona',
      fieldType: FieldType.SINGLE_SELECT,
      isMandatory: true,
      promptWeight: 6,
      sortOrder: 1,
      terms: {
        create: [
          { name: '18-25', slug: '18-25', description: 'Young adult', sortOrder: 1 },
          { name: '26-35', slug: '26-35', description: 'Young professional', sortOrder: 2 },
          // ... more terms
        ]
      }
    }
  });

  // Create more categories...
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
```

Then run:
```bash
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Verify Setup

Open Prisma Studio to verify your database:
```bash
npx prisma studio
```

This opens a GUI at [http://localhost:5555](http://localhost:5555) where you can view and edit your data.

## Development Workflow

### Creating Your First Persona

1. **Seed Taxonomy Data** - Create categories and terms (see step 3 above)
2. **Build Admin UI** - Create the persona form component
3. **Test Persona Creation** - Create a test persona through the UI
4. **Generate Avatar** - Test DALL-E avatar generation

### Creating Your First Debate

1. **Create Personas** - At least 2 debater personas (and optionally 1 moderator)
2. **Build Debate Form** - Admin interface for debate creation
3. **Test Debate Generation** - Generate a short test debate
4. **Test Audio Generation** - Generate audio using ElevenLabs
5. **Upload to R2** - Test media storage

## Project Architecture

### Database Schema

The Prisma schema includes:

- **Taxonomy System**: `TaxonomyCategory`, `TaxonomyTerm`, `PersonaTaxonomyValue`
- **Personas**: `Persona` with free-text and taxonomy-based attributes
- **Debates**: `Debate`, `DebateParticipant` with transcript and audio
- **Analytics**: `DebateAnalytics`, `AnalyticsEvent` for tracking
- **Users**: `User` (for future auth implementation)

### Key Files

- `src/lib/db/prisma.ts` - Prisma client singleton
- `src/lib/db/taxonomy-helpers.ts` - Taxonomy query utilities
- `src/lib/ai/prompt-builder.ts` - Persona → AI prompt conversion
- `src/lib/ai/providers/openai.ts` - OpenAI integration
- `src/lib/voice/elevenlabs.ts` - ElevenLabs integration
- `src/lib/storage/r2-client.ts` - Cloudflare R2 integration

### Type Definitions

- `src/types/persona.ts` - Persona-related types
- `src/types/debate.ts` - Debate-related types
- `src/types/taxonomy.ts` - Taxonomy-related types

## Troubleshooting

### Database Connection Issues

If you can't connect to Neon:
1. Verify your `DATABASE_URL` in `.env.local`
2. Check that SSL mode is enabled: `?sslmode=require`
3. Test connection: `npx prisma db push`

### TypeScript Errors

If you see type errors:
1. Regenerate Prisma client: `npx prisma generate`
2. Run type check: `npm run type-check`
3. Restart TypeScript server in your IDE

### Build Errors

If the build fails:
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check for syntax errors: `npm run lint`

## Next Development Steps

### Immediate Priority (MVP)

1. **Taxonomy Management UI**
   - Create `/admin/taxonomy` page
   - CRUD for categories and terms
   - Integrated quick-add in persona form

2. **Persona Management UI**
   - Create `/admin/personas` page
   - Dynamic form based on taxonomy
   - Avatar generation and fallback

3. **Debate Management UI**
   - Create `/admin/debates` page
   - Debate creation form
   - Generation progress tracking

4. **Public Debate Library**
   - Create `/debates` page
   - Debate listing and filtering
   - Individual debate player page

5. **Admin Authentication**
   - Implement NextAuth.js
   - Protect admin routes
   - Basic session management

### Future Enhancements

- User registration and subscriptions
- Advanced analytics dashboard
- Debate remixes and variations
- API for external integrations
- Mobile-responsive optimizations

## Resources

- **Documentation**: See [CLAUDE.md](./CLAUDE.md) for comprehensive docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

## Support

For issues or questions:
1. Check [CLAUDE.md](./CLAUDE.md) troubleshooting section
2. Review error logs in console
3. Verify environment variables are set correctly
4. Check service status (Neon, OpenAI, ElevenLabs, Cloudflare)

---

**You're all set!** Start by seeding taxonomy data and building the admin UI. Happy coding! 🚀
