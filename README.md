# VoxArena

AI-Powered Debate Platform with Distinct Personas

## Overview

VoxArena generates structured, engaging debates on any topic using AI personas as both debaters and moderators. Each persona has unique identities, cultural backgrounds, communication styles, and quirks that create authentic, diverse discourse.

## Features

- **AI Personas** - Create debaters and moderators with taxonomy-based personality attributes
- **Structured Debates** - Multiple formats (1v1, panels, moderated, casual, formal)
- **Dual Output** - Text transcripts + podcast audio (via ElevenLabs)
- **Public Library** - Browse and listen to generated debates
- **Admin Control** - Full CRUD for personas, debates, and taxonomy (MVP)

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **AI**: OpenAI (GPT-4, DALL-E)
- **Voice**: ElevenLabs
- **Storage**: Cloudflare R2

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker Desktop (for local PostgreSQL)
- OpenAI API key
- ElevenLabs API key
- Cloudflare R2 bucket

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd voxarena-cc
```

2. Install dependencies:
```bash
npm install
```

3. Start local PostgreSQL with Docker:
```bash
docker-compose up -d
```

4. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
- `DATABASE_URL` - Already configured for local Docker PostgreSQL
- `OPENAI_API_KEY` - OpenAI API key
- `ELEVENLABS_API_KEY` - ElevenLabs API key
- `R2_*` - Cloudflare R2 credentials

5. Initialize database:
```bash
npx prisma generate
npx prisma db push
```

6. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

**See [DATABASE.md](./DATABASE.md) for detailed database setup and management.**

## Development

### Common Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Database Commands

```bash
# One-command setup (starts DB + runs migrations)
npm run db:setup

# Start PostgreSQL
npm run db:start

# Stop PostgreSQL
npm run db:stop

# Reset database (deletes all data!)
npm run db:reset

# Open database GUI
npm run db:studio

# Push schema changes
npm run db:push

# Regenerate Prisma client
npm run db:generate

# Seed database with initial data
npm run db:seed
```

### Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # Base UI components (shadcn/ui)
│   ├── persona/     # Persona-related components
│   ├── debate/      # Debate-related components
│   └── admin/       # Admin interface components
├── lib/             # Core utilities
│   ├── ai/          # AI provider integrations
│   ├── voice/       # ElevenLabs integration
│   ├── storage/     # Cloudflare R2 integration
│   └── db/          # Database utilities
├── types/           # TypeScript type definitions
└── hooks/           # Custom React hooks
```

## Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start guide
- **[DATABASE.md](./DATABASE.md)** - Database setup and management
- **[DEV-WORKFLOW.md](./DEV-WORKFLOW.md)** - Daily development workflow
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[CLAUDE.md](./CLAUDE.md)** - Complete architecture documentation

## License

MIT
