#!/bin/bash

echo "================================"
echo "📦 Pre-Publish Verification"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAILED=0

# Function to print status
check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        FAILED=1
    fi
}

# 1. Check if dist/ exists
echo "1. Checking build artifacts..."
if [ -d "dist" ] && [ -f "dist/index.js" ] && [ -f "dist/cli.js" ]; then
    check_status 0 "Build artifacts exist"
else
    check_status 1 "Build artifacts missing - run 'npm run build'"
fi
echo ""

# 2. Run linting
echo "2. Running linter..."
npm run lint > /dev/null 2>&1
check_status $? "Linting passed"
echo ""

# 3. Run tests
echo "3. Running tests..."
npm test > /dev/null 2>&1
check_status $? "Tests passed"
echo ""

# 4. Check package.json required fields
echo "4. Checking package.json..."

# Check name
NAME=$(node -p "require('./package.json').name")
if [ -n "$NAME" ]; then
    check_status 0 "Package name: $NAME"
else
    check_status 1 "Package name missing"
fi

# Check version
VERSION=$(node -p "require('./package.json').version")
if [ -n "$VERSION" ]; then
    check_status 0 "Version: $VERSION"
else
    check_status 1 "Version missing"
fi

# Check description
DESCRIPTION=$(node -p "require('./package.json').description")
if [ -n "$DESCRIPTION" ] && [ "$DESCRIPTION" != "undefined" ]; then
    check_status 0 "Description exists"
else
    check_status 1 "Description missing"
fi

# Check license
LICENSE=$(node -p "require('./package.json').license")
if [ -n "$LICENSE" ] && [ "$LICENSE" != "undefined" ]; then
    check_status 0 "License: $LICENSE"
else
    check_status 1 "License missing"
fi

# Check repository
REPO=$(node -p "require('./package.json').repository?.url || 'undefined'")
if [ -n "$REPO" ] && [ "$REPO" != "undefined" ]; then
    check_status 0 "Repository configured"
else
    check_status 1 "Repository missing"
fi
echo ""

# 5. Check for README
echo "5. Checking documentation..."
if [ -f "README.md" ]; then
    check_status 0 "README.md exists"
else
    check_status 1 "README.md missing"
fi

if [ -f "LICENSE" ]; then
    check_status 0 "LICENSE file exists"
else
    check_status 1 "LICENSE file missing"
fi
echo ""

# 6. Check git status
echo "6. Checking git status..."
if git diff-index --quiet HEAD --; then
    check_status 0 "No uncommitted changes"
else
    check_status 1 "You have uncommitted changes"
fi
echo ""

# 7. Test CLI
echo "7. Testing CLI..."
if [ -f "dist/cli.js" ]; then
    node dist/cli.js --version > /dev/null 2>&1
    check_status $? "CLI runs successfully"
else
    check_status 1 "CLI file missing"
fi
echo ""

# 8. Size check
echo "8. Package size check..."
SIZE=$(npm pack --dry-run 2>&1 | grep "package size" | awk '{print $4, $5}')
if [ -n "$SIZE" ]; then
    echo -e "${GREEN}✓${NC} Package size: $SIZE"
else
    echo -e "${YELLOW}⚠${NC} Could not determine package size"
fi
echo ""

# Final summary
echo "================================"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Ready to publish! Run:"
    echo "  npm publish --access public --dry-run  # Test first"
    echo "  npm publish --access public            # Actual publish"
else
    echo -e "${RED}✗ Some checks failed!${NC}"
    echo ""
    echo "Please fix the issues above before publishing."
    exit 1
fi
echo "================================"
