#!/bin/bash
#
# Kissa Agent Automation: Run Full Test Suite
# Runs all API integration tests via Vitest.
#
# Usage: ./scripts/run-tests.sh
#
# Exit codes:
#   0 = all tests passed
#   1 = test failures
#

set -e

cd "$(dirname "$0")/.."

echo "=== Running Kissa API Test Suite ==="
echo ""

pnpm --filter @kissa/api test

echo ""
echo "=== Test suite complete ==="
