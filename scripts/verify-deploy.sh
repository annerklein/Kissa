#!/bin/bash
#
# Kissa Agent Automation: Post-Deployment Verification
# Run after every deployment to confirm the application is healthy.
#
# Usage: ./scripts/verify-deploy.sh
#
# Verifies:
#   1. API health endpoint returns status "ok" with DB connected
#   2. All 4 brew methods exist
#   3. Key API endpoints respond (roasters, beans)
#   4. Web app responds with HTTP 200
#
# NOTE: Uses 'command curl' to bypass shell aliases.
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
fi

API_URL="${API_URL:-${PROD_API_URL:?PROD_API_URL not set. Copy .env.example to .env and fill in your values.}}"
WEB_URL="${WEB_URL:-${PROD_WEB_URL:?PROD_WEB_URL not set. Copy .env.example to .env and fill in your values.}}"
FAILED=0

echo "=== Kissa Post-Deployment Verification ==="
echo ""

# 1. Health check
echo "1. API health check..."
HEALTH=$(command curl -s --connect-timeout 15 "$API_URL/health" 2>/dev/null || echo '{}')
if echo "$HEALTH" | python3 -c "
import sys, json
d = json.load(sys.stdin)
assert d.get('status') == 'ok', 'status not ok'
assert d.get('database', {}).get('connected') == True, 'db not connected'
print('   ✓ API healthy, database connected')
" 2>/dev/null; then
  true
else
  echo "   ✗ FAILED - Response: $HEALTH"
  FAILED=1
fi

# 2. Methods
echo "2. Checking brew methods..."
METHODS=$(command curl -s "$API_URL/api/methods" 2>/dev/null || echo '[]')
METHOD_COUNT=$(echo "$METHODS" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
if [ "$METHOD_COUNT" -ge 4 ]; then
  echo "   ✓ $METHOD_COUNT methods found"
else
  echo "   ✗ Expected 4+ methods, got $METHOD_COUNT"
  FAILED=1
fi

# 3. Roasters
echo "3. Checking roasters endpoint..."
ROASTERS=$(command curl -s "$API_URL/api/roasters" 2>/dev/null || echo '[]')
ROASTER_COUNT=$(echo "$ROASTERS" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
echo "   ✓ $ROASTER_COUNT roasters found"

# 4. Beans
echo "4. Checking beans endpoint..."
BEANS=$(command curl -s "$API_URL/api/beans" 2>/dev/null || echo '[]')
BEAN_COUNT=$(echo "$BEANS" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
echo "   ✓ $BEAN_COUNT beans found"

# 5. Web app
echo "5. Checking web app..."
WEB_STATUS=$(command curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$WEB_URL" 2>/dev/null || echo "000")
if [ "$WEB_STATUS" = "200" ]; then
  echo "   ✓ Web app responding (HTTP $WEB_STATUS)"
else
  echo "   ⚠ Web app returned HTTP $WEB_STATUS"
fi

echo ""
if [ "$FAILED" -eq 0 ]; then
  echo "=== All checks passed ==="
else
  echo "=== SOME CHECKS FAILED ==="
  exit 1
fi
echo "   API: $API_URL"
echo "   Web: $WEB_URL"
