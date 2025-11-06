# Agent Operations Quick Start

**Quick reference for autonomous digital agents to manage branches and monitor logs**

## 🚀 Daily Workflow

### 1. Morning Startup
```bash
./agent-startup.sh <agent-id>
```

**What it does:**
- ✅ Checks current branch status
- ✅ Fetches latest updates
- ✅ Lists available branches
- ✅ Runs health checks (server + IPLD)
- ✅ Analyzes recent errors
- ✅ Generates startup report

**Example:**
```bash
./agent-startup.sh agent-001
# Output: reports/agent-001-startup-YYYYMMDD-HHMMSS.txt
```

---

### 2. Start Work Session
```bash
./agent-work-session.sh <agent-id> <task-name>
```

**What it does:**
- ✅ Stashes uncommitted changes (optional)
- ✅ Creates/checks out branch: `agent/<agent-id>/<task>`
- ✅ Pulls remote updates if exists
- ✅ Runs build and tests
- ✅ Checks system health
- ✅ Enables session logging

**Example:**
```bash
./agent-work-session.sh agent-001 ipld-enhancement
# Branch: agent/agent-001/ipld-enhancement
# Session log: logs/agent-001-ipld-enhancement-YYYYMMDD-HHMMSS.log
```

---

### 3. Check Health Anytime
```bash
./check-branch-health.sh
```

**What it checks:**
- 📡 Sync status (ahead/behind remote)
- 📂 Working directory (uncommitted, untracked)
- 🔨 Build status
- 🧪 Test results
- 📊 Code quality (TypeScript, linting)
- 🔍 Log analysis (errors, warnings)
- 🏥 Service health (server, IPLD)
- 📦 Dependencies (outdated, vulnerabilities)
- 💾 Disk usage

**Output:** Health score 0-100 with actionable recommendations

---

### 4. End of Day
```bash
./agent-eod.sh <agent-id>
```

**What it does:**
- 📝 Summarizes commits (last 12 hours)
- 💾 Optionally stashes uncommitted work
- 📦 Archives logs (tar.gz)
- 🔨 Final build/test validation
- 🔍 Error analysis
- 🔗 IPLD statistics
- 📊 Generates comprehensive EOD report

**Example:**
```bash
./agent-eod.sh agent-001
# Output: reports/agent-001-eod-YYYYMMDD.txt
# Logs: logs/archive/logs-agent-001-YYYYMMDD.tar.gz
```

---

## 📋 Branch Naming Convention

All agent branches follow this pattern:
```
agent/<agent-id>/<task-type>/<description>
```

**Examples:**
- `agent/agent-001/feature/ipld-enhancement`
- `agent/alpha-squad/bugfix/redis-connection`
- `agent/pkp-builder/refactor/code-cleanup`

**Task Types:**
- `feature/` - New features
- `bugfix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation
- `test/` - Testing
- `perf/` - Performance improvements

---

## 📊 Monitoring Logs

### Real-time Log Monitoring
```bash
# Watch application logs with colors
./monitor-logs.sh

# Or use tail directly
tail -f logs/application.log

# Filter specific errors
tail -f logs/application.log | grep ERROR

# Watch with colorization
tail -f logs/application.log | grep --color=auto -E 'ERROR|WARN|INFO'
```

### Log Analysis Commands
```bash
# Count errors today
grep ERROR logs/application.log | wc -l

# Top error types
grep ERROR logs/application.log | awk '{print $NF}' | sort | uniq -c | sort -rn | head -10

# Errors in last hour
grep ERROR logs/application.log | grep "$(date '+%Y-%m-%d %H')"

# Find specific service logs
grep "IPLDService" logs/application.log

# Check Redis errors
grep "RedisService" logs/application.log | grep ERROR
```

---

## 🏥 Health Check Details

### Health Score Breakdown

**Perfect Score (100):**
- ✅ In sync with remote
- ✅ No uncommitted changes
- ✅ Build passing
- ✅ Tests passing
- ✅ No TypeScript errors
- ✅ No linting issues
- ✅ No recent errors in logs
- ✅ All services running
- ✅ No outdated dependencies
- ✅ No security vulnerabilities

**Deductions:**
- -5 for uncommitted changes
- -20 for build failures
- -15 for test failures
- -1 per 10 TypeScript errors (max -15)
- -1 per 10 lint issues (max -10)
- -1 per 10 log errors (max -15)
- -10 per offline service
- -5 for outdated dependencies
- -10 for security vulnerabilities

---

## 🔧 Git Operations for Agents

### Create Feature Branch
```bash
git checkout -b agent/<agent-id>/feature/<feature-name>
```

### Switch Between Tasks
```bash
# Stash current work
git stash push -m "WIP: current task"

# Switch to other branch
git checkout agent/<agent-id>/<other-task>

# Return later
git checkout agent/<agent-id>/<original-task>
git stash pop
```

### Commit Work
```bash
git add .
git commit -m "[<agent-id>] <type>: <description>"

# Examples:
git commit -m "[agent-001] feat: add IPLD enhancement"
git commit -m "[alpha-squad] fix: resolve Redis connection issue"
```

### Push to Remote
```bash
# First time pushing branch
git push -u origin agent/<agent-id>/<task>

# Subsequent pushes
git push
```

### Update from Remote
```bash
# Fetch all updates
git fetch --all

# Pull current branch
git pull origin agent/<agent-id>/<task>

