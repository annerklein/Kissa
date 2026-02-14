#!/bin/sh
set -e

echo "=========================================="
echo "Starting Kissa API..."
echo "=========================================="

# Prisma client is pre-generated for the target architecture at build time
# (images are built locally with --platform linux/arm64)

# Add pnpm binaries to PATH so prisma CLI is available
export PATH="/app/node_modules/.bin:/app/apps/api/node_modules/.bin:$PATH"

echo "[1/3] Running database migrations..."
prisma migrate deploy

echo "[2/3] Seeding database with default methods..."
node prisma/seed.mjs

# Verify seeding worked
echo "[3/3] Verifying database..."
DB_PATH="${DATABASE_URL#file:}"
METHODS_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM Method;" 2>/dev/null || echo "0")
echo "Found $METHODS_COUNT brewing methods in database."

if [ "$METHODS_COUNT" -lt "1" ]; then
    echo "WARNING: No methods found! Attempting to seed again..."
    node prisma/seed.mjs
fi

echo "Starting API server..."
exec node dist/index.js
