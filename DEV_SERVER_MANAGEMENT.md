# Dev Server Management Guide

## Overview

This guide explains how to properly manage Next.js development servers to avoid conflicts, zombie processes, and stale code issues.

## The Problem

Running multiple dev servers simultaneously causes:
- **Port conflicts** - Servers fighting for the same ports
- **Stale code** - Browser loading old cached JavaScript
- **Resource waste** - Multiple node processes consuming CPU/memory
- **Inconsistent behavior** - Different servers serving different code versions

## New Management Tools

We've created automated tools to solve these problems:

### 1. `npm run restart-dev`

**Primary command for starting/restarting the dev server.**

What it does:
- ✅ Kills all existing dev servers (cleans up zombies)
- ✅ Clears ports 3000-3010
- ✅ Removes `.next` cache for fresh compilation
- ✅ Starts a single dev server on port 3000
- ✅ Shows colored status output
- ✅ Warns if excessive servers detected

**When to use:**
- Starting development for the first time
- Server seems stuck or unresponsive
- Seeing stale code in browser
- Getting port conflict errors
- After pulling new code from git

**Example:**
```bash
npm run restart-dev
```

### 2. `npm run check-servers`

**Health check command to see your dev server status.**

What it does:
- Shows count of running dev servers
- Lists which ports are in use
- Checks `.next` cache status
- Provides actionable recommendations
- Displays overall health summary

**When to use:**
- Unsure if server is running
- Suspecting multiple servers running
- Debugging port conflicts
- Verifying clean state

**Example:**
```bash
npm run check-servers
```

**Sample output:**
```
========================================
   Dev Server Health Check
========================================

[1/4] Checking for running dev servers...
  ✓ 1 dev server running (healthy)

[2/4] Checking port usage (3000-3010)...
  Port 3000: IN USE (PID: 12345, Process: node)
  ✓ 1 port in use (normal)

[3/4] Checking .next cache directory...
  ✓ Cache exists (Size: 245M)

[4/4] Health Summary...

========================================
  ✓ System Healthy
========================================
  • Dev server running properly
  • No port conflicts detected
  • Ready for development
```

### 3. `npm run kill-dev`

**Emergency kill switch for all dev servers.**

What it does:
- Immediately kills all Next.js dev servers
- Kills all node processes
- Does NOT start a new server
- Silent (no errors if nothing to kill)

**When to use:**
- Need to stop server without restarting
- Emergency cleanup
- Before system shutdown

**Example:**
```bash
npm run kill-dev
```

## Best Practices

### ✅ DO

1. **Use `npm run restart-dev` as your primary command**
   - Start dev work → `npm run restart-dev`
   - Server acting weird → `npm run restart-dev`
   - After git pull → `npm run restart-dev`

2. **Check server health if issues arise**
   ```bash
   npm run check-servers
   ```

3. **Keep only ONE dev server running**
   - Multiple servers = conflicts and confusion

4. **Clear browser cache when code doesn't update**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+F5` (Windows)
   - Or use incognito mode for testing

### ❌ DON'T

1. **Don't run `npm run dev` multiple times**
   - Creates zombie processes
   - Use `npm run restart-dev` instead

2. **Don't manually kill processes with Ctrl+C repeatedly**
   - May leave zombie processes
   - Use `npm run kill-dev` or `npm run restart-dev`

3. **Don't ignore warnings from `check-servers`**
   - If it says you have multiple servers, fix it immediately

## Troubleshooting

### Problem: "Port 3000 is already in use"

**Solution:**
```bash
npm run restart-dev
```

This will clear the port and start fresh.

### Problem: "Browser showing old code"

**Solutions:**
1. Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+F5` (Windows)
2. Check server health:
   ```bash
   npm run check-servers
   ```
3. If multiple servers detected, restart:
   ```bash
   npm run restart-dev
   ```
4. Clear browser cache completely
5. Try incognito/private browsing mode

### Problem: "Multiple servers running"

**Solution:**
```bash
npm run restart-dev
```

This automatically kills all servers and starts ONE clean instance.

### Problem: "Server won't start"

**Steps:**
1. Check what's wrong:
   ```bash
   npm run check-servers
   ```
2. Force clean restart:
   ```bash
   npm run restart-dev
   ```
3. If still failing, check the error message in terminal

### Problem: "Changes not appearing in browser"

**Checklist:**
1. ✅ Hard refresh browser (`Cmd+Shift+R` / `Ctrl+Shift+F5`)
2. ✅ Check server compiled your changes (look at terminal)
3. ✅ Verify only one server running: `npm run check-servers`
4. ✅ Restart dev server: `npm run restart-dev`
5. ✅ Clear browser cache completely
6. ✅ Try different browser or incognito mode

## Technical Details

### What `restart-dev.sh` Does (Step-by-Step)

1. **Checks** for existing dev servers
2. **Kills** all node/npm processes
3. **Clears** ports 3000-3010
4. **Verifies** port 3000 is available
5. **Removes** `.next` cache directory
6. **Starts** `npm run dev` on port 3000

### Why This Matters

- **Single Source of Truth**: Only one server = consistent code
- **Fresh Cache**: Removing `.next` ensures latest code compilation
- **Clean Ports**: No conflicts with previous instances
- **Predictable**: Always starts on port 3000

## Scripts Location

- **Restart utility**: `scripts/restart-dev.sh`
- **Health check**: `scripts/check-dev-health.sh`

Both scripts are version-controlled and can be customized if needed.

## Quick Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run restart-dev` | Clean restart | Start dev, fix issues, after git pull |
| `npm run check-servers` | Health check | Check status, debug issues |
| `npm run kill-dev` | Emergency stop | Stop without restart |
| `npm run dev` | Standard start | **⚠️ Use `restart-dev` instead** |

## Support

If you encounter issues not covered here:
1. Run `npm run check-servers` to diagnose
2. Check terminal output for errors
3. Try `npm run restart-dev`
4. If still stuck, check this documentation again

---

**Remember**: When in doubt, `npm run restart-dev` - it solves most dev server issues! 🚀
