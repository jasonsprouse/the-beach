# 🤖 Agent Operations Guide

**Essential Git & Log Monitoring Commands for Digital Agents**

---

## 🎯 Quick Reference for Agents

### Essential Daily Commands

```bash
# 1. Check current branch
git branch --show-current

# 2. List all branches
git branch -a

# 3. Watch logs in real-time
tail -f logs/application.log

# 4. Check system status
npm run status
```

---

## 📋 Branch Operations

### 1. Check Out Existing Branches

```bash
# View all available branches
git fetch --all
git branch -a

# Checkout a feature branch
git checkout product/lit-compute-network
git checkout feature/vr-marketplace
git checkout feature/digital-agents
git checkout feature/ai-testing

# Verify you're on the correct branch
git branch --show-current
git status
```

### 2. Create New Branch for Your Work

```bash
# Create and checkout new branch from current branch
git checkout -b agent/<agent-id>/<feature-name>

# Examples:
git checkout -b agent/agent-001/ipld-integration
git checkout -b agent/agent-002/marketplace-fixes
git checkout -b agent/agent-003/log-analysis

# Push new branch to remote
git push -u origin agent/<agent-id>/<feature-name>
```

### 3. Switch Between Branches

```bash
# Save current work before switching
git stash save "WIP: agent checkpoint"

# Switch to another branch
git checkout master
git checkout product/lit-compute-network

# Restore your work
git stash pop
```

### 4. Branch Information

```bash
# See all branches with last commit
git branch -vv

# See remote branches
git branch -r

# See branch with tracking info
git branch -vv

# Show branch graph
git log --oneline --graph --all --decorate
```

---

## 📊 Log Monitoring

### 1. Real-Time Log Watching

```bash
# Watch application logs (follows new entries)
tail -f logs/application.log

# Watch with colorization
tail -f logs/application.log | grep --color -E "ERROR|WARN|INFO|$"

# Watch multiple log files
tail -f logs/*.log

# Watch NestJS server logs
npm run start:dev 2>&1 | tee logs/server-$(date +%Y%m%d-%H%M%S).log
```

### 2. Log Analysis Commands

```bash
# Count errors in last hour
grep -c "ERROR" logs/application.log

# Find all errors
grep "ERROR" logs/application.log

# Find errors with context (3 lines before/after)
grep -A 3 -B 3 "ERROR" logs/application.log

# Find specific error patterns
grep -E "(ERROR|FATAL|CRITICAL)" logs/application.log

# Search for specific agent activity
grep "agent-001" logs/application.log
```

### 3. System Monitoring

```bash
# Check build logs
cat logs/build-$(date +%Y%m%d).log

# Monitor test execution
npm run test:watch

# Watch deployment logs
pm2 logs

# Check IPLD service logs
curl http://localhost:3000/lit-compute/ipld/stats | jq
```

### 4. Log File Management

```bash
# Create timestamped log
npm run start:dev &> logs/agent-$(date +%Y%m%d-%H%M%S).log &

# Archive old logs
tar -czf logs-archive-$(date +%Y%m%d).tar.gz logs/*.log

# Clean old logs (keep last 7 days)
find logs/ -name "*.log" -mtime +7 -delete

# Monitor log size
du -sh logs/
```

---

## 🔄 Complete Agent Workflow

### Morning Startup Routine

```bash
#!/bin/bash
# agent-startup.sh

echo "🤖 Agent Startup Routine"
echo "========================"

# 1. Check current location
echo "📍 Current branch:"
git branch --show-current

# 2. Get latest updates
echo "📥 Fetching updates..."
git fetch --all

# 3. Check for conflicts
echo "🔍 Checking status..."
git status

# 4. List available branches
echo "🌿 Available branches:"
git branch -a | grep -E "agent|feature|product"

# 5. Start log monitoring
echo "📊 Starting log monitor..."
tail -f logs/application.log &
LOG_PID=$!

# 6. Check system health
echo "🏥 System health:"
curl -s http://localhost:3000/health | jq

# 7. Check IPLD stats
echo "🔗 IPLD statistics:"
curl -s http://localhost:3000/lit-compute/ipld/stats | jq

echo "✅ Startup complete! Log monitor PID: $LOG_PID"
echo "   Stop logs with: kill $LOG_PID"
```

