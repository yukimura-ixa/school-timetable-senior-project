#!/bin/bash#!/usr/bin/env bash

# Script to run E2E tests with proper environment setup# Cross-platform E2E test runner for Unix-like systems (Linux, macOS, WSL)

# This ensures the dev server uses .env.test for auth bypass# Usage: ./scripts/run-e2e-tests.sh [playwright-args]



set -eset -e



echo "🔧 E2E Test Runner: Setting up test environment..."# Color codes

echo ""CYAN='\033[0;36m'

GREEN='\033[0;32m'

# 1. Check if dev server is running on port 3000YELLOW='\033[1;33m'

if netstat -ano | grep -q ":3000"; thenRED='\033[0;31m'

  echo "⚠️  Dev server is already running on port 3000"GRAY='\033[0;90m'

  echo "   Please stop it first to run E2E tests with test environment"NC='\033[0m' # No Color

  echo ""

  echo "   Run: taskkill /F /PID <pid>"# Configuration

  echo "   Or press Ctrl+C in the dev server terminal"AUTO_MANAGE=${AUTO_MANAGE_TEST_DB:-true}

  exit 1SKIP_CLEANUP=${SKIP_DB_CLEANUP:-false}

fiDB_STARTED=false

EXIT_CODE=0

# 2. Load .env.test and start dev server in background

echo "🚀 Starting Next.js dev server with .env.test..."# Functions

# Export env vars from .env.testlog_info() {

export $(cat .env.test | grep -v '^#' | xargs)    echo -e "${CYAN}$1${NC}"

}

# Start dev server in background

pnpm dev &log_success() {

DEV_SERVER_PID=$!    echo -e "${GREEN}$1${NC}"

}

echo "   Dev server PID: $DEV_SERVER_PID"

echo ""log_warning() {

    echo -e "${YELLOW}$1${NC}"

# 3. Wait for dev server to be ready}

echo "⏳ Waiting for dev server to be ready..."

MAX_ATTEMPTS=30log_error() {

attempt=0    echo -e "${RED}$1${NC}"

}

while [ $attempt -lt $MAX_ATTEMPTS ]; do

  if curl -s http://localhost:3000 > /dev/null; thenlog_gray() {

    echo "✅ Dev server is ready!"    echo -e "${GRAY}$1${NC}"

    echo ""}

    break

  fiis_docker_available() {

      command -v docker >/dev/null 2>&1

  attempt=$((attempt + 1))}

  if [ $((attempt % 5)) -eq 0 ]; then

    echo "   Still waiting... ($attempt/$MAX_ATTEMPTS)"is_database_running() {

  fi    docker ps --filter "name=timetable-test-db" --format "{{.Status}}" 2>/dev/null | grep -q "^Up"

  sleep 1}

done

wait_for_database() {

if [ $attempt -eq $MAX_ATTEMPTS ]; then    local max_attempts=30

  echo "❌ Dev server failed to start within timeout"    local attempt=0

  kill $DEV_SERVER_PID 2>/dev/null || true    

  exit 1    log_warning "⏳ Waiting for database to be ready..."

fi    

    while [ $attempt -lt $max_attempts ]; do

# 4. Run E2E tests        if docker exec timetable-test-db pg_isready -U test_user >/dev/null 2>&1; then

echo "🧪 Running Playwright E2E tests..."            log_success "✅ Database is ready!"

echo ""            echo ""

            return 0

pnpm exec playwright test "$@"        fi

TEST_EXIT_CODE=$?        

        attempt=$((attempt + 1))

# 5. Cleanup: stop dev server        sleep 1

echo ""        

echo "🧹 Cleaning up: Stopping dev server..."        if [ $((attempt % 5)) -eq 0 ]; then

kill $DEV_SERVER_PID 2>/dev/null || true            log_gray "   Still waiting... ($attempt/$max_attempts)"

        fi

exit $TEST_EXIT_CODE    done

    
    log_error "❌ Database failed to start within timeout"
    return 1
}

start_database() {
    log_info "🐘 Starting test database container..."
    
    if docker compose -f docker-compose.test.yml up -d; then
        if wait_for_database; then
            DB_STARTED=true
            return 0
        fi
    fi
    
    log_error "❌ Failed to start database"
    return 1
}

stop_database() {
    log_info "🛑 Stopping test database..."
    
    if docker compose -f docker-compose.test.yml down; then
        log_success "✅ Test database stopped"
        echo ""
    else
        log_warning "⚠️  Failed to stop database"
    fi
}

cleanup() {
    if [ "$DB_STARTED" = true ] && [ "$SKIP_CLEANUP" != "true" ]; then
        stop_database
    elif [ "$DB_STARTED" = true ]; then
        echo ""
        log_gray "ℹ️  Keeping database running (SKIP_DB_CLEANUP=true)"
        log_gray "   Stop manually with: docker compose -f docker-compose.test.yml down"
        echo ""
    fi
}

# Trap exit to ensure cleanup
trap cleanup EXIT

# Main script
main() {
    echo ""
    log_info "🚀 E2E Test Runner with Automatic Database Management"
    echo ""
    
    # Check Docker availability
    if ! is_docker_available; then
        log_warning "⚠️  Docker not available"
        log_gray "ℹ️  Assuming external database management"
        echo ""
    elif [ "$AUTO_MANAGE" = "false" ]; then
        log_gray "ℹ️  Automatic database management disabled"
        log_gray "   (AUTO_MANAGE_TEST_DB=false)"
        echo ""
    else
        # Check if database is already running
        if is_database_running; then
            log_gray "ℹ️  Test database is already running"
            log_gray "   Reusing existing instance"
            echo ""
        else
            # Start database
            if ! start_database; then
                log_error "❌ Cannot proceed without database"
                echo ""
                exit 1
            fi
        fi
    fi
    
    # Run Playwright tests
    log_info "🎭 Starting Playwright tests..."
    echo ""
    
    if pnpm exec playwright test "$@"; then
        EXIT_CODE=0
        echo ""
        log_success "✅ All tests passed!"
        echo ""
    else
        EXIT_CODE=$?
        echo ""
        log_warning "⚠️  Tests completed with exit code: $EXIT_CODE"
        echo ""
    fi
    
    return $EXIT_CODE
}

# Run main function with all arguments
main "$@"
exit $?
