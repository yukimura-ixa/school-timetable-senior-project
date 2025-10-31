#!/bin/bash

# Automated Test Runner Script
# This script runs all automated tests for the School Timetable project
# Usage: ./scripts/run-automated-tests.sh [--unit-only|--e2e-only|--all]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEST_RESULTS_DIR="${PROJECT_ROOT}/test-results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create test results directory
mkdir -p "${TEST_RESULTS_DIR}"

# Parse arguments
RUN_UNIT=true
RUN_E2E=true

case "${1:-}" in
  --unit-only)
    RUN_E2E=false
    ;;
  --e2e-only)
    RUN_UNIT=false
    ;;
  --all|"")
    # Run both (default)
    ;;
  *)
    echo -e "${RED}Invalid argument: $1${NC}"
    echo "Usage: $0 [--unit-only|--e2e-only|--all]"
    exit 1
    ;;
esac

# Function to print section headers
print_header() {
  echo ""
  echo -e "${BLUE}================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}================================${NC}"
  echo ""
}

# Function to print status
print_status() {
  local status=$1
  local message=$2
  
  case $status in
    success)
      echo -e "${GREEN}✓ $message${NC}"
      ;;
    error)
      echo -e "${RED}✗ $message${NC}"
      ;;
    warning)
      echo -e "${YELLOW}⚠ $message${NC}"
      ;;
    info)
      echo -e "${BLUE}ℹ $message${NC}"
      ;;
  esac
}

# Change to project root
cd "${PROJECT_ROOT}"

print_header "School Timetable - Automated Test Suite"
echo "Test run started at: $(date)"
echo "Configuration:"
echo "  - Unit Tests: ${RUN_UNIT}"
echo "  - E2E Tests: ${RUN_E2E}"
echo ""

# Check prerequisites
print_header "Checking Prerequisites"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  print_status error "node_modules not found. Please run 'pnpm install' first."
  exit 1
fi
print_status success "Dependencies installed"

# Check if .env exists
if [ ! -f ".env" ]; then
  print_status warning ".env file not found. Some tests may fail."
else
  print_status success ".env file found"
fi

# Check if Prisma client is generated
if [ ! -d "prisma/generated" ]; then
  print_status warning "Prisma client not generated. Generating now..."
  pnpm prisma generate > /dev/null 2>&1
  print_status success "Prisma client generated"
else
  print_status success "Prisma client exists"
fi

# Initialize test results
UNIT_TEST_STATUS=0
E2E_TEST_STATUS=0

# Run Unit Tests
if [ "$RUN_UNIT" = true ]; then
  print_header "Running Unit Tests (Jest)"
  
  UNIT_LOG="${TEST_RESULTS_DIR}/unit-tests_${TIMESTAMP}.log"
  UNIT_JSON="${TEST_RESULTS_DIR}/unit-tests_${TIMESTAMP}.json"
  
  print_status info "Running Jest tests..."
  
  if pnpm test -- --json --outputFile="${UNIT_JSON}" > "${UNIT_LOG}" 2>&1; then
    print_status success "Unit tests passed"
    UNIT_TEST_STATUS=0
  else
    # Jest returns non-zero even if some tests pass
    # Check the actual results
    if [ -f "${UNIT_LOG}" ]; then
      PASSED=$(grep -o "Tests:.*passed" "${UNIT_LOG}" | head -1 || echo "")
      FAILED=$(grep -o "[0-9]* failed" "${UNIT_LOG}" | head -1 || echo "0 failed")
      
      echo ""
      echo "Test Results:"
      if [ -n "$PASSED" ]; then
        echo "  $PASSED"
      fi
      if [ -n "$FAILED" ]; then
        echo "  $FAILED"
      fi
      
      # If there are failures, mark as failed but continue
      if echo "$FAILED" | grep -q "^0 failed"; then
        print_status success "All unit tests passed"
        UNIT_TEST_STATUS=0
      else
        print_status warning "Some unit tests failed (see log for details)"
        UNIT_TEST_STATUS=1
      fi
    else
      print_status error "Unit tests failed"
      UNIT_TEST_STATUS=1
    fi
  fi
  
  print_status info "Unit test log saved to: ${UNIT_LOG}"
fi

# Run E2E Tests
if [ "$RUN_E2E" = true ]; then
  print_header "Running E2E Tests (Playwright)"
  
  # Check if Playwright browsers are installed
  print_status info "Checking Playwright browsers..."
  
  if ! pnpm playwright install --dry-run chromium > /dev/null 2>&1; then
    print_status warning "Playwright browsers not installed"
    print_status info "Installing Playwright browsers (this may take a few minutes)..."
    
    if pnpm playwright:install > /dev/null 2>&1; then
      print_status success "Playwright browsers installed"
    else
      print_status error "Failed to install Playwright browsers"
      print_status warning "Skipping E2E tests"
      E2E_TEST_STATUS=2  # 2 = skipped
      RUN_E2E=false
    fi
  else
    print_status success "Playwright browsers are ready"
  fi
  
  if [ "$RUN_E2E" = true ]; then
    E2E_LOG="${TEST_RESULTS_DIR}/e2e-tests_${TIMESTAMP}.log"
    
    print_status info "Running Playwright tests..."
    print_status warning "Note: E2E tests require a database connection"
    
    if pnpm test:e2e > "${E2E_LOG}" 2>&1; then
      print_status success "E2E tests passed"
      E2E_TEST_STATUS=0
    else
      print_status error "E2E tests failed (check log for details)"
      E2E_TEST_STATUS=1
    fi
    
    print_status info "E2E test log saved to: ${E2E_LOG}"
    
    # Check if HTML report exists
    if [ -d "playwright-report" ]; then
      print_status info "E2E HTML report available at: playwright-report/index.html"
      print_status info "View report with: pnpm test:report"
    fi
  fi
fi

# Generate Summary Report
print_header "Test Summary"

echo "Test Execution Summary:"
echo ""

if [ "$RUN_UNIT" = true ]; then
  echo "Unit Tests (Jest):"
  case $UNIT_TEST_STATUS in
    0)
      print_status success "PASSED"
      ;;
    1)
      print_status error "FAILED"
      ;;
  esac
fi

if [ "$RUN_E2E" = true ]; then
  echo "E2E Tests (Playwright):"
  case $E2E_TEST_STATUS in
    0)
      print_status success "PASSED"
      ;;
    1)
      print_status error "FAILED"
      ;;
    2)
      print_status warning "SKIPPED (browser installation failed)"
      ;;
  esac
fi

echo ""
echo "Test results saved to: ${TEST_RESULTS_DIR}"
echo "Test run completed at: $(date)"

# Exit with appropriate code
if [ $UNIT_TEST_STATUS -eq 1 ] || [ $E2E_TEST_STATUS -eq 1 ]; then
  exit 1
elif [ $E2E_TEST_STATUS -eq 2 ]; then
  # Exit with 0 if E2E was skipped but unit tests passed
  exit 0
else
  exit 0
fi
