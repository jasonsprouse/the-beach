#!/bin/bash

# Vercel Deployment Setup Script
# This script helps you configure GitHub Secrets for automated Vercel deployment

set -e

echo "🔐 Vercel Deployment - GitHub Secrets Setup"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    echo ""
    echo "Or use manual setup instructions below"
    exit 1
fi

# Check if user is authenticated with GitHub CLI
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated with GitHub CLI${NC}"
    echo "Running: gh auth login"
    gh auth login
fi

echo -e "${GREEN}✅ GitHub CLI ready${NC}"
echo ""

# Get repository information
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📦 Repository: $REPO"
echo ""

# Function to set a secret
set_secret() {
    local secret_name=$1
    local secret_value=$2
    local description=$3
    
    echo -e "${YELLOW}Setting secret: $secret_name${NC}"
    echo "$secret_value" | gh secret set "$secret_name"
    echo -e "${GREEN}✅ $secret_name set${NC}"
    echo ""
}

# Function to prompt for secret
prompt_secret() {
    local secret_name=$1
    local description=$2
    local default_value=$3
    
    echo -e "${YELLOW}🔑 $secret_name${NC}"
    echo "   $description"
    
    if [ -n "$default_value" ]; then
        read -p "   Enter value (or press Enter for default): " secret_value
        secret_value=${secret_value:-$default_value}
    else
        read -s -p "   Enter value: " secret_value
        echo ""
    fi
    
    set_secret "$secret_name" "$secret_value" "$description"
}

echo "📝 You'll need the following information:"
echo "   1. Vercel Token (from vercel.com/account/tokens)"
echo "   2. Vercel Project ID (from .vercel/project.json after 'vercel link')"
echo "   3. Vercel Org ID (from .vercel/project.json after 'vercel link')"
echo ""
read -p "Press Enter to continue..."
echo ""

# Step 1: Link project to Vercel (if not already linked)
if [ ! -d ".vercel" ]; then
    echo -e "${YELLOW}🔗 Linking project to Vercel...${NC}"
    echo "This will create .vercel/project.json with your IDs"
    
    if command -v vercel &> /dev/null; then
        vercel link
    else
        echo -e "${RED}❌ Vercel CLI not installed${NC}"
        echo "Install it: npm install -g vercel"
        exit 1
    fi
    echo ""
fi

# Step 2: Extract Vercel Project ID and Org ID
if [ -f ".vercel/project.json" ]; then
    VERCEL_PROJECT_ID=$(cat .vercel/project.json | grep projectId | cut -d '"' -f 4)
    VERCEL_ORG_ID=$(cat .vercel/project.json | grep orgId | cut -d '"' -f 4)
    
    echo -e "${GREEN}✅ Found Vercel configuration${NC}"
    echo "   Project ID: $VERCEL_PROJECT_ID"
    echo "   Org ID: $VERCEL_ORG_ID"
    echo ""
    
    set_secret "VERCEL_PROJECT_ID" "$VERCEL_PROJECT_ID" "Vercel Project ID"
    set_secret "VERCEL_ORG_ID" "$VERCEL_ORG_ID" "Vercel Organization ID"
else
    echo -e "${RED}❌ .vercel/project.json not found${NC}"
    echo "Run 'vercel link' first"
    exit 1
fi

# Step 3: Get Vercel Token
echo -e "${YELLOW}🔑 Vercel Token${NC}"
echo "   Create a token at: https://vercel.com/account/tokens"
echo "   Token should have deployment permissions"
echo ""
read -s -p "   Paste your Vercel token: " VERCEL_TOKEN
echo ""
set_secret "VERCEL_TOKEN" "$VERCEL_TOKEN" "Vercel Authentication Token"

# Step 4: Generate or input SESSION_SECRET
echo -e "${YELLOW}🔑 SESSION_SECRET${NC}"
echo "   This is used to sign session cookies"
echo ""
read -p "   Generate random secret? (Y/n): " generate_secret

if [[ $generate_secret =~ ^[Nn]$ ]]; then
    read -s -p "   Enter your session secret: " SESSION_SECRET
    echo ""
else
    SESSION_SECRET=$(openssl rand -base64 32)
    echo -e "${GREEN}   Generated: ${SESSION_SECRET:0:10}...${NC}"
fi

set_secret "SESSION_SECRET" "$SESSION_SECRET" "Session signing secret"

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ All secrets configured successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📋 Configured secrets:"
echo "   ✅ VERCEL_TOKEN"
echo "   ✅ VERCEL_PROJECT_ID"
echo "   ✅ VERCEL_ORG_ID"
echo "   ✅ SESSION_SECRET"
echo ""
echo -e "${YELLOW}⚠️  Next steps:${NC}"
echo "   1. Create Vercel KV database at: https://vercel.com/dashboard"
echo "      - Go to your project → Storage → Create Database → KV"
echo "      - Name it: the-beach-sessions"
echo "   2. Push code to trigger deployment:"
echo "      git push origin main"
echo ""
echo -e "${GREEN}🚀 GitHub Actions will now automatically deploy to Vercel!${NC}"