### During Work Session

```bash
#!/bin/bash
# agent-work-session.sh

AGENT_ID="agent-001"
FEATURE="ipld-enhancement"
BRANCH="agent/${AGENT_ID}/${FEATURE}"

# 1. Create/checkout branch
git checkout -b "$BRANCH" 2>/dev/null || git checkout "$BRANCH"

# 2. Start logging this session
LOG_FILE="logs/agent-${AGENT_ID}-$(date +%Y%m%d-%H%M%S).log"
exec &> >(tee -a "$LOG_FILE")

echo "🤖 Agent $AGENT_ID starting work on $FEATURE"
echo "📝 Logging to: $LOG_FILE"
echo "🌿 Branch: $BRANCH"

# 3. Run your work commands
npm run build
npm run test

# 4. Monitor for errors
echo "🔍 Checking for errors..."
grep -c "ERROR" "$LOG_FILE"

# 5. Commit work
git add .
git commit -m "[$AGENT_ID] Work on $FEATURE - $(date +%Y-%m-%d)"

# 6. Push to remote
git push -u origin "$BRANCH"

echo "✅ Work session complete!"
```

### End of Day Routine

```bash
#!/bin/bash
# agent-eod.sh

echo "🌙 End of Day Routine"
echo "===================="

# 1. Check what changed today
echo "📝 Today's changes:"
git log --since="12 hours ago" --oneline

# 2. Stash any uncommitted work
echo "💾 Saving uncommitted work..."
git stash save "EOD: $(date +%Y-%m-%d)"

# 3. Archive today's logs
echo "📦 Archiving logs..."
tar -czf "logs/archive-$(date +%Y%m%d).tar.gz" logs/*.log
find logs/ -name "*.log" -mtime +1 -delete

# 4. Generate status report
echo "📊 Generating status report..."
cat > "reports/agent-status-$(date +%Y%m%d).txt" <<EOF
Agent Status Report - $(date +%Y-%m-%d)
====================================

Current Branch: $(git branch --show-current)
Commits Today: $(git log --since="12 hours ago" --oneline | wc -l)
Files Changed: $(git diff --stat | tail -1)
Build Status: $(npm run build --silent && echo "✅ PASS" || echo "❌ FAIL")
Test Status: $(npm run test --silent && echo "✅ PASS" || echo "❌ FAIL")

Recent Errors:
$(grep -c "ERROR" logs/application.log) errors found

Top Issues:
$(grep "ERROR" logs/application.log | cut -d: -f4- | sort | uniq -c | sort -rn | head -5)
EOF

cat "reports/agent-status-$(date +%Y%m%d).txt"

echo "✅ EOD routine complete!"
```

---

## 🎯 Agent-Specific Branch Conventions

### Branch Naming

```bash
# Pattern: agent/<agent-id>/<task-type>/<description>

agent/agent-001/feature/ipld-integration
agent/agent-002/bugfix/marketplace-payment
agent/agent-003/refactor/log-service
agent/agent-004/docs/api-documentation
agent/agent-005/test/integration-tests
```

### Branch Types

```bash
# Feature development
git checkout -b agent/${AGENT_ID}/feature/${FEATURE_NAME}

# Bug fixes
git checkout -b agent/${AGENT_ID}/bugfix/${BUG_DESCRIPTION}

# Refactoring
git checkout -b agent/${AGENT_ID}/refactor/${COMPONENT_NAME}

# Documentation
git checkout -b agent/${AGENT_ID}/docs/${DOC_TOPIC}

# Testing
git checkout -b agent/${AGENT_ID}/test/${TEST_SUITE}
```

---

## 📊 Log Monitoring Patterns

### Watch for Specific Events

