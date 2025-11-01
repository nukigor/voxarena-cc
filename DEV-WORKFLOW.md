# Development Workflow Guide

## Daily Development Flow

### Starting Your Day

```bash
# 1. Start PostgreSQL
npm run db:start

# 2. Start development server
npm run dev

# 3. (Optional) Open database GUI in another terminal
npm run db:studio
```

Now you're ready to code! 🚀

### Ending Your Day

```bash
# Stop the development server (Ctrl+C)

# (Optional) Stop PostgreSQL to free up resources
npm run db:stop
```

**Note:** You can leave PostgreSQL running - it won't consume much resources when idle.

## Common Development Tasks

### Making Database Schema Changes

1. **Edit the schema:**
```bash
# Open prisma/schema.prisma in your editor
code prisma/schema.prisma
```

2. **Apply changes to database:**
```bash
npm run db:push
```

3. **Regenerate Prisma client (if needed):**
```bash
npm run db:generate
```

4. **Restart your dev server** (Ctrl+C, then `npm run dev`)

### Creating New Components

```bash
# Example: Creating a persona form component
touch src/components/persona/PersonaForm.tsx

# Follow the project structure:
# - UI components → src/components/ui/
# - Feature components → src/components/[feature]/
# - Layout components → src/components/layout/
```

### Adding New Pages

```bash
# Next.js App Router uses file-based routing
# Example: Creating an admin personas page

mkdir -p src/app/admin/personas
touch src/app/admin/personas/page.tsx
```

### Testing API Endpoints

```bash
# Example: Creating a personas API endpoint
mkdir -p src/app/api/personas
touch src/app/api/personas/route.ts
```

Test with:
```bash
curl http://localhost:3000/api/personas
```

### Viewing Database Changes

**Option 1: Prisma Studio (GUI)**
```bash
npm run db:studio
```

**Option 2: psql (CLI)**
```bash
docker-compose exec postgres psql -U voxarena -d voxarena_dev
```

**Option 3: TablePlus/pgAdmin**
- Host: `localhost`
- Port: `5432`
- Database: `voxarena_dev`
- User: `voxarena`
- Password: `voxarena_dev_password`

## Git Workflow

### Before Committing

```bash
# 1. Format code
npm run format

# 2. Check for linting errors
npm run lint

# 3. Type check
npm run type-check

# 4. Test build
npm run build
```

### Creating a Commit

```bash
git add .
git commit -m "feat: descriptive commit message"
```

**Commit message conventions:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## Debugging

### Database Issues

**Can't connect to database:**
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check logs
docker-compose logs -f postgres

# Restart PostgreSQL
npm run db:stop
npm run db:start
```

**Schema out of sync:**
```bash
npm run db:generate
npm run db:push
```

**Need to start fresh:**
```bash
npm run db:reset
```

### TypeScript Errors

**"Cannot find module @prisma/client":**
```bash
npm run db:generate
```

**Stale types:**
```bash
# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"

# Or restart the entire dev server
# Ctrl+C, then npm run dev
```

### Build Errors

**Cache issues:**
```bash
rm -rf .next
npm run dev
```

**Dependency issues:**
```bash
rm -rf node_modules
npm install
```

## Testing Features

### Testing Persona Creation

1. Create taxonomy categories and terms (manually in Prisma Studio or via seed script)
2. Build persona form UI
3. Test avatar generation (requires OpenAI API key)
4. Verify data in Prisma Studio

### Testing Debate Generation

1. Create at least 2 personas
2. Build debate form UI
3. Test transcript generation (requires OpenAI API key)
4. Test audio generation (requires ElevenLabs API key)
5. Test R2 upload (requires R2 credentials)

### Testing Without API Keys

You can develop UI and forms without API keys:
- Use mock data for personas
- Skip avatar/audio generation
- Test database CRUD operations
- Build admin interfaces

Add API keys later when testing AI features.

## Performance Tips

### Fast Refresh

Next.js has Fast Refresh - your changes appear instantly without full reload. Keep your dev server running!

### Database Performance

**Use indexes** for frequently queried fields (already set up in schema with `@@index`)

**Check query performance** in Prisma Studio:
```typescript
// Enable query logging in prisma/schema.prisma
// generator client {
//   provider = "prisma-client-js"
//   log      = ["query"]
// }
```

## Environment Switching

### Development (Local Docker)

```bash
# .env.local
DATABASE_URL="postgresql://voxarena:voxarena_dev_password@localhost:5432/voxarena_dev"
```

### Production (Neon)

```bash
# .env.local (or .env.production)
DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"
```

## Useful VS Code Extensions

Recommended for VoxArena development:

1. **Prisma** - Syntax highlighting for `.prisma` files
2. **Tailwind CSS IntelliSense** - Autocomplete for Tailwind classes
3. **ESLint** - Real-time linting
4. **Prettier** - Auto-formatting on save
5. **Thunder Client** - API testing
6. **Docker** - Manage containers

## Quick Reference

### Project URLs

- **App**: http://localhost:3000
- **Database GUI**: http://localhost:5555 (Prisma Studio)
- **Database**: localhost:5432

### Helpful Commands

```bash
# View all available scripts
npm run

# Watch database logs
docker-compose logs -f postgres

# Check Docker container stats
docker stats voxarena-postgres

# View Prisma schema
cat prisma/schema.prisma

# Count lines of code
find src -name '*.ts' -o -name '*.tsx' | xargs wc -l
```

### File Locations

- **Pages**: `src/app/`
- **Components**: `src/components/`
- **API Routes**: `src/app/api/`
- **Types**: `src/types/`
- **Database Utils**: `src/lib/db/`
- **AI Utils**: `src/lib/ai/`
- **Voice Utils**: `src/lib/voice/`
- **Storage Utils**: `src/lib/storage/`

## Next Steps

1. **Seed Taxonomy Data** - Create initial categories/terms
2. **Build Admin UI** - Taxonomy, personas, debates management
3. **Implement AI Generation** - Connect OpenAI & ElevenLabs
4. **Create Public Interface** - Debate library and player
5. **Add Authentication** - Admin login with NextAuth.js

---

Happy coding! 🎨 If you get stuck, check [CLAUDE.md](./CLAUDE.md) for architecture details or [DATABASE.md](./DATABASE.md) for database help.
