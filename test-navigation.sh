#!/bin/bash
# Test script for navigation flow

echo "🧪 Testing Navigation Flow..."
echo ""

# Test 1: Landing page
echo "1️⃣ Testing landing page (/)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
if [ "$STATUS" == "200" ]; then
    echo "✅ Landing page accessible"
else
    echo "❌ Landing page failed: HTTP $STATUS"
fi

# Test 2: Paradise page
echo ""
echo "2️⃣ Testing paradise page (/xr/paradise)..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/xr/paradise)
if [ "$STATUS" == "200" ]; then
    echo "✅ Paradise page accessible"
else
    echo "❌ Paradise page failed: HTTP $STATUS"
fi

# Test 3: Check if paradise.html contains expected content
echo ""
echo "3️⃣ Testing paradise content..."
CONTENT=$(curl -s http://localhost:3000/xr/paradise | grep -o "Load Paradise" | head -1)
if [ "$CONTENT" == "Load Paradise" ]; then
    echo "✅ Paradise page contains 'Load Paradise' button"
else
    echo "❌ Paradise page missing expected content"
fi

# Test 4: Check xr-scene.js is accessible
echo ""
echo "4️⃣ Testing xr-scene.js..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/js/xr-scene.js)
if [ "$STATUS" == "200" ]; then
    echo "✅ xr-scene.js accessible"
else
    echo "❌ xr-scene.js failed: HTTP $STATUS"
fi

echo ""
echo "🎉 Navigation flow tests complete!"