```bash
# Monitor IPLD operations
tail -f logs/application.log | grep "IPLD"

# Monitor agent activity
tail -f logs/application.log | grep "agent-"

# Monitor errors only
tail -f logs/application.log | grep -E "ERROR|FATAL"

# Monitor specific service
tail -f logs/application.log | grep "VRCodeMarketplace"

# Monitor API calls
tail -f logs/application.log | grep -E "GET|POST|PUT|DELETE"
```

### Alert on Critical Events

```bash
# Alert on any error (terminal bell)
tail -f logs/application.log | grep --line-buffered "ERROR" | while read line; do echo -e "\a$line"; done

# Send notification on critical error
tail -f logs/application.log | grep --line-buffered "FATAL" | while read line; do
  echo "🚨 CRITICAL ERROR: $line"
  # Could send Slack/Discord notification here
done

# Count errors per minute
watch -n 60 'grep "ERROR" logs/application.log | tail -60 | wc -l'
```

---

## 🔧 Automated Monitoring Scripts

### Create Log Monitor Service

```bash
#!/bin/bash
# monitor-logs.sh (already exists in repo)

# Enhanced version with branch awareness

AGENT_ID="${1:-agent-unknown}"
BRANCH=$(git branch --show-current)
LOG_FILE="logs/monitor-${AGENT_ID}-$(date +%Y%m%d-%H%M%S).log"

echo "🤖 Starting log monitor for $AGENT_ID on branch $BRANCH"
echo "📝 Logging to: $LOG_FILE"

# Function to colorize output
colorize() {
    sed -E \
        -e 's/(ERROR|FATAL)/\x1b[31m\1\x1b[0m/g' \
        -e 's/(WARN)/\x1b[33m\1\x1b[0m/g' \
        -e 's/(INFO)/\x1b[32m\1\x1b[0m/g' \
        -e 's/(DEBUG)/\x1b[36m\1\x1b[0m/g'
}

# Monitor logs with colorization
tail -f logs/application.log | colorize | tee -a "$LOG_FILE"
```

### Branch Health Check

```bash
#!/bin/bash
# check-branch-health.sh

BRANCH=$(git branch --show-current)

echo "🏥 Branch Health Check: $BRANCH"
echo "================================="

# Check if branch is up to date
git fetch origin
BEHIND=$(git rev-list HEAD..origin/$BRANCH --count 2>/dev/null || echo "0")
AHEAD=$(git rev-list origin/$BRANCH..HEAD --count 2>/dev/null || echo "0")

echo "📊 Status:"
echo "  - Behind origin: $BEHIND commits"
echo "  - Ahead of origin: $AHEAD commits"

# Check for uncommitted changes
UNCOMMITTED=$(git status --porcelain | wc -l)
echo "  - Uncommitted changes: $UNCOMMITTED files"

# Check build status
echo ""
echo "🔨 Build Status:"
if npm run build --silent 2>&1 | tee logs/build-check.log; then
    echo "  ✅ Build: PASS"
else
    echo "  ❌ Build: FAIL"
    echo "  See logs/build-check.log for details"
fi

# Check for errors in logs
ERROR_COUNT=$(grep -c "ERROR" logs/application.log 2>/dev/null || echo "0")
echo ""
echo "🔍 Recent Errors: $ERROR_COUNT"
if [ "$ERROR_COUNT" -gt 0 ]; then
    echo "  Last 5 errors:"
    grep "ERROR" logs/application.log | tail -5 | sed 's/^/    /'
fi

# IPLD health check
echo ""
echo "🔗 IPLD Service:"
if curl -s http://localhost:3000/lit-compute/ipld/info > /dev/null 2>&1; then
    echo "  ✅ IPLD: Online"
    STATS=$(curl -s http://localhost:3000/lit-compute/ipld/stats)
    echo "  $(echo $STATS | jq -r '.totalBlocks') blocks stored"
else
    echo "  ❌ IPLD: Offline"
fi

echo ""
echo "================================="
```

---

## 📚 Quick Commands Cheat Sheet

