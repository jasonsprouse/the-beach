#!/bin/bash

# Cross-Repository Code Review Trigger
# This script initiates a comprehensive code review of the Y8 App <-> The Beach integration
# using the AI agent system.

set -e

# Configuration
API_BASE="http://localhost:3001"
REVIEW_CHECKLIST="CODE_REVIEW_CHECKLIST.md"

echo "🔍 Initiating Cross-Repository Code Review..."
echo "================================================"
echo ""

# Check if checklist exists
if [ ! -f "$REVIEW_CHECKLIST" ]; then
  echo "❌ Error: $REVIEW_CHECKLIST not found"
  exit 1
fi

# Read the checklist content
CHECKLIST_CONTENT=$(cat "$REVIEW_CHECKLIST")

# Prepare the review request
REVIEW_REQUEST=$(cat <<EOF
{
  "description": "Conduct a comprehensive cross-repository code review of the Y8 App and The Beach integration. Focus on:\n\n1. Redis shared state configuration and consistency\n2. IPLD integration and CID handling\n3. Environment variable configuration\n4. Error handling and defensive programming\n5. WebSocket/Pub-Sub real-time communication\n6. PKP authentication and authorization\n7. Data structure consistency\n8. Performance and scalability\n\nUse the detailed checklist provided in CODE_REVIEW_CHECKLIST.md to systematically verify all integration points.",
  "language": "TypeScript",
  "context": "This review spans two repositories:\n- jasonsprouse/y8-app (Next.js frontend)\n- jasonsprouse/the-beach (NestJS backend)\n\nBoth apps share a Redis instance for session management, job queue, and node registry.\n\nKey files to review:\n- src/lit-compute/services/redis.service.ts\n- src/lit-compute/services/ipld.service.ts\n- src/npe/services/pkp-auth.service.ts\n- Environment configuration files (.env)\n\nRefer to CODE_REVIEW_CHECKLIST.md for complete review criteria."
}
EOF
)

echo "📋 Submitting review request to AI agent..."
REVIEW_RESPONSE=$(curl -s -X POST "$API_BASE/npe/ai/review-code" \
  -H "Content-Type: application/json" \
  -d "$REVIEW_REQUEST")

echo "✅ Review request submitted"
echo ""
echo "Response:"
echo "$REVIEW_RESPONSE" | jq '.'
echo ""

# Now create a task plan for the review
echo "📝 Generating task plan..."
PLAN_REQUEST=$(cat <<EOF
{
  "goal": "Complete a comprehensive cross-repository code review of Y8 App <-> The Beach integration following the checklist in CODE_REVIEW_CHECKLIST.md",
  "agentRole": "Game Manager PKP",
  "context": {
    "repositories": ["jasonsprouse/y8-app", "jasonsprouse/the-beach"],
    "focus_areas": [
      "Redis shared state",
      "IPLD integration",
      "Environment configuration",
      "Error handling",
      "WebSocket communication",
      "PKP authentication",
      "Data consistency",
      "Performance"
    ],
    "deliverables": [
      "Issue list (critical and non-critical)",
      "Test coverage report",
      "Configuration audit",
      "Architecture validation",
      "Documentation updates"
    ]
  },
  "constraints": [
    "Follow CODE_REVIEW_CHECKLIST.md systematically",
    "Verify both development and production configurations",
    "Test cross-app data sharing",
    "Document all findings with file paths and line numbers",
    "Prioritize issues by severity"
  ]
}
EOF
)

PLAN_RESPONSE=$(curl -s -X POST "$API_BASE/npe/ai/plan-task" \
  -H "Content-Type: application/json" \
  -d "$PLAN_REQUEST")

echo "✅ Task plan generated"
echo ""
echo "Plan:"
echo "$PLAN_RESPONSE" | jq '.'
echo ""

# Save responses to file
OUTPUT_FILE="code-review-task-$(date +%Y%m%d-%H%M%S).json"
echo "💾 Saving review task to $OUTPUT_FILE..."

cat > "$OUTPUT_FILE" <<EOF
{
  "timestamp": "$(date -Iseconds)",
  "checklist": "$REVIEW_CHECKLIST",
  "review_response": $REVIEW_RESPONSE,
  "task_plan": $PLAN_RESPONSE
}
EOF

echo "✅ Review task saved"
echo ""
echo "================================================"
echo "📊 Next Steps:"
echo "1. Game Manager PKP will execute the review plan"
echo "2. Monitor progress via /npe/pkp/dashboard"
echo "3. Review findings in the generated report"
echo "4. Address critical issues before production deploy"
echo ""
echo "Review task details: $OUTPUT_FILE"
echo "Full checklist: $REVIEW_CHECKLIST"
