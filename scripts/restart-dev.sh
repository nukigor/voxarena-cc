#!/bin/bash

# VoxArena Dev Server Restart Utility
# This script safely kills all existing dev servers, clears cache, and starts a fresh server on port 3000

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default port
PORT=3000

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  VoxArena Dev Server Restart Utility  ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Check for existing dev servers
echo -e "${YELLOW}[1/7]${NC} Checking for existing dev servers..."
BEFORE_COUNT=$(ps aux | grep -E "next dev|npm run dev" | grep -v grep | wc -l | tr -d ' ')
echo -e "  Found ${YELLOW}${BEFORE_COUNT}${NC} running dev server(s)"

if [ "$BEFORE_COUNT" -gt 5 ]; then
  echo -e "  ${RED}WARNING: ${BEFORE_COUNT} dev servers detected! This is excessive.${NC}"
fi

# Step 2: Kill all existing dev servers
echo -e "${YELLOW}[2/7]${NC} Killing all dev servers..."
killall -9 node 2>/dev/null
killall -9 npm 2>/dev/null
pkill -9 -f "next dev" 2>/dev/null
sleep 2

AFTER_COUNT=$(ps aux | grep -E "next dev|npm run dev" | grep -v grep | wc -l | tr -d ' ')
if [ "$AFTER_COUNT" -eq 0 ]; then
  echo -e "  ${GREEN}✓${NC} All dev servers killed successfully"
else
  echo -e "  ${RED}✗${NC} Warning: ${AFTER_COUNT} dev server(s) still running"
  echo -e "  ${YELLOW}  Attempting force kill...${NC}"
  killall -SIGKILL node 2>/dev/null
  sleep 1
fi

# Step 3: Clear all development ports
echo -e "${YELLOW}[3/7]${NC} Clearing ports 3000-3010..."
PORTS_CLEARED=0
for port in {3000..3010}; do
  PID=$(lsof -ti:$port 2>/dev/null)
  if [ ! -z "$PID" ]; then
    kill -9 $PID 2>/dev/null
    ((PORTS_CLEARED++))
  fi
done

if [ $PORTS_CLEARED -gt 0 ]; then
  echo -e "  ${GREEN}✓${NC} Cleared $PORTS_CLEARED port(s)"
else
  echo -e "  ${GREEN}✓${NC} All ports already clear"
fi

# Step 4: Check port 3000 availability
echo -e "${YELLOW}[4/7]${NC} Verifying port ${PORT} availability..."
if lsof -i:$PORT > /dev/null 2>&1; then
  echo -e "  ${RED}✗${NC} Port ${PORT} is still in use!"
  echo -e "  ${YELLOW}  Process using port ${PORT}:${NC}"
  lsof -i:$PORT
  exit 1
else
  echo -e "  ${GREEN}✓${NC} Port ${PORT} is available"
fi

# Step 5: Remove .next cache
echo -e "${YELLOW}[5/7]${NC} Removing .next cache directory..."
if [ -d ".next" ]; then
  rm -rf .next
  echo -e "  ${GREEN}✓${NC} Cache directory removed"
else
  echo -e "  ${GREEN}✓${NC} No cache directory found (already clean)"
fi

# Step 6: Start fresh dev server
echo -e "${YELLOW}[6/7]${NC} Starting fresh dev server on port ${PORT}..."
echo ""

# Start the dev server (this will run in foreground)
npm run dev

# Note: The script will only reach here if npm run dev exits
echo ""
echo -e "${RED}Dev server exited${NC}"
