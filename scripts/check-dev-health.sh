#!/bin/bash

# VoxArena Dev Server Health Check
# This script checks the health of your dev server environment

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Dev Server Health Check             ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check 1: Count running dev servers
echo -e "${YELLOW}[1/4]${NC} Checking for running dev servers..."
DEV_SERVER_COUNT=$(ps aux | grep -E "next dev|npm run dev" | grep -v grep | wc -l | tr -d ' ')

if [ "$DEV_SERVER_COUNT" -eq 0 ]; then
  echo -e "  ${RED}✗${NC} No dev servers running"
  echo -e "  ${YELLOW}  Run 'npm run restart-dev' to start a server${NC}"
elif [ "$DEV_SERVER_COUNT" -eq 1 ]; then
  echo -e "  ${GREEN}✓${NC} 1 dev server running (healthy)"
else
  echo -e "  ${RED}✗${NC} ${DEV_SERVER_COUNT} dev servers running (CONFLICT!)"
  echo -e "  ${YELLOW}  Multiple servers will cause conflicts and serve stale code${NC}"
  echo -e "  ${YELLOW}  Run 'npm run restart-dev' to clean up${NC}"
fi

# Check 2: Show which ports are in use
echo -e "${YELLOW}[2/4]${NC} Checking port usage (3000-3010)..."
PORTS_IN_USE=0
for port in {3000..3010}; do
  if lsof -i:$port > /dev/null 2>&1; then
    PID=$(lsof -ti:$port)
    PROCESS=$(ps -p $PID -o comm= 2>/dev/null)
    echo -e "  Port ${port}: ${YELLOW}IN USE${NC} (PID: $PID, Process: $PROCESS)"
    ((PORTS_IN_USE++))
  fi
done

if [ $PORTS_IN_USE -eq 0 ]; then
  echo -e "  ${GREEN}✓${NC} All ports are free"
elif [ $PORTS_IN_USE -eq 1 ]; then
  echo -e "  ${GREEN}✓${NC} 1 port in use (normal)"
else
  echo -e "  ${YELLOW}⚠${NC} ${PORTS_IN_USE} ports in use"
fi

# Check 3: Check for .next cache
echo -e "${YELLOW}[3/4]${NC} Checking .next cache directory..."
if [ -d ".next" ]; then
  CACHE_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
  echo -e "  ${GREEN}✓${NC} Cache exists (Size: ${CACHE_SIZE})"
else
  echo -e "  ${YELLOW}⚠${NC} No cache directory found"
  echo -e "  ${YELLOW}  This is normal if you just ran 'npm run restart-dev'${NC}"
fi

# Check 4: Overall health summary
echo -e "${YELLOW}[4/4]${NC} Health Summary..."
echo ""

if [ "$DEV_SERVER_COUNT" -eq 1 ] && [ "$PORTS_IN_USE" -le 2 ]; then
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}  ✓ System Healthy                      ${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo -e "  • Dev server running properly"
  echo -e "  • No port conflicts detected"
  echo -e "  • Ready for development"
elif [ "$DEV_SERVER_COUNT" -eq 0 ]; then
  echo -e "${YELLOW}========================================${NC}"
  echo -e "${YELLOW}  ⚠ No Server Running                   ${NC}"
  echo -e "${YELLOW}========================================${NC}"
  echo -e "  Action: Run 'npm run restart-dev'"
else
  echo -e "${RED}========================================${NC}"
  echo -e "${RED}  ✗ Issues Detected                     ${NC}"
  echo -e "${RED}========================================${NC}"
  echo -e "  • Multiple dev servers running (${DEV_SERVER_COUNT})"
  echo -e "  • This causes conflicts and stale code"
  echo -e "  Action: Run 'npm run restart-dev'"
fi

echo ""

# Optional: Show all Node processes for debugging
if [ "$DEV_SERVER_COUNT" -gt 1 ]; then
  echo -e "${BLUE}Active Node.js processes:${NC}"
  echo -e "${BLUE}────────────────────────────────────────${NC}"
  ps aux | grep -E "node|npm" | grep -v grep | head -10
  echo ""
fi
