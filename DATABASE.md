# Database Setup Guide

## Local Development with Docker

For local development, we use PostgreSQL running in Docker. This is easier than managing a local PostgreSQL installation and keeps your environment isolated.

### Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

### Quick Start

1. **Start the PostgreSQL container:**

```bash
docker-compose up -d
```

This will:
- Pull the PostgreSQL 16 Alpine image (lightweight)
- Create a container named `voxarena-postgres`
- Start PostgreSQL on port `54320`
- Create database `voxarena_dev` with user `voxarena`
- Persist data in a Docker volume

2. **Verify the database is running:**

```bash
docker-compose ps
```

You should see:
```
NAME                  STATUS    PORTS
voxarena-postgres     Up        0.0.0.0:54320->54320/tcp
```

3. **Initialize the database schema:**

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

4. **Open Prisma Studio (optional):**

```bash
npx prisma studio
```

This opens a GUI at [http://localhost:5555](http://localhost:5555) to view and edit your data.

### Docker Commands

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL (keeps data)
docker-compose stop

# Stop and remove container (keeps data in volume)
docker-compose down

# Stop, remove container, and DELETE all data
docker-compose down -v

# View logs
docker-compose logs -f postgres

# Restart PostgreSQL
docker-compose restart

# Check container status
docker-compose ps
```

### Connecting to the Database

**From your app (already configured):**
```
DATABASE_URL="postgresql://voxarena:voxarena_dev_password@localhost:54320/voxarena_dev"
```

**Using psql (from your terminal):**
```bash
docker-compose exec postgres psql -U voxarena -d voxarena_dev
```

**Using a GUI client (TablePlus, pgAdmin, etc.):**
- Host: `localhost`
- Port: `54320`
- Database: `voxarena_dev`
- Username: `voxarena`
- Password: `voxarena_dev_password`

### Database Migrations

**During development (schema changes):**
```bash
# Quick schema sync (no migration files)
npx prisma db push
```

**For production-ready migrations:**
```bash
# Create a migration
npx prisma migrate dev --name description_of_changes

# Apply migrations to production
npx prisma migrate deploy
```

### Resetting the Database

If you need to start fresh:

```bash
# Option 1: Reset via Prisma (keeps container running)
npx prisma migrate reset

# Option 2: Destroy and recreate everything
docker-compose down -v
docker-compose up -d
npx prisma db push
```

### Data Persistence

Your database data is stored in a Docker volume named `voxarena-cc_postgres_data`. This means:
- ✅ Data persists when you stop/start the container
- ✅ Data persists when you restart your computer
- ❌ Data is deleted if you run `docker-compose down -v`

**To back up your data:**
```bash
# Export to SQL file
docker-compose exec -T postgres pg_dump -U voxarena voxarena_dev > backup.sql

# Restore from SQL file
docker-compose exec -T postgres psql -U voxarena -d voxarena_dev < backup.sql
```

### Troubleshooting

**Port 54320 already in use:**
```bash
# Check what's using port 54320
lsof -i :54320

# If you have PostgreSQL installed locally, stop it:
brew services stop postgresql
# or
sudo systemctl stop postgresql
```

**Container won't start:**
```bash
# Check logs
docker-compose logs postgres

# Common fix: remove old container and volume
docker-compose down -v
docker-compose up -d
```

**Connection refused:**
```bash
# Wait for PostgreSQL to be ready
docker-compose exec postgres pg_isready -U voxarena

# Check container is running
docker-compose ps

# Check logs for errors
docker-compose logs -f postgres
```

**Schema out of sync:**
```bash
# Regenerate Prisma client
npx prisma generate

# Sync schema
npx prisma db push
```

## Production Database (Neon)

When you're ready to deploy to production, switch to Neon PostgreSQL:

1. **Update `.env.local`:**
```bash
# Comment out local database
# DATABASE_URL="postgresql://voxarena:voxarena_dev_password@localhost:54320/voxarena_dev"

# Uncomment production database
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require"
```

2. **Run migrations:**
```bash
npx prisma migrate deploy
```

3. **Verify connection:**
```bash
npx prisma db pull
```

## Environment Setup Summary

**Local Development:**
- Docker PostgreSQL (this guide)
- Fast, isolated, easy to reset
- No cloud costs

**Production:**
- Neon PostgreSQL
- Managed, scalable, automatic backups
- Connection pooling built-in

---

**Current Setup:** Your `.env.local` is configured for local Docker PostgreSQL.

To get started:
```bash
docker-compose up -d
npx prisma db push
npm run dev
```