# Rebase on master
git fetch origin master
git rebase origin/master
```

---

## 📁 Important Directories

```
/home/goodfaith/projects/xr/babylon/
├── logs/                    # Application logs
│   ├── application.log      # Main log file
│   └── archive/             # Archived logs
├── reports/                 # Agent reports
│   ├── *-startup-*.txt      # Morning startup reports
│   ├── *-session-*.json     # Work session metadata
│   └── *-eod-*.txt          # End of day reports
├── src/                     # Source code
│   ├── npe/                 # NPE services
│   └── lit-compute/         # Lit Compute services
└── node_modules/            # Dependencies
```

---

## 🎯 Common Tasks

### Check System Status
```bash
# Full system status
./system-status.sh

# Quick server check
curl http://localhost:3000/status

# IPLD service check
curl http://localhost:3000/lit-compute/ipld/stats
```

### Run Demos
```bash
# Run all demonstrations
./run-all-demos.sh

# Run specific demo
npm run demo:vr-marketplace
npm run demo:ai-testing
npm run demo:log-marketplace
```

### Build and Test
```bash
# Build project
npm run build

# Run tests
npm run test

# Watch mode
npm run test:watch

# Run with coverage
npm run test:cov
```

### Monitor Build Health
```bash
# Continuous build monitoring
./build-health-monitor.sh

# Check TypeScript errors
npm run build 2>&1 | grep "error TS"

# Check linting
npm run lint
```

---

## 🚨 Troubleshooting

### Build Failures
1. Check TypeScript errors: `npm run build`
2. Review error log: `logs/health-build-*.log`
3. Fix errors in source files
4. Verify: `./check-branch-health.sh`

### Test Failures
1. Run tests: `npm run test`
2. Check specific test: `npm run test -- <test-name>`
3. Review logs in terminal output
4. Fix failing tests

### Service Down
```bash
# Check if server running
ps aux | grep node

# Kill hanging process
pkill -f "nest start"

# Restart server
npm run start:dev
```

### Git Conflicts
```bash
# Show conflicts
git status

# Resolve manually, then:
git add <resolved-files>
git rebase --continue

# Or abort
git rebase --abort
```

---

## 📚 Additional Resources

- **AGENT_OPERATIONS_GUIDE.md** - Complete reference (3,500+ lines)
- **PKP_QUICKSTART.md** - PKP authentication guide
- **IPLD_INTEGRATION_GUIDE.md** - IPLD/IPFS integration
- **CHECKPOINTS.md** - Production checkpoints
- **README.md** - Project overview

---

## 💡 Pro Tips

1. **Run health checks frequently** - Catch issues early
2. **Commit often** - Small, atomic commits are better
3. **Use descriptive commit messages** - Include agent ID and type
4. **Monitor logs in real-time** - Use `./monitor-logs.sh`
5. **Archive logs regularly** - EOD script does this automatically
6. **Keep branches synced** - Pull from remote frequently
7. **Stash before switching** - Never lose work in progress
8. **Review EOD reports** - Learn from daily activities

---

## 🤖 Agent-Specific Workflows

### NPE Digital Agents
```bash
# Morning routine
./agent-startup.sh npe-builder-001

# Start code generation task
./agent-work-session.sh npe-builder-001 generate-feature

# Build and test
npm run build && npm run test

# Commit work
git add src/npe/
git commit -m "[npe-builder-001] feat: add new NPE feature"

# End of day
./agent-eod.sh npe-builder-001
```

### PKP Workers
```bash
# Morning routine
./agent-startup.sh pkp-worker-alpha

# Start VR task
./agent-work-session.sh pkp-worker-alpha vr-enhancement

# Check VR scene
npm run demo:vr-scene

# Commit VR work
git add src/scenes/
git commit -m "[pkp-worker-alpha] feat: enhance VR workspace"

# End of day
./agent-eod.sh pkp-worker-alpha
```

### IPLD Workers
```bash
# Morning routine
./agent-startup.sh ipld-worker-001

# Start IPLD task
./agent-work-session.sh ipld-worker-001 ipld-optimization

# Test IPLD service
curl http://localhost:3000/lit-compute/ipld/stats

# Commit IPLD work
git add src/lit-compute/services/ipld.service.ts
git commit -m "[ipld-worker-001] perf: optimize IPLD block storage"

# End of day
./agent-eod.sh ipld-worker-001
```

---

## 📊 Sample Daily Schedule

```
08:00 - Morning startup
  └─ ./agent-startup.sh agent-001
  
09:00 - Start feature work
  └─ ./agent-work-session.sh agent-001 new-feature
  
10:00 - Health check
  └─ ./check-branch-health.sh
  
12:00 - Commit progress
  └─ git add . && git commit -m "[agent-001] feat: WIP new feature"
  
14:00 - Health check
  └─ ./check-branch-health.sh
  
16:00 - Final commit
  └─ git add . && git commit -m "[agent-001] feat: complete new feature"
  
17:00 - End of day
  └─ ./agent-eod.sh agent-001
```

---

## 🎓 Learning Resources

**Branch Management:**
- Git branching best practices
- Agent-specific naming conventions
- Merge vs rebase strategies

**Log Monitoring:**
- Reading NestJS logs
- Identifying error patterns
- Performance analysis from logs

**Health Monitoring:**
- Build health metrics
- Test coverage tracking
- Dependency management

**IPLD Integration:**
- Content addressing basics
- CID generation and verification
- DAG structure understanding

---

**Last Updated:** 2025-11-06
**Version:** 1.0.0
**Maintainer:** Digital Agents Team

---

*For detailed documentation, see AGENT_OPERATIONS_GUIDE.md*
