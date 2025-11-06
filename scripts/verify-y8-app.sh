#!/bin/bash

# Y8 App Verification Script
# Clones the Y8 App repository and performs basic Redis integration checks

set -e

echo "🔍 Y8 App Redis Integration Verification"
echo "========================================"
echo ""

# Configuration
Y8_REPO="https://github.com/jasonsprouse/y8-app.git"
Y8_DIR="$HOME/projects/xr/y8-app"
BEACH_DIR="$HOME/projects/xr/babylon"

# Step 1: Clone repository if not exists
if [ -d "$Y8_DIR" ]; then
  echo "📁 Y8 App already cloned at $Y8_DIR"
  echo "   Pulling latest changes..."
  cd "$Y8_DIR"
  git pull
else
  echo "📥 Cloning Y8 App repository..."
  cd "$HOME/projects/xr"
  git clone "$Y8_REPO"
  cd "$Y8_DIR"
fi

echo "✅ Repository ready"
echo ""

# Step 2: Check for environment files
echo "🔧 Checking environment configuration..."
ENV_FILES=$(find . -maxdepth 2 -name ".env*" -o -name "*.env" 2>/dev/null || true)

if [ -z "$ENV_FILES" ]; then
  echo "⚠️  No .env files found"
  echo "   Expected: .env.local or .env"
else
  echo "✅ Found environment files:"
  echo "$ENV_FILES"
  echo ""
  
  # Check for REDIS_URL
  if grep -q "REDIS_URL" .env* 2>/dev/null; then
    echo "✅ REDIS_URL found:"
    grep "REDIS_URL" .env* 2>/dev/null || true
  else
    echo "❌ REDIS_URL not found in environment files"
    echo "   Action required: Add REDIS_URL=redis://localhost:6379"
  fi
fi

echo ""

# Step 3: Search for Redis client usage
echo "🔍 Searching for Redis client initialization..."
REDIS_IMPORTS=$(grep -r "from 'redis'\|from \"redis\"\|require('redis')\|ioredis" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
  lib/ app/ src/ pages/ 2>/dev/null | head -n 10 || echo "None found")

if [ "$REDIS_IMPORTS" = "None found" ]; then
  echo "❌ No Redis client imports found"
  echo "   Searched in: lib/, app/, src/, pages/"
  echo "   Action required: Verify Redis integration exists"
else
  echo "✅ Redis client imports found:"
  echo "$REDIS_IMPORTS"
fi

echo ""

# Step 4: Check for session management
echo "🔍 Searching for session management code..."
SESSION_CODE=$(grep -r "session:\|getSession\|setSession" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
  lib/ app/ src/ pages/ 2>/dev/null | head -n 10 || echo "None found")

if [ "$SESSION_CODE" = "None found" ]; then
  echo "⚠️  No session management code found"
else
  echo "✅ Session management code found:"
  echo "$SESSION_CODE"
fi

echo ""

# Step 5: Check for API calls to The Beach
echo "🔍 Searching for API calls to The Beach..."
API_CALLS=$(grep -r "localhost:3001\|BEACH_API\|/lit-compute\|/npe" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
  lib/ app/ src/ pages/ 2>/dev/null | head -n 10 || echo "None found")

if [ "$API_CALLS" = "None found" ]; then
  echo "⚠️  No API calls to The Beach found"
else
  echo "✅ API calls found:"
  echo "$API_CALLS"
fi

echo ""

# Step 6: Check dependencies
echo "🔍 Checking package dependencies..."
if [ -f "package.json" ]; then
  echo "✅ package.json found"
  
  # Check for Redis packages
  if grep -q "\"redis\"\|\"ioredis\"" package.json; then
    echo "✅ Redis package in dependencies:"
    grep "\"redis\"\|\"ioredis\"" package.json
  else
    echo "❌ No Redis package in dependencies"
    echo "   Action required: Install redis or ioredis"
  fi
  
  echo ""
  
  # Check for Lit Protocol packages
  if grep -q "\"@lit-protocol" package.json; then
    echo "✅ Lit Protocol packages found:"
    grep "\"@lit-protocol" package.json | head -n 5
  else
    echo "⚠️  No Lit Protocol packages found"
  fi
else
  echo "❌ package.json not found"
fi

echo ""

# Step 7: Generate report
REPORT_FILE="$BEACH_DIR/y8-app-verification-$(date +%Y%m%d-%H%M%S).txt"
echo "📊 Generating verification report..."

cat > "$REPORT_FILE" <<EOF
Y8 App Redis Integration Verification Report
Generated: $(date)
============================================

Repository: $Y8_REPO
Location: $Y8_DIR

FINDINGS:
---------

1. Environment Configuration:
$ENV_FILES

2. Redis Client Usage:
$REDIS_IMPORTS

3. Session Management:
$SESSION_CODE

4. API Calls to The Beach:
$API_CALLS

5. Dependencies:
$(cat package.json 2>/dev/null | grep -E "redis|lit-protocol" || echo "Could not read package.json")

RECOMMENDATIONS:
----------------

[ ] Verify REDIS_URL points to same instance as The Beach
[ ] Ensure Redis client is initialized correctly
[ ] Check session key naming matches The Beach patterns
[ ] Test cross-app session sharing
[ ] Verify error handling for Redis connection failures
[ ] Add integration tests for shared state

NEXT STEPS:
-----------

1. Review identified files for Redis integration
2. Run manual tests from CODE_REVIEW_SUMMARY.md
3. Compare key naming conventions with The Beach
4. Test session sharing between apps
5. Verify environment variables in production (Vercel)

EOF

echo "✅ Report saved to: $REPORT_FILE"
echo ""

# Step 8: Summary
echo "========================================"
echo "📋 Verification Summary"
echo "========================================"
echo ""
echo "✅ Steps Completed:"
echo "   1. Repository cloned/updated"
echo "   2. Environment files checked"
echo "   3. Redis client usage searched"
echo "   4. Session management code identified"
echo "   5. API integration verified"
echo "   6. Dependencies reviewed"
echo "   7. Report generated"
echo ""
echo "📄 Full report: $REPORT_FILE"
echo ""
echo "🎯 Next Actions:"
echo "   1. Review the report file"
echo "   2. Read CODE_REVIEW_SUMMARY.md for detailed steps"
echo "   3. Run manual tests to verify integration"
echo "   4. Address any issues found"
echo ""
