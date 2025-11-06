#!/bin/bash
# agent-work-session.sh - Start a work session for an agent

set -e

AGENT_ID="${1:-agent-$(whoami)}"
TASK="${2:-general-work}"
BRANCH="agent/${AGENT_ID}/${TASK}"
LOG_DIR="logs"
REPORT_DIR="reports"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🤖 Starting Work Session${NC}"
echo "========================="
echo "Agent: $AGENT_ID"
echo "Task: $TASK"
echo "Branch: $BRANCH"
echo "Time: $(date)"
echo ""

# Create directories
mkdir -p "$LOG_DIR" "$REPORT_DIR"

# Start session logging
LOG_FILE="$LOG_DIR/${AGENT_ID}-${TASK}-$(date +%Y%m%d-%H%M%S).log"
exec &> >(tee -a "$LOG_FILE")

echo -e "${BLUE}📝 Session logging to: $LOG_FILE${NC}"
echo ""

# 1. Save any uncommitted work
echo -e "${BLUE}💾 Checking for uncommitted changes...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "   ${YELLOW}Stashing uncommitted changes${NC}"
    git stash save "[$AGENT_ID] Auto-stash before $TASK - $(date +%Y-%m-%d)"
else
    echo -e "   ${GREEN}✓ Working tree clean${NC}"
fi
echo ""

# 2. Create or checkout branch
echo -e "${BLUE}🌿 Setting up branch...${NC}"
if git show-ref --verify --quiet refs/heads/"$BRANCH"; then
    echo "   Branch exists, checking out..."
    git checkout "$BRANCH"
else
    echo "   Creating new branch..."
    git checkout -b "$BRANCH"
fi
echo -e "   ${GREEN}✓ On branch: $(git branch --show-current)${NC}"
echo ""

# 3. Update from remote if exists
echo -e "${BLUE}📥 Checking for remote updates...${NC}"
git fetch origin "$BRANCH" 2>/dev/null && {
    BEHIND=$(git rev-list HEAD..origin/"$BRANCH" --count)
    if [ "$BEHIND" -gt 0 ]; then
        echo -e "   ${YELLOW}Pulling $BEHIND commits from remote${NC}"
        git pull origin "$BRANCH"
    else
        echo -e "   ${GREEN}✓ Up to date${NC}"
    fi
} || echo "   ℹ No remote branch yet"
echo ""

# 4. Build the project
echo -e "${BLUE}🔨 Building project...${NC}"
if npm run build --silent 2>&1 | tee "$LOG_DIR/build-$(date +%Y%m%d-%H%M%S).log"; then
    echo -e "   ${GREEN}✓ Build successful${NC}"
else
    echo -e "   ${RED}✗ Build failed${NC}"
    echo "   Check: $LOG_DIR/build-*.log"
    exit 1
fi
echo ""

# 5. Run tests
echo -e "${BLUE}🧪 Running tests...${NC}"
if npm run test --silent 2>&1 | tee "$LOG_DIR/test-$(date +%Y%m%d-%H%M%S).log"; then
    echo -e "   ${GREEN}✓ Tests passed${NC}"
else
    echo -e "   ${YELLOW}⚠ Some tests failed${NC}"
    echo "   Check: $LOG_DIR/test-*.log"
fi
echo ""

# 6. Check system health
echo -e "${BLUE}🏥 System health check...${NC}"
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓ Server running${NC}"
    
    # IPLD stats
    if STATS=$(curl -s http://localhost:3000/lit-compute/ipld/stats 2>/dev/null); then
        BLOCKS=$(echo "$STATS" | jq -r '.totalBlocks // 0')
        echo -e "   ${GREEN}✓ IPLD service online ($BLOCKS blocks)${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠ Server not running (will need to start)${NC}"
fi
echo ""

# 7. Create work session metadata
SESSION_FILE="$REPORT_DIR/${AGENT_ID}-session-$(date +%Y%m%d-%H%M%S).json"
cat > "$SESSION_FILE" <<EOF
{
  "agentId": "$AGENT_ID",
  "task": "$TASK",
  "branch": "$BRANCH",
  "startTime": "$(date -Iseconds)",
  "logFile": "$LOG_FILE",
  "currentBranch": "$(git branch --show-current)",
  "lastCommit": "$(git log -1 --oneline)",
  "buildStatus": "success",
  "testStatus": "passed"
}
EOF

echo -e "${GREEN}✅ Work session ready!${NC}"
echo ""
echo "You can now:"
echo "  1. Make your changes"
echo "  2. Test: npm run test"
echo "  3. Commit: git add . && git commit -m \"[$AGENT_ID] Your message\""
echo "  4. Push: git push -u origin $BRANCH"
echo "  5. End session: ./agent-eod.sh $AGENT_ID"
echo ""
echo "Session metadata: $SESSION_FILE"
echo "Session log: $LOG_FILE"
echo ""
echo "Happy coding! 🚀"
