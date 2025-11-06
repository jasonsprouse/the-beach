#!/bin/bash

# PKP Sales Quick Start Script
# This script helps you set up and start selling your code and music

set -e

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║              PKP SALES SYSTEM - QUICK START                        ║"
echo "║     Sell Your Code & Music with Google Login PKP Auth             ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if server is running
if ! curl -s http://localhost:3000/status > /dev/null 2>&1; then
    echo "❌ Server not running. Starting server..."
    npm run start:dev &
    sleep 5
else
    echo "✅ Server is running"
fi

echo ""
echo "📊 Checking marketplace status..."
MARKETPLACE_STATUS=$(curl -s http://localhost:3000/marketplace/status)
echo "$MARKETPLACE_STATUS" | jq '.' 2>/dev/null || echo "$MARKETPLACE_STATUS"

echo ""
echo "─────────────────────────────────────────────────────────────────────"
echo ""

# Your PKP (replace with your actual PKP public key)
PKP_KEY="${PKP_KEY:-your-google-pkp-public-key-here}"

echo "🔐 Your PKP: $PKP_KEY"
echo ""

# Step 1: Link platforms
echo "📌 STEP 1: Linking Your Platforms"
echo "─────────────────────────────────────────────────────────────────────"

echo "Linking GitHub..."
curl -s -X POST http://localhost:3000/marketplace/link-github \
  -H "Content-Type: application/json" \
  -d "{\"pkp\":\"$PKP_KEY\",\"repo\":\"jasonsprouse/the-beach\"}" | jq '.'

echo ""
echo "Linking Vercel..."
curl -s -X POST http://localhost:3000/marketplace/link-vercel \
  -H "Content-Type: application/json" \
  -d "{\"pkp\":\"$PKP_KEY\",\"deployment\":\"https://vercel.com/jasonsprouses-projects/the-beach\"}" | jq '.'

echo ""
echo "✅ Platforms linked!"
echo ""

# Step 2: Create storefront
echo "📌 STEP 2: Creating Your Storefront"
echo "─────────────────────────────────────────────────────────────────────"

STOREFRONT=$(curl -s -X POST http://localhost:3000/marketplace/create-storefront \
  -H "Content-Type: application/json" \
  -d "{
    \"ownerPKP\": \"$PKP_KEY\",
    \"storeName\": \"Jason Sprouse Dev Shop\",
    \"description\": \"Premium XR code packages and immersive music\",
    \"branding\": {
      \"primaryColor\": \"#00D4FF\",
      \"accentColor\": \"#FF00FF\"
    },
    \"sections\": [
      {
        \"type\": \"code_packages\",
        \"title\": \"Development Tools & Frameworks\",
        \"featured\": [\"complete-platform\"]
      }
    ],
    \"socials\": {
      \"github\": \"https://github.com/jasonsprouse\",
      \"vercel\": \"https://vercel.com/jasonsprouses-projects\"
    }
  }")

echo "$STOREFRONT" | jq '.'
STOREFRONT_URL=$(echo "$STOREFRONT" | jq -r '.storefrontURL // "N/A"')

echo ""
echo "🎉 Storefront created: $STOREFRONT_URL"
echo ""

# Step 3: List available packages
echo "📌 STEP 3: Your Available Products"
echo "─────────────────────────────────────────────────────────────────────"

echo "Code Packages:"
curl -s http://localhost:3000/marketplace/code-packages | jq '.packages[] | {name, price: .pricing.price, id}'

echo ""
echo "─────────────────────────────────────────────────────────────────────"
echo ""

# Step 4: Publish first package
echo "📌 STEP 4: Publishing Your First Product"
echo "─────────────────────────────────────────────────────────────────────"

echo "Publishing 'Complete Beach XR Platform'..."
PUBLISH_RESULT=$(curl -s -X POST http://localhost:3000/marketplace/publish \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"code_package\",
    \"packageId\": \"complete-platform\",
    \"publishTo\": [\"marketplace\", \"github\", \"vercel\"],
    \"pkpSignature\": \"demo-signature\"
  }")

echo "$PUBLISH_RESULT" | jq '.'

echo ""
echo "─────────────────────────────────────────────────────────────────────"
echo ""

# Step 5: Show dashboard
echo "📌 STEP 5: Your Sales Dashboard"
echo "─────────────────────────────────────────────────────────────────────"

DASHBOARD=$(curl -s http://localhost:3000/marketplace/dashboard/$PKP_KEY)
echo "$DASHBOARD" | jq '.'

echo ""
echo "═════════════════════════════════════════════════════════════════════"
echo ""
echo "🎉 SETUP COMPLETE!"
echo ""
echo "Your marketplace is now live. Here's what you can do:"
echo ""
echo "📊 View Dashboard:"
echo "   curl http://localhost:3000/marketplace/dashboard/$PKP_KEY | jq '.'"
echo ""
echo "📦 Create Code Package:"
echo "   curl -X POST http://localhost:3000/marketplace/code-packages \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"name\":\"My Package\",\"price\":99.99,\"ownerPKP\":\"$PKP_KEY\"}'"
echo ""
echo "🎵 Create Music Track:"
echo "   curl -X POST http://localhost:3000/marketplace/music-tracks \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"title\":\"My Song\",\"artist\":{\"pkp\":\"$PKP_KEY\"},\"pricing\":{...}}'"
echo ""
echo "📈 View Analytics:"
echo "   curl http://localhost:3000/marketplace/analytics/$PKP_KEY | jq '.'"
echo ""
echo "💰 View Sales:"
echo "   curl 'http://localhost:3000/marketplace/purchases?pkp=$PKP_KEY&role=seller' | jq '.'"
echo ""
echo "═════════════════════════════════════════════════════════════════════"
echo ""
echo "📚 Full Documentation: PKP_SALES_SYSTEM.md"
echo "🌐 Your Storefront: $STOREFRONT_URL"
echo ""
echo "Ready to make sales! 🚀💰"
echo ""
