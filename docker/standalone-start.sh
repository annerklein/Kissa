#!/bin/sh

echo "=========================================="
echo "Starting Kissa Coffee Tracker..."
echo "=========================================="

cd /app/apps/api
export PATH="/app/node_modules/.pnpm/node_modules/.bin:$PATH"

# CRITICAL: Regenerate Prisma client for current architecture
# This ensures ARM binary is generated when running on RPi even if built on x86
echo "[1/4] Regenerating Prisma client for current architecture..."
npx prisma generate || { echo "ERROR: Prisma generate failed"; }

echo "[2/4] Running database migrations..."
npx prisma migrate deploy || { echo "WARNING: Migration failed, continuing..."; }

echo "[3/4] Seeding database with default methods and settings..."
npx tsx prisma/seed.ts || { echo "WARNING: Seeding failed, continuing..."; }

echo "[4/4] Starting servers..."

# Start API server in background - use node with compiled dist if tsx fails
echo "Starting API server on port 3001..."
npx tsx src/index.ts &
API_PID=$!

# Wait for API to be ready (max 60 seconds for ARM startup)
echo "Waiting for API to be ready..."
READY=0
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60; do
    if curl -sf http://localhost:3001/health > /dev/null 2>&1; then
        echo "API is ready after $i seconds!"
        READY=1
        break
    fi
    # Check if API process is still running
    if ! kill -0 $API_PID 2>/dev/null; then
        echo "ERROR: API process died! Check logs above for errors."
        # Try to restart with node instead
        echo "Attempting to start API with node dist/index.js..."
        node dist/index.js &
        API_PID=$!
        sleep 5
    fi
    sleep 1
done

if [ "$READY" = "0" ]; then
    echo "WARNING: API may not be fully ready, but continuing with web server..."
fi

echo "Starting Web server on port 3000..."
cd /app/apps/web
exec npx next start -p 3000
