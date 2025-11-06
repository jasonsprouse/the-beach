#!/bin/bash
# check-branch-health.sh - Comprehensive branch health check

set -e

BRANCH="${1:-$(git branch --show-current)}"
LOG_DIR="logs"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}🏥 Branch Health Check${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo "Branch: $BRANCH"
echo "Time: $(date)"
echo ""

# 1. Branch sync status
echo -e "${BLUE}📡 Sync Status${NC}"
echo "─────────────────────────────────────"
git fetch origin --quiet 2>/dev/null || true

BEHIND=$(git rev-list HEAD..origin/$BRANCH --count 2>/dev/null || echo "0")
AHEAD=$(git rev-list origin/$BRANCH..HEAD --count 2>/dev/null || echo "0")

if [ "$BEHIND" -eq 0 ] && [ "$AHEAD" -eq 0 ]; then
    echo -e "${GREEN}✓ In sync with remote${NC}"
elif [ "$BEHIND" -gt 0 ]; then
    echo -e "${YELLOW}⚠ Behind remote by $BEHIND commits${NC}"
    echo "  Fix: git pull origin $BRANCH"
fi

if [ "$AHEAD" -gt 0 ]; then
    echo -e "${YELLOW}⚠ Ahead of remote by $AHEAD commits${NC}"
    echo "  Fix: git push origin $BRANCH"
fi
echo ""

# 2. Working directory status
echo -e "${BLUE}📂 Working Directory${NC}"
echo "─────────────────────────────────────"
UNCOMMITTED=$(git status --porcelain | wc -l)
UNTRACKED=$(git ls-files --others --exclude-standard | wc -l)
MODIFIED=$(git diff --name-only | wc -l)
STAGED=$(git diff --cached --name-only | wc -l)

if [ "$UNCOMMITTED" -eq 0 ]; then
    echo -e "${GREEN}✓ Clean working directory${NC}"
else
    echo -e "${YELLOW}⚠ $UNCOMMITTED total changes${NC}"
    echo "  Modified: $MODIFIED"
    echo "  Staged: $STAGED"
    echo "  Untracked: $UNTRACKED"
fi
echo ""

# 3. Build status
echo -e "${BLUE}🔨 Build Status${NC}"
echo "─────────────────────────────────────"
mkdir -p "$LOG_DIR"
BUILD_LOG="$LOG_DIR/health-build-$(date +%Y%m%d-%H%M%S).log"

if npm run build --silent > "$BUILD_LOG" 2>&1; then
    echo -e "${GREEN}✓ Build: PASS${NC}"
    rm "$BUILD_LOG"
else
    echo -e "${RED}✗ Build: FAIL${NC}"
    echo "  Log: $BUILD_LOG"
    echo "  Last 3 errors:"
    grep -i "error" "$BUILD_LOG" | tail -3 | sed 's/^/    /'
fi
echo ""

# 4. Test status
echo -e "${BLUE}🧪 Test Status${NC}"
echo "─────────────────────────────────────"
TEST_LOG="$LOG_DIR/health-test-$(date +%Y%m%d-%H%M%S).log"

if npm run test --silent > "$TEST_LOG" 2>&1; then
    echo -e "${GREEN}✓ Tests: PASS${NC}"
    rm "$TEST_LOG"
else
    echo -e "${YELLOW}⚠ Tests: Some failures${NC}"
    echo "  Log: $TEST_LOG"
    FAILED=$(grep -c "FAIL" "$TEST_LOG" 2>/dev/null || echo "0")
    echo "  Failed tests: $FAILED"
fi
echo ""

# 5. Code quality
echo -e "${BLUE}📊 Code Quality${NC}"
echo "─────────────────────────────────────"

# Count TypeScript errors
if [ -f "tsconfig.json" ]; then
    TS_ERRORS=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0")
    if [ "$TS_ERRORS" -eq 0 ]; then
        echo -e "${GREEN}✓ TypeScript: No errors${NC}"
    else
        echo -e "${RED}✗ TypeScript: $TS_ERRORS errors${NC}"
    fi
fi

# Count linting issues
if [ -f "eslint.config.mjs" ]; then
    LINT_ISSUES=$(npm run lint --silent 2>&1 | grep -c "problem" || echo "0")
    if [ "$LINT_ISSUES" -eq 0 ]; then
        echo -e "${GREEN}✓ Linting: Clean${NC}"
    else
        echo -e "${YELLOW}⚠ Linting: $LINT_ISSUES issues${NC}"
    fi
fi
echo ""

# 6. Log analysis
echo -e "${BLUE}🔍 Log Analysis${NC}"
echo "─────────────────────────────────────"

if [ -f "$LOG_DIR/application.log" ]; then
    ERROR_COUNT=$(grep -c "ERROR" "$LOG_DIR/application.log" 2>/dev/null || echo "0")
    WARN_COUNT=$(grep -c "WARN" "$LOG_DIR/application.log" 2>/dev/null || echo "0")
    
    if [ "$ERROR_COUNT" -eq 0 ]; then
        echo -e "${GREEN}✓ No errors in logs${NC}"
    else
        echo -e "${YELLOW}⚠ $ERROR_COUNT errors in logs${NC}"
        echo "  Last error:"
        grep "ERROR" "$LOG_DIR/application.log" | tail -1 | cut -c1-80 | sed 's/^/    /'
    fi
    
    if [ "$WARN_COUNT" -gt 0 ]; then
        echo "  Warnings: $WARN_COUNT"
    fi
else
    echo "  ℹ No log file found"
fi
echo ""

# 7. Service health
echo -e "${BLUE}🏥 Service Health${NC}"
echo "─────────────────────────────────────"

# Check if server is running
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Server: Running${NC}"
    
    # Check IPLD service
    if curl -s http://localhost:3000/lit-compute/ipld/stats > /dev/null 2>&1; then
        STATS=$(curl -s http://localhost:3000/lit-compute/ipld/stats)
        BLOCKS=$(echo "$STATS" | jq -r '.totalBlocks // 0')
        echo -e "${GREEN}✓ IPLD: Online ($BLOCKS blocks)${NC}"
    else
        echo -e "${YELLOW}⚠ IPLD: Not responding${NC}"
    fi
else
    echo -e "${RED}✗ Server: Not running${NC}"
    echo "  Start: npm run start:dev"
fi
echo ""

# 8. Dependencies
echo -e "${BLUE}📦 Dependencies${NC}"
echo "─────────────────────────────────────"

if [ -f "package.json" ]; then
    # Check for outdated packages
    OUTDATED=$(npm outdated --silent 2>/dev/null | wc -l || echo "0")
    if [ "$OUTDATED" -eq 0 ]; then
        echo -e "${GREEN}✓ Dependencies: Up to date${NC}"
    else
        echo -e "${YELLOW}⚠ $OUTDATED outdated packages${NC}"
        echo "  Check: npm outdated"
    fi
    
    # Check for security issues
    VULNS=$(npm audit --json 2>/dev/null | jq -r '.metadata.vulnerabilities.total // 0' || echo "0")
    if [ "$VULNS" -eq 0 ]; then
        echo -e "${GREEN}✓ Security: No vulnerabilities${NC}"
    else
        echo -e "${RED}✗ Security: $VULNS vulnerabilities${NC}"
        echo "  Fix: npm audit fix"
    fi
fi
echo ""

# 9. Disk usage
echo -e "${BLUE}💾 Disk Usage${NC}"
echo "─────────────────────────────────────"

NODE_MODULES_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1 || echo "N/A")
LOGS_SIZE=$(du -sh logs 2>/dev/null | cut -f1 || echo "0")
DIST_SIZE=$(du -sh dist 2>/dev/null | cut -f1 || echo "0")

echo "  node_modules: $NODE_MODULES_SIZE"
echo "  logs: $LOGS_SIZE"
echo "  dist: $DIST_SIZE"

# Warn if logs are too large
LOGS_MB=$(du -sm logs 2>/dev/null | cut -f1 || echo "0")
if [ "$LOGS_MB" -gt 100 ]; then
    echo -e "${YELLOW}  ⚠ Logs exceed 100MB - consider cleanup${NC}"
    echo "    Archive: tar -czf logs-archive.tar.gz logs/*.log"
fi
echo ""

# 10. Overall health score
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}📊 Overall Health Score${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"

SCORE=100
ISSUES=()

# Deduct points for issues
[ "$BEHIND" -gt 0 ] && SCORE=$((SCORE - 10)) && ISSUES+=("Behind remote")
[ "$UNCOMMITTED" -gt 10 ] && SCORE=$((SCORE - 10)) && ISSUES+=("Many uncommitted changes")
[ ! -f "$BUILD_LOG" ] || SCORE=$((SCORE - 20)) && ISSUES+=("Build failing")
[ "$ERROR_COUNT" -gt 5 ] && SCORE=$((SCORE - 15)) && ISSUES+=("High error count")
[ "$TS_ERRORS" -gt 0 ] && SCORE=$((SCORE - 15)) && ISSUES+=("TypeScript errors")
[ "$VULNS" -gt 0 ] && SCORE=$((SCORE - 10)) && ISSUES+=("Security vulnerabilities")

if [ "$SCORE" -ge 90 ]; then
    echo -e "${GREEN}Score: $SCORE/100 - Excellent! ✨${NC}"
elif [ "$SCORE" -ge 70 ]; then
    echo -e "${YELLOW}Score: $SCORE/100 - Good, minor issues ⚠${NC}"
elif [ "$SCORE" -ge 50 ]; then
    echo -e "${YELLOW}Score: $SCORE/100 - Needs attention 🔧${NC}"
else
    echo -e "${RED}Score: $SCORE/100 - Requires immediate fixes ❌${NC}"
fi

if [ ${#ISSUES[@]} -gt 0 ]; then
    echo ""
    echo "Issues found:"
    printf '  • %s\n' "${ISSUES[@]}"
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo "Health check complete at $(date +%H:%M:%S)"
echo -e "${CYAN}═══════════════════════════════════════${NC}"
