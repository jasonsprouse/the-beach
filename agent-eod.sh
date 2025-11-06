#!/bin/bash
# agent-eod.sh - End of day routine for digital agents

set -e

AGENT_ID="${1:-agent-$(whoami)}"
LOG_DIR="logs"
REPORT_DIR="reports"
ARCHIVE_DIR="logs/archive"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🌙 End of Day Routine${NC}"
echo "===================="
echo "Agent: $AGENT_ID"
echo "Time: $(date)"
echo ""

# Create directories
mkdir -p "$LOG_DIR" "$REPORT_DIR" "$ARCHIVE_DIR"

CURRENT_BRANCH=$(git branch --show-current)

# 1. Check today's work
echo -e "${BLUE}📝 Today's activity:${NC}"
COMMITS_TODAY=$(git log --since="12 hours ago" --oneline | wc -l)
echo "   Commits: $COMMITS_TODAY"
echo ""

if [ "$COMMITS_TODAY" -gt 0 ]; then
    echo "   Recent commits:"
    git log --since="12 hours ago" --oneline | head -5 | sed 's/^/     /'
    echo ""
fi

# 2. Check for uncommitted changes
echo -e "${BLUE}💾 Uncommitted changes:${NC}"
UNCOMMITTED=$(git status --porcelain | wc -l)
if [ "$UNCOMMITTED" -gt 0 ]; then
    echo -e "   ${YELLOW}⚠ $UNCOMMITTED files modified${NC}"
    echo ""
    git status --short | sed 's/^/     /'
    echo ""
    
    read -p "   Stash changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git stash save "[$AGENT_ID] EOD: $(date +%Y-%m-%d)"
        echo -e "   ${GREEN}✓ Changes stashed${NC}"
    fi
else
    echo -e "   ${GREEN}✓ No uncommitted changes${NC}"
fi
echo ""

# 3. Archive logs
echo -e "${BLUE}📦 Archiving logs...${NC}"
TODAY=$(date +%Y%m%d)
ARCHIVE_FILE="$ARCHIVE_DIR/logs-${AGENT_ID}-${TODAY}.tar.gz"

if ls "$LOG_DIR"/*.log 1> /dev/null 2>&1; then
    tar -czf "$ARCHIVE_FILE" "$LOG_DIR"/*.log 2>/dev/null || true
    echo "   ✓ Archived to: $ARCHIVE_FILE"
    
    # Clean old logs (keep today's)
    find "$LOG_DIR" -name "*.log" -mtime +0 -delete 2>/dev/null || true
    echo "   ✓ Cleaned old logs"
else
    echo "   ℹ No logs to archive"
fi
echo ""

# 4. Build and test status
echo -e "${BLUE}🔨 Final build check...${NC}"
if npm run build --silent > "$LOG_DIR/eod-build-$TODAY.log" 2>&1; then
    echo -e "   ${GREEN}✓ Build: PASS${NC}"
    BUILD_STATUS="✅ PASS"
else
    echo -e "   ${RED}✗ Build: FAIL${NC}"
    BUILD_STATUS="❌ FAIL"
fi

echo -e "${BLUE}🧪 Final test check...${NC}"
if npm run test --silent > "$LOG_DIR/eod-test-$TODAY.log" 2>&1; then
    echo -e "   ${GREEN}✓ Tests: PASS${NC}"
    TEST_STATUS="✅ PASS"
else
    echo -e "   ${YELLOW}⚠ Tests: Some failures${NC}"
    TEST_STATUS="⚠ PARTIAL"
fi
echo ""

# 5. Error summary
echo -e "${BLUE}🔍 Error summary:${NC}"
ERROR_COUNT=0
if [ -f "$ARCHIVE_FILE" ]; then
    ERROR_COUNT=$(tar -xzOf "$ARCHIVE_FILE" 2>/dev/null | grep -c "ERROR" 2>/dev/null || echo "0")
fi
echo "   Total errors today: $ERROR_COUNT"

if [ "$ERROR_COUNT" -gt 0 ]; then
    echo "   Top issues:"
    tar -xzOf "$ARCHIVE_FILE" 2>/dev/null | grep "ERROR" | cut -d: -f4- | sort | uniq -c | sort -rn | head -3 | sed 's/^/     /' 2>/dev/null || true
fi
echo ""

# 6. IPLD stats
echo -e "${BLUE}🔗 IPLD statistics:${NC}"
if curl -s http://localhost:3000/lit-compute/ipld/stats > /dev/null 2>&1; then
    STATS=$(curl -s http://localhost:3000/lit-compute/ipld/stats)
    BLOCKS=$(echo "$STATS" | jq -r '.totalBlocks // 0')
    SIZE=$(echo "$STATS" | jq -r '.totalSize // 0')
    echo "   Blocks: $BLOCKS"
    echo "   Size: $SIZE bytes"
else
    echo "   ℹ IPLD service not available"
fi
echo ""

# 7. Generate comprehensive status report
REPORT_FILE="$REPORT_DIR/${AGENT_ID}-eod-${TODAY}.txt"
cat > "$REPORT_FILE" <<EOF
═══════════════════════════════════════════════════════
Agent End of Day Report - $(date +%Y-%m-%d)
═══════════════════════════════════════════════════════

Agent ID: $AGENT_ID
Branch: $CURRENT_BRANCH
Report Time: $(date)

ACTIVITY SUMMARY
════════════════
Commits Today: $COMMITS_TODAY
Files Changed: $UNCOMMITTED uncommitted
Build Status: $BUILD_STATUS
Test Status: $TEST_STATUS
Total Errors: $ERROR_COUNT

RECENT COMMITS
══════════════
$(git log --since="12 hours ago" --oneline | head -10)

FILES MODIFIED
══════════════
$(git diff --stat 2>/dev/null | tail -10)

ERROR ANALYSIS
══════════════
Total Errors: $ERROR_COUNT

Top Error Types:
$(if [ -f "$ARCHIVE_FILE" ]; then
    tar -xzOf "$ARCHIVE_FILE" 2>/dev/null | grep "ERROR" | cut -d: -f4- | sort | uniq -c | sort -rn | head -5
fi)

IPLD STATUS
═══════════
$(if curl -s http://localhost:3000/lit-compute/ipld/stats > /dev/null 2>&1; then
    curl -s http://localhost:3000/lit-compute/ipld/stats | jq .
else
    echo "Service offline"
fi)

RECOMMENDATIONS
═══════════════
$(if [ "$ERROR_COUNT" -gt 10 ]; then echo "⚠ High error count - review logs"; fi)
$(if [ "$UNCOMMITTED" -gt 5 ]; then echo "⚠ Many uncommitted files - commit or stash"; fi)
$(if [ "$BUILD_STATUS" != "✅ PASS" ]; then echo "❌ Build failing - fix before next session"; fi)
$(if [ "$TEST_STATUS" != "✅ PASS" ]; then echo "⚠ Tests failing - review test output"; fi)

NEXT SESSION
════════════
1. Review this report
2. Address any failing builds/tests
3. Commit uncommitted changes
4. Run: ./agent-startup.sh $AGENT_ID

═══════════════════════════════════════════════════════
Report generated at: $(date)
═══════════════════════════════════════════════════════
EOF

echo -e "${GREEN}✅ EOD routine complete!${NC}"
echo ""
echo "📊 Report saved to: $REPORT_FILE"
echo ""

# Display the report
cat "$REPORT_FILE"

echo ""
echo -e "${BLUE}Have a great evening! 🌙${NC}"
echo ""
echo "Tomorrow's startup: ./agent-startup.sh $AGENT_ID"
