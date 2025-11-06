#!/bin/bash

# Biometric Payment System - Demo Launcher
# Opens all demo pages in your browser

echo "🔐 Biometric Payment System - Demo Launcher"
echo "==========================================="
echo ""

# Check if server is running
if ! lsof -ti:3000 > /dev/null 2>&1; then
    echo "❌ Server not running on port 3000"
    echo "   Please start the server first: npm run start:dev"
    exit 1
fi

echo "✅ Server is running on http://localhost:3000"
echo ""
echo "Opening demo pages..."
echo ""

# Detect OS and open browser accordingly
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    BROWSER="xdg-open"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    BROWSER="open"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    BROWSER="start"
else
    echo "❌ Unsupported OS: $OSTYPE"
    echo "   Please open the URLs manually:"
    BROWSER="echo"
fi

# Demo pages
PAGES=(
    "http://localhost:3000"
    "http://localhost:3000/biometric-landing.html"
    "http://localhost:3000/biometric-payment-demo.html"
    "http://localhost:3000/webauthn-wallet-demo.html"
)

TITLES=(
    "🏠 Main App (with demo links)"
    "🚀 Marketing Landing Page"
    "💳 Interactive Payment Demo"
    "📱 WebAuthn Wallet Demo"
)

for i in "${!PAGES[@]}"; do
    echo "${TITLES[$i]}"
    echo "   ${PAGES[$i]}"
    $BROWSER "${PAGES[$i]}" 2>/dev/null &
    sleep 1
done

echo ""
echo "==========================================="
echo "✅ Demo pages opened!"
echo ""
echo "📚 Documentation:"
echo "   - BIOMETRIC_PAYMENT_MONETIZATION.md (15K words strategy)"
echo "   - BIOMETRIC_PAYMENT_INTEGRATION_GUIDE.md (15K words technical)"
echo "   - BIOMETRIC_PAYMENT_IMPLEMENTATION_SUMMARY.md"
echo "   - BIOMETRIC_PAYMENT_QUICKREF.md"
echo ""
echo "🎯 Features:"
echo "   ✓ WebAuthn (Touch ID, Face ID, Windows Hello)"
echo "   ✓ Payment Request API (Google Pay, Apple Pay)"
echo "   ✓ VR Spatial Biometric (gaze + hand tracking)"
echo "   ✓ Tiered security (LOW → ENTERPRISE)"
echo "   ✓ 12 monetization touchpoints"
echo "   ✓ \$147K Year 1 revenue potential"
echo ""
echo "🔗 API Endpoints:"
echo "   POST /payments/biometric-purchase"
echo "   POST /payments/subscription"
echo "   POST /payments/escrow"
echo "   POST /biometric/verify"
echo ""
echo "Press Ctrl+C to close this script (demos will stay open)"
wait
