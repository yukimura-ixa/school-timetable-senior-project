#!/bin/bash

# Context7 MCP Environment Test Script
# This script tests the MCP environment configuration

echo "=================================================="
echo "Context7 MCP Environment Test"
echo "=================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if MCP is enabled
echo "Test 1: MCP Infrastructure Status"
echo "--------------------------------------------------"
if [ "$COPILOT_MCP_ENABLED" = "true" ]; then
    echo -e "${GREEN}✓ MCP is ENABLED${NC}"
else
    echo -e "${RED}✗ MCP is NOT enabled${NC}"
fi

if [ -n "$COPILOT_AGENT_MCP_SERVER_TEMP" ]; then
    echo -e "${GREEN}✓ MCP Server Path: $COPILOT_AGENT_MCP_SERVER_TEMP${NC}"
else
    echo -e "${YELLOW}⚠ MCP Server Path not set${NC}"
fi
echo ""

# Test 2: Check Context7 API Key
echo "Test 2: Context7 API Key Status"
echo "--------------------------------------------------"
if [ -z "$COPILOT_MCP_CONTEXT7_API_KEY" ]; then
    echo -e "${YELLOW}⚠ Context7 API Key is NOT set${NC}"
    echo "  Variable name is registered but has no value"
    echo "  Expected format: ctx7sk..."
else
    KEY_LENGTH=${#COPILOT_MCP_CONTEXT7_API_KEY}
    echo -e "${GREEN}✓ Context7 API Key is set (length: $KEY_LENGTH)${NC}"
    if [[ $COPILOT_MCP_CONTEXT7_API_KEY == ctx7sk* ]]; then
        echo -e "${GREEN}✓ API Key format looks correct${NC}"
    else
        echo -e "${RED}✗ API Key format might be incorrect (should start with 'ctx7sk')${NC}"
    fi
fi
echo ""

# Test 3: Check injected secrets
echo "Test 3: Injected Secrets Configuration"
echo "--------------------------------------------------"
if [ -n "$COPILOT_AGENT_INJECTED_SECRET_NAMES" ]; then
    echo -e "${GREEN}✓ Injected Secrets: $COPILOT_AGENT_INJECTED_SECRET_NAMES${NC}"
else
    echo -e "${YELLOW}⚠ No injected secrets found${NC}"
fi
echo ""

# Test 4: Check current branch
echo "Test 4: Current Branch"
echo "--------------------------------------------------"
if [ -n "$COPILOT_AGENT_BRANCH_NAME" ]; then
    echo -e "${GREEN}✓ Branch: $COPILOT_AGENT_BRANCH_NAME${NC}"
else
    BRANCH=$(git branch --show-current 2>/dev/null)
    if [ -n "$BRANCH" ]; then
        echo -e "${GREEN}✓ Branch (from git): $BRANCH${NC}"
    else
        echo -e "${YELLOW}⚠ Branch not detected${NC}"
    fi
fi
echo ""

# Test 5: Check project dependencies
echo "Test 5: Project Dependencies (from package.json)"
echo "--------------------------------------------------"
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓ package.json found${NC}"
    
    # Extract key dependencies
    if command -v jq &> /dev/null; then
        echo ""
        echo "Key Dependencies:"
        echo "  Next.js: $(jq -r '.dependencies.next // "not found"' package.json)"
        echo "  React: $(jq -r '.dependencies.react // "not found"' package.json)"
        echo "  Prisma: $(jq -r '.dependencies["@prisma/client"] // "not found"' package.json)"
        echo "  NextAuth: $(jq -r '.dependencies["next-auth"] // "not found"' package.json)"
    else
        echo "  (jq not installed, skipping version extraction)"
    fi
else
    echo -e "${RED}✗ package.json not found${NC}"
fi
echo ""

# Summary
echo "=================================================="
echo "Summary"
echo "=================================================="
if [ "$COPILOT_MCP_ENABLED" = "true" ] && [ -z "$COPILOT_MCP_CONTEXT7_API_KEY" ]; then
    echo -e "${YELLOW}Status: MCP Infrastructure Ready, Context7 API Key Required${NC}"
    echo ""
    echo "Action Required:"
    echo "  1. Obtain a Context7 API key (starts with 'ctx7sk')"
    echo "  2. Set the COPILOT_MCP_CONTEXT7_API_KEY environment variable"
    echo "  3. Restart the agent environment"
elif [ "$COPILOT_MCP_ENABLED" = "true" ] && [ -n "$COPILOT_MCP_CONTEXT7_API_KEY" ]; then
    echo -e "${GREEN}Status: Fully Configured and Ready${NC}"
else
    echo -e "${RED}Status: MCP Not Properly Configured${NC}"
fi
echo "=================================================="
