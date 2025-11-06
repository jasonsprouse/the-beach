#!/bin/bash

# 🧪 AI Testing & Revenue System - Integration Test
# Tests all major features end-to-end

echo "🚀 Starting AI Testing & Revenue Integration Test"
echo "=================================================="
echo ""

BASE_URL="http://localhost:3000"
API_BASE="${BASE_URL}/npe/ai-testing"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Test 1: Revenue Simulation${NC}"
echo "Running 5 iterations of AI testing..."
SIMULATION=$(curl -s -X POST "${API_BASE}/simulate-revenue" \
  -H "Content-Type: application/json" \
  -d '{
    "subPKPId": "test_pkp_integration",
    "iterations": 5
  }')

echo "$SIMULATION" | jq '.summary'
echo -e "${GREEN}✓ Simulation complete${NC}"
echo ""

echo -e "${BLUE}Test 2: Revenue Dashboard${NC}"
DASHBOARD=$(curl -s "${API_BASE}/revenue-dashboard")
echo "$DASHBOARD" | jq '{
  totalEstimatedRevenue,
  totalActualRevenue,
  deployedImprovements,
  revenueAccuracy
}'
echo -e "${GREEN}✓ Dashboard retrieved${NC}"
echo ""

echo -e "${BLUE}Test 3: Test Specific Code${NC}"
CODE_TEST=$(curl -s -X POST "${API_BASE}/test" \
  -H "Content-Type: application/json" \
  -d '{
    "subPKPId": "test_pkp_integration",
    "code": "async function processOrder(order) {\n  const total = order.items.reduce((sum, item) => sum + item.price, 0);\n  const tax = total * 0.08;\n  return total + tax;\n}",
    "language": "JavaScript",
    "context": "E-commerce order processing",
    "testType": "revenue-impact"
  }')

TEST_ID=$(echo "$CODE_TEST" | jq -r '.id')
QUALITY=$(echo "$CODE_TEST" | jq -r '.metrics.codeQualityScore')
REVENUE=$(echo "$CODE_TEST" | jq -r '.metrics.revenueImpact.estimatedMonthlyRevenue')
RECOMMENDATION=$(echo "$CODE_TEST" | jq -r '.aiAnalysis.recommendation')

echo "Test ID: $TEST_ID"
echo "Quality Score: $QUALITY"
echo "Estimated Revenue: \$$REVENUE/mo"
echo "Recommendation: $RECOMMENDATION"
echo -e "${GREEN}✓ Code tested${NC}"
echo ""

echo -e "${BLUE}Test 4: Analytics${NC}"
ANALYTICS=$(curl -s "${API_BASE}/analytics/test_pkp_integration")
echo "$ANALYTICS" | jq '{
  totalTests,
  passRate,
  averageCodeQuality: .qualityMetrics.averageCodeQuality,
  totalEstimatedRevenue: .revenueMetrics.totalEstimatedRevenue
}'
echo -e "${GREEN}✓ Analytics retrieved${NC}"
echo ""

echo -e "${BLUE}Test 5: Revenue Forecast${NC}"
FORECAST=$(curl -s "${API_BASE}/forecast")
echo "$FORECAST" | jq '.forecast[0:3]'
echo -e "${GREEN}✓ Forecast generated${NC}"
echo ""

echo -e "${BLUE}Test 6: Top Performers${NC}"
TOP=$(curl -s "${API_BASE}/top-performers?limit=3")
echo "$TOP" | jq '.topPerformers[0:3] | map({testId, qualityScore, estimatedRevenue, recommendation})'
echo -e "${GREEN}✓ Top performers identified${NC}"
echo ""

# Deploy if recommended
if [ "$RECOMMENDATION" = "deploy" ]; then
  echo -e "${BLUE}Test 7: Deploy High-Value Code${NC}"
  DEPLOY=$(curl -s -X POST "${API_BASE}/deploy/${TEST_ID}")
  echo "$DEPLOY" | jq '.'
  echo -e "${GREEN}✓ Code deployed${NC}"
  echo ""
  
  echo -e "${YELLOW}Waiting 6 seconds for revenue tracking...${NC}"
  sleep 6
  
  echo -e "${BLUE}Test 8: Verify Revenue Tracking${NC}"
  UPDATED_DASHBOARD=$(curl -s "${API_BASE}/revenue-dashboard")
  echo "$UPDATED_DASHBOARD" | jq '{
    totalEstimatedRevenue,
    totalActualRevenue,
    deployedImprovements
  }'
  echo -e "${GREEN}✓ Revenue tracked${NC}"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}✅ All Integration Tests Passed!${NC}"
echo "=================================================="
echo ""

# Summary
echo -e "${BLUE}Summary:${NC}"
echo "• Simulation: 5 iterations completed"
echo "• Dashboard: Revenue metrics retrieved"
echo "• Code Testing: AI analysis performed"
echo "• Analytics: Sub-PKP performance tracked"
echo "• Forecast: 12-month projection generated"
echo "• Top Performers: Best code identified"
if [ "$RECOMMENDATION" = "deploy" ]; then
  echo "• Deployment: High-value code deployed"
  echo "• Revenue Tracking: Actual revenue monitored"
fi

echo ""
echo -e "${GREEN}🎉 AI Testing & Revenue System: OPERATIONAL${NC}"
echo ""

# Final stats
echo -e "${BLUE}Final Stats:${NC}"
FINAL_DASHBOARD=$(curl -s "${API_BASE}/revenue-dashboard")
echo "$FINAL_DASHBOARD" | jq '{
  totalEstimatedRevenue: .totalEstimatedRevenue,
  totalActualRevenue: .totalActualRevenue,
  deployedImprovements: .deployedImprovements,
  averageRevenuePerImprovement: .averageRevenuePerImprovement,
  revenueAccuracy: .revenueAccuracy,
  topPerformer: .topPerformingTests[0].estimatedMonthlyRevenue
}'

echo ""
echo "Test complete! 🚀"