```bash
# BRANCH OPERATIONS
git branch --show-current              # Show current branch
git checkout -b agent/ID/feature       # Create new agent branch
git fetch --all                        # Get all remote branches
git branch -a                          # List all branches
git checkout <branch>                  # Switch branch
git stash                              # Save current work

# LOG MONITORING
tail -f logs/application.log           # Watch logs live
grep "ERROR" logs/*.log                # Find errors
grep -A 3 -B 3 "ERROR" logs/*.log      # Errors with context
tail -f logs/*.log | grep --color ERROR # Colorized errors

# SYSTEM STATUS
npm run build                          # Build project
npm run test                           # Run tests
npm run start:dev                      # Start dev server
curl localhost:3000/health             # Check health
curl localhost:3000/lit-compute/ipld/stats # IPLD stats

# IPLD OPERATIONS
curl localhost:3000/lit-compute/ipld/info          # Service info
curl localhost:3000/lit-compute/ipld/resolve/CID   # Resolve CID
curl -X POST localhost:3000/lit-compute/ipld/verify # Verify

# AGENT WORKFLOW
./agent-startup.sh                     # Morning routine
./agent-work-session.sh                # Work session
./agent-eod.sh                         # End of day
./check-branch-health.sh               # Health check
./monitor-logs.sh agent-001            # Monitor logs
```

---

## 🎯 Agent Best Practices

### 1. Always Check Branch First
```bash
# Before starting work
git branch --show-current
git status
git fetch --all
```

### 2. Log Everything
```bash
# All work should be logged
exec &> >(tee -a "logs/agent-$AGENT_ID-$(date +%Y%m%d).log")
```

### 3. Monitor Continuously
```bash
# Keep a terminal with live logs
tail -f logs/application.log | grep --color -E "ERROR|WARN|$AGENT_ID|$"
```

### 4. Commit Frequently
```bash
# Commit every logical change
git add .
git commit -m "[$AGENT_ID] Descriptive message"
git push origin agent/$AGENT_ID/feature
```

### 5. Check Health Before Pushing
```bash
# Before pushing
npm run build
npm run test
./check-branch-health.sh
```

---

## 🚨 Troubleshooting

### Branch Issues

```bash
# Can't checkout branch
git stash
git checkout <branch>

# Branch diverged
git fetch origin
git rebase origin/<branch>

# Lost commits
git reflog
git checkout <commit-hash>
```

### Log Issues

```bash
# Logs too large
find logs/ -name "*.log" -size +100M -delete

# Can't find logs
ls -lh logs/

# Permission denied
sudo chown -R $USER:$USER logs/
```

### IPLD Issues

```bash
# Service not responding
curl http://localhost:3000/lit-compute/ipld/info

# Check if server is running
ps aux | grep node

# Restart server
npm run start:dev
```

---

## ✅ Agent Checklist

Daily checklist for autonomous agents:

```
[ ] Check current branch (git branch --show-current)
[ ] Fetch latest updates (git fetch --all)
[ ] Start log monitoring (tail -f logs/application.log &)
[ ] Check system health (curl localhost:3000/health)
[ ] Verify IPLD service (curl localhost:3000/lit-compute/ipld/stats)
[ ] Create/checkout work branch (git checkout -b agent/ID/task)
[ ] Enable session logging (exec &> >(tee logs/session.log))
[ ] Run build (npm run build)
[ ] Run tests (npm run test)
[ ] Monitor for errors (grep ERROR logs/*.log)
[ ] Commit work (git commit -am "message")
[ ] Push branch (git push origin branch)
[ ] Run health check (./check-branch-health.sh)
[ ] Generate EOD report (./agent-eod.sh)
```

---

## 🎉 Summary

**Essential Commands for Agents:**

1. **Branch**: `git checkout -b agent/<id>/<task>`
2. **Monitor**: `tail -f logs/application.log`
3. **Status**: `git status && npm run build && npm run test`
4. **Health**: `./check-branch-health.sh`
5. **Commit**: `git commit -am "[$AGENT_ID] Work done"`

**Pro Tips:**
- 🌿 Always work on an agent branch
- 📊 Always monitor logs in real-time
- ✅ Always check health before pushing
- 💾 Always log your session
- 🤖 Automate routine tasks with scripts

**Everything is ready for autonomous agent operations!** 🚀
