#!/usr/bin/with-contenv bashio
# Kissa Coffee Tracker - Home Assistant Add-on Startup Script

set -e

# Configuration
CONFIG_PATH=/config/kissa
DB_PATH="${CONFIG_PATH}/kissa.db"
LOG_LEVEL=$(bashio::config 'log_level')

bashio::log.info "Starting Kissa Coffee Tracker..."
bashio::log.info "Log level: ${LOG_LEVEL}"

# Create config directory if it doesn't exist
mkdir -p "${CONFIG_PATH}"

# Set environment variables
export DATABASE_URL="file:${DB_PATH}"
export NODE_ENV=production
export PORT=3001
export HOST=0.0.0.0

# Run database migrations
bashio::log.info "Running database migrations..."
cd /app/apps/api
npx prisma migrate deploy

# Check if this is first run and seed the database
if [ ! -f "${CONFIG_PATH}/.seeded" ]; then
    bashio::log.info "First run detected, seeding database..."
    npx tsx prisma/seed.ts
    touch "${CONFIG_PATH}/.seeded"
fi

# Start API server in background
bashio::log.info "Starting API server on port 3001..."
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
bashio::log.info "Starting Web server on port 3000..."
cd /app/apps/web
exec pnpm start
