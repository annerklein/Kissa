#!/usr/bin/with-contenv bashio
# Kissa Coffee Tracker - Home Assistant Add-on Startup Script
# Supports cross-architecture builds (x86 -> ARM)

set -e

# Configuration
CONFIG_PATH=/config/kissa
DB_PATH="${CONFIG_PATH}/kissa.db"
LOG_LEVEL=$(bashio::config 'log_level')

bashio::log.info "=========================================="
bashio::log.info "Starting Kissa Coffee Tracker..."
bashio::log.info "=========================================="
bashio::log.info "Log level: ${LOG_LEVEL}"

# Create config directory if it doesn't exist
mkdir -p "${CONFIG_PATH}"

# Set environment variables
export DATABASE_URL="file:${DB_PATH}"
export NODE_ENV=production
export PORT=3001
export HOST=0.0.0.0

cd /app/apps/api

# CRITICAL: Regenerate Prisma client for current architecture
# This ensures ARM binary is generated when running on RPi even if built on x86
bashio::log.info "[1/5] Regenerating Prisma client for current architecture..."
npx prisma generate

# Run database migrations
bashio::log.info "[2/5] Running database migrations..."
npx prisma migrate deploy

# Check if this is first run OR if methods are missing and seed the database
METHODS_COUNT=$(sqlite3 "${DB_PATH}" "SELECT COUNT(*) FROM Method;" 2>/dev/null || echo "0")
bashio::log.info "Current methods in database: ${METHODS_COUNT}"

if [ ! -f "${CONFIG_PATH}/.seeded" ] || [ "${METHODS_COUNT}" -lt "1" ]; then
    bashio::log.info "[3/5] Seeding database with default methods and settings..."
    npx tsx prisma/seed.ts
    touch "${CONFIG_PATH}/.seeded"
    
    # Verify seeding worked
    METHODS_COUNT=$(sqlite3 "${DB_PATH}" "SELECT COUNT(*) FROM Method;" 2>/dev/null || echo "0")
    bashio::log.info "Methods after seeding: ${METHODS_COUNT}"
    
    if [ "${METHODS_COUNT}" -lt "1" ]; then
        bashio::log.warning "WARNING: No methods found after seeding! Recipes may not work properly."
    fi
else
    bashio::log.info "[3/5] Database already seeded, skipping..."
fi

# Start API server in background
bashio::log.info "[4/5] Starting API server on port 3001..."
node /app/apps/api/dist/index.js &
API_PID=$!

# Wait for API to be ready
bashio::log.info "Waiting for API to be ready..."
for i in $(seq 1 30); do
    if curl -sf http://localhost:3001/health > /dev/null 2>&1; then
        bashio::log.info "API is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        bashio::log.error "API failed to start within 30 seconds"
        exit 1
    fi
    sleep 1
done

# Start Web server
bashio::log.info "[5/5] Starting Web server on port 3000..."
cd /app/apps/web
exec pnpm start
