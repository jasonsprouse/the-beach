#!/bin/bash

# VR Code Marketplace - Complete Demo Script
# Run all demonstrations in sequence to showcase the full system

set -e  # Exit on error

echo "🎮 VR Code Marketplace - Complete Demo Suite"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"

echo -e "${BLUE}📋 Pre-flight Checklist${NC}"
echo "1. Server running at ${BASE_URL}? (checking...)"

# Check if server is running
if curl -s "${BASE_URL}/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${YELLOW}⚠️  Server not running. Starting...${NC}"
    npm run start:dev &
    SERVER_PID=$!
    echo "Waiting for server to start..."
    sleep 10
fi

echo ""
echo -e "${BLUE}🚀 Demo 1: VR Marketplace Tour${NC}"
echo "=================================="
curl -s "${BASE_URL}/marketplace/demo/vr-experience" | jq -r '.scene.products[] | "  📦 \(.name) - $\(.pricing.professional)"'
echo ""
echo -e "${GREEN}✅ Open VR Marketplace:${NC} ${BASE_URL}/vr-marketplace.html"
echo "   - Walk around with WASD keys"
echo "   - Click products to view details"
echo "   - Click 'Enter VR' for immersive mode"
echo ""

read -p "Press Enter to continue to Demo 2..."

echo ""
echo -e "${BLUE}🚀 Demo 2: Purchase Flow${NC}"
echo "========================="
echo "Simulating complete purchase of Digital Agents ($3,499)..."
echo ""

PURCHASE_RESPONSE=$(curl -s "${BASE_URL}/marketplace/demo/purchase-flow")
echo "$PURCHASE_RESPONSE" | jq -r '.purchase | "License Key: \(.licenseKey)\nDownload: \(.downloadUrl)\nActivations: \(.activations)/\(.maxActivations)"'
echo ""
echo -e "${GREEN}✅ Purchase completed!${NC}"
echo ""

read -p "Press Enter to continue to Demo 3..."

echo ""
echo -e "${BLUE}🚀 Demo 3: Digital AI Agents${NC}"
echo "============================="
echo "Building a Y8 App feature with AI agents..."
echo ""

curl -s -X POST "${BASE_URL}/npe/digital-agents/demo/y8-feature" \
  -H "Content-Type: application/json" \
  -d '{"feature": "user-profile-page"}' | jq -r '.build.steps[] | "  \(.stepNumber). \(.name) - \(.status)"'
echo ""
echo -e "${GREEN}✅ AI Agent built feature!${NC}"
echo ""

read -p "Press Enter to continue to Demo 4..."

echo ""
echo -e "${BLUE}🚀 Demo 4: AI Testing & Revenue${NC}"
echo "================================"
echo "Testing code improvement with revenue impact..."
echo ""

curl -s -X POST "${BASE_URL}/npe/ai-testing/test" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "demo-task-001",
    "code": "function calculatePrice(items) { return items.reduce((sum, item) => sum + item.price * 1.1, 0); }",
    "testCases": ["Should increase revenue by 10%"]
  }' | jq -r '.result | "Quality Score: \(.qualityScore)\nRevenue Impact: $\(.revenueImpact)\nRecommendation: \(.recommendation)"'
echo ""
echo -e "${GREEN}✅ Code tested and revenue calculated!${NC}"
echo ""

read -p "Press Enter to continue to Demo 5..."

echo ""
echo -e "${BLUE}🚀 Demo 5: Log Data Marketplace${NC}"
echo "================================"
echo "Analyzing valuable pipeline logs..."
echo ""

curl -s -X POST "${BASE_URL}/npe/log-marketplace/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "stage": "build",
    "message": "Build completed in 45s, all tests passed, coverage 95%",
    "metadata": {"duration": 45000, "tests": 120, "coverage": 95}
  }' | jq -r '.analysis | "Quality: \(.quality.overall)\nPayment: $\(.payment.amount)\nReason: \(.payment.reason)"'
echo ""
echo -e "${GREEN}✅ Log analyzed and payment calculated!${NC}"
echo ""

read -p "Press Enter to continue to Demo 6..."

echo ""
echo -e "${BLUE}🚀 Demo 6: Marketplace Analytics${NC}"
echo "================================="
echo "Current marketplace performance..."
echo ""

curl -s "${BASE_URL}/marketplace/analytics" | jq -r '.analytics.overview | "Total Revenue: $\(.totalRevenue)\nTotal Sales: \(.totalSales)\nAvg Order Value: $\(.avgOrderValue | floor)"'
echo ""
curl -s "${BASE_URL}/marketplace/analytics" | jq -r '.analytics.topProducts[] | "  🏆 \(.name): \(.sales) sales, $\(.revenue) revenue"'
echo ""
echo -e "${GREEN}✅ Analytics retrieved!${NC}"
echo ""

read -p "Press Enter to continue to Demo 7..."

echo ""
echo -e "${BLUE}🚀 Demo 7: NPE Manager Authentication${NC}"
echo "======================================"
echo "Creating NPE Manager with social login..."
echo ""

curl -s -X POST "${BASE_URL}/npe/managers/create" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "google",
    "userId": "demo-user-google-123"
  }' | jq -r '.manager | "NPE Manager ID: \(.npeManagerId)\nPKP Address: \(.pkpAddress)\nProvider: \(.authProvider)"'
echo ""
echo -e "${GREEN}✅ NPE Manager created!${NC}"
echo ""

read -p "Press Enter to view final summary..."

echo ""
echo "=================================="
echo -e "${GREEN}🎉 All Demos Completed!${NC}"
echo "=================================="
echo ""
echo "What you just experienced:"
echo ""
echo "1. ✅ VR Marketplace - Interactive 3D store"
echo "2. ✅ Purchase Flow - Stripe checkout + licensing"
echo "3. ✅ Digital AI Agents - Autonomous code building"
echo "4. ✅ AI Testing & Revenue - Code quality → money"
echo "5. ✅ Log Data Marketplace - Logs → insights → payment"
echo "6. ✅ Analytics Dashboard - Revenue tracking"
echo "7. ✅ NPE Manager Auth - PKP + social login"
echo ""
echo "🎯 Key Endpoints:"
echo "   VR Store: ${BASE_URL}/vr-marketplace.html"
echo "   API Docs: ${BASE_URL}/marketplace/products"
echo "   Analytics: ${BASE_URL}/marketplace/analytics"
echo ""
echo "📚 Documentation:"
echo "   - VR_MARKETPLACE_QUICKSTART.md"
echo "   - FREEMIUM_DIGITAL_AGENTS_QUICKSTART.md"
echo "   - LOG_DATA_MARKETPLACE_QUICKSTART.md"
echo "   - AI_TESTING_QUICKSTART.md"
echo ""
echo "💰 Total Revenue Model:"
echo "   1. Sell code packages in VR ($499-$9,999)"
echo "   2. AI testing pays for good code ($1-$1,000+)"
echo "   3. Log marketplace pays for insights ($0.10-$20+)"
echo ""
echo -e "${YELLOW}Ready to deploy and monetize!${NC} 🚀"
echo ""

# Cleanup
if [ ! -z "$SERVER_PID" ]; then
    echo "Stopping demo server..."
    kill $SERVER_PID 2>/dev/null || true
fi
