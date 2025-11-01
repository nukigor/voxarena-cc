# Troubleshooting Guide

Common issues and their solutions for VoxArena development.

## Next.js Issues

### Error: ENOENT: no such file or directory, open '.next/server/app/page.js'

**Symptoms:**
- Server starts but shows 404 or 500 errors
- Error message about missing files in `.next` directory
- Pages that should exist are not found

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next
rm -rf node_modules/.cache

# Restart dev server
npm run dev
```

**Why this happens:**
- Stale build cache from previous builds
- File system changes while server was running
- Git branch switches with different dependencies

### Fast Refresh Warnings

**Symptoms:**
```
⚠ Fast Refresh had to perform a full reload due to a runtime error.
```

**Solution:**
- These warnings are usually harmless during development
- They occur when Next.js detects runtime errors and forces a full reload
- Check browser console for actual errors
- If persistent, clear cache: `rm -rf .next && npm run dev`

## Database Issues

### Port 5432 Already in Use

**Symptoms:**
```
Error: Bind for 0.0.0.0:5432 failed: port is already allocated
```

**Solution:**
This project uses port **54320** instead of 5432. This is already configured in:
- `docker-compose.yml`
- `.env.local`
- `.env`

If you still get errors:
```bash
# Check what's using the port
lsof -i :54320

# Clean up Docker
docker-compose down -v
docker-compose up -d
```

### Database Connection Refused

**Symptoms:**
```
Error: P1001: Can't reach database server
```

**Solution:**
```bash
# Check if PostgreSQL is running
docker-compose ps

# If not running, start it
npm run db:start

# Wait for it to be ready
docker-compose exec postgres pg_isready -U voxarena
```

### Prisma Schema Out of Sync

**Symptoms:**
```
Error: P2021: The table doesn't exist in the current database
```

**Solution:**
```bash
# Regenerate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Restart dev server
npm run dev
```

## TypeScript Issues

### Cannot find module '@prisma/client'

**Solution:**
```bash
# Generate Prisma client
npm run db:generate

# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Stale Type Definitions

**Solution:**
```bash
# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"

# Or restart entire dev server
npm run dev
```

## Build Issues

### Build Fails with Module Errors

**Solution:**
```bash
# Clear all caches
rm -rf .next
rm -rf node_modules/.cache

# Reinstall dependencies (if needed)
rm -rf node_modules
npm install

# Try building again
npm run build
```

### Linting Errors During Build

**Solution:**
```bash
# Run linter to see all errors
npm run lint

# Auto-fix what can be fixed
npm run lint -- --fix

# Format code
npm run format
```

## Docker Issues

### Docker Daemon Not Running

**Symptoms:**
```
Cannot connect to the Docker daemon
```

**Solution:**
- Open Docker Desktop application
- Wait for it to fully start
- Try your command again

### Container Won't Start

**Solution:**
```bash
# Stop and remove everything
docker-compose down -v

# Remove dangling resources
docker system prune -f

# Start fresh
npm run db:setup
```

### Container Stuck in "Created" State

**Solution:**
```bash
# Force remove container
docker rm -f voxarena-postgres

# Clean up networks
docker network prune -f

# Restart
npm run db:start
```

## Development Server Issues

### Port 3000 Already in Use

**Solution:**
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or use different port
PORT=3001 npm run dev
```

### Changes Not Reflecting

**Solution:**
1. **Hard refresh browser**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. **Clear Next.js cache**: `rm -rf .next && npm run dev`
3. **Check file saved**: Ensure your editor saved the file
4. **Check Fast Refresh**: Look for errors in browser console

## Environment Variables

### Environment Variables Not Loading

**Symptoms:**
- Prisma can't find `DATABASE_URL`
- API calls fail with missing keys

**Solution:**
```bash
# Check files exist
ls -la .env .env.local

# For Prisma, copy .env.local to .env
cp .env.local .env

# Restart dev server (to reload env vars)
npm run dev
```

**Note:**
- Next.js loads `.env.local` for the app
- Prisma CLI loads `.env` by default
- Keep both files in sync

## Common Quick Fixes

### "It was working, now it's not"

Try this sequence:
```bash
# 1. Clear all caches
rm -rf .next node_modules/.cache

# 2. Restart database
npm run db:stop
npm run db:start

# 3. Regenerate Prisma client
npm run db:generate

# 4. Restart dev server
npm run dev
```

### Complete Reset

When all else fails:
```bash
# Nuclear option - start completely fresh

# 1. Stop everything
pkill -f "next dev"
npm run db:stop

# 2. Clean everything
rm -rf .next
rm -rf node_modules
docker-compose down -v

# 3. Reinstall
npm install

# 4. Setup database
npm run db:setup

# 5. Start dev server
npm run dev
```

## Getting Help

If you're still stuck:

1. **Check logs:**
   ```bash
   # Database logs
   docker-compose logs -f postgres

   # Next.js console output
   # Check terminal where `npm run dev` is running
   ```

2. **Check documentation:**
   - [DATABASE.md](./DATABASE.md) - Database issues
   - [DEV-WORKFLOW.md](./DEV-WORKFLOW.md) - Development workflow
   - [CLAUDE.md](./CLAUDE.md) - Architecture details

3. **Search error messages:**
   - Copy the exact error message
   - Search in GitHub issues or Stack Overflow
   - Include "Next.js" or "Prisma" in your search

4. **Check versions:**
   ```bash
   node --version  # Should be 18+
   npm --version
   docker --version
   ```

---

**Most issues are resolved by clearing caches and restarting services!**
