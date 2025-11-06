#!/bin/bash
# agent-startup.sh - Morning startup routine for digital agents

set -e

AGENT_ID="${1:-agent-$(whoami)}"
LOG_DIR="logs"
REPORT_DIR="reports"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🤖 Agent Startup Routine${NC}"
echo "========================"
echo "Agent ID: $AGENT_ID"
echo "Time: $(date)"
echo ""

# Create necessary directories
mkdir -p "$LOG_DIR" "$REPORT_DIR"

# 1. Check current location
echo -e "${BLUE}📍 Current branch:${NC}"
CURRENT_BRANCH=$(git branch --show-current)
echo "   $CURRENT_BRANCH"
echo ""

# 2. Get latest updates
echo -e "${BLUE}📥 Fetching updates...${NC}"
git fetch --all --quiet
echo "   ✓ Fetch complete"
echo ""

# 3. Check for conflicts
echo -e "${BLUE}🔍 Checking status...${NC}"
STATUS=$(git status --porcelain | wc -l)
if [ "$STATUS" -gt 0 ]; then
    echo -e "   ${YELLOW}⚠ $STATUS uncommitted changes${NC}"
else
    echo "   ✓ Working tree clean"
fi
echo ""

# 4. List available branches
echo -e "${BLUE}🌿 Available branches:${NC}"
git branch -a | grep -E "agent|feature|product" | head -10 | sed 's/^/   /'
echo ""

# 5. Check if server is running
echo -e "${BLUE}🏥 System health:${NC}"
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓ Server is running${NC}"
    
    # Check IPLD stats
    if curl -s http://localhost:3000/lit-compute/ipld/stats > /dev/null 2>&1; then
        STATS=$(curl -s http://localhost:3000/lit-compute/ipld/stats)
        BLOCKS=$(echo "$STATS" | jq -r '.totalBlocks // 0' 2>/dev/null || echo "0")
        echo -e "   ${GREEN}✓ IPLD service online ($BLOCKS blocks)${NC}"
    else
        echo -e "   ${YELLOW}⚠ IPLD service not responding${NC}"
    fi
else
    echo -e "   ${RED}✗ Server not running${NC}"
    echo "   Run: npm run start:dev"
fi
echo ""

# 6. Check for recent errors
echo -e "${BLUE}🔍 Recent errors:${NC}"
if [ -f "$LOG_DIR/application.log" ]; then
    ERROR_COUNT=$(grep -c "ERROR" "$LOG_DIR/application.log" 2>/dev/null || echo "0")
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo -e "   ${YELLOW}⚠ $ERROR_COUNT errors found${NC}"
        echo "   Last error:"
        grep "ERROR" "$LOG_DIR/application.log" | tail -1 | sed 's/^/     /' | cut -c1-100
    else
        echo -e "   ${GREEN}✓ No errors${NC}"
    fi
else
    echo "   ℹ No log file yet"
fi
echo ""

# 7. Start log monitoring in background
LOG_FILE="$LOG_DIR/${AGENT_ID}-monitor-$(date +%Y%m%d-%H%M%S).log"
touch "$LOG_FILE"

# Create log monitor script
cat > /tmp/agent-log-monitor-$$.sh <<'LOGSCRIPT'
#!/bin/bash
while true; do
    if [ -f logs/application.log ]; then
        tail -f logs/application.log 2>/dev/null | while read line; do
            if echo "$line" | grep -q "ERROR"; then
                echo -e "\033[0;31m$line\033[0m"
            elif echo "$line" | grep -q "WARN"; then
                echo -e "\033[1;33m$line\033[0m"
            elif echo "$line" | grep -q "INFO"; then
                echo -e "\033[0;32m$line\033[0m"
            else
                echo "$line"
            fi
        done
    fi
    sleep 5
done
LOGSCRIPT

chmod +x /tmp/agent-log-monitor-$$.sh

echo -e "${BLUE}📊 Log monitoring:${NC}"
echo "   Log file: $LOG_FILE"
echo "   To watch logs: tail -f logs/application.log"
echo "   To watch colorized: ./monitor-logs.sh"
echo ""

# 8. Generate startup report
REPORT_FILE="$REPORT_DIR/${AGENT_ID}-startup-$(date +%Y%m%d-%H%M%S).txt"
cat > "$REPORT_FILE" <<EOF
Agent Startup Report
====================
Agent: $AGENT_ID
Time: $(date)
Branch: $CURRENT_BRANCH
Uncommitted Changes: $STATUS files
Server Status: $(curl -s http://localhost:3000/health > /dev/null 2>&1 && echo "Running" || echo "Stopped")
Recent Errors: $(grep -c "ERROR" "$LOG_DIR/application.log" 2>/dev/null || echo "0")

Recent Commits:
$(git log --oneline -5 | sed 's/^/  /')

Available Agent Branches:
$(git branch -a | grep "agent" | head -10 | sed 's/^/  /')
EOF

echo -e "${GREEN}✅ Startup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Create work branch: git checkout -b agent/$AGENT_ID/<task>"
echo "  2. Start work session: ./agent-work-session.sh $AGENT_ID <task>"
echo "  3. Monitor logs: tail -f logs/application.log"
echo ""
echo "Report saved to: $REPORT_FILE"
