#!/bin/bash
#
# Kissa Agent Automation: Daily Database Backup
# Ensures a local backup of the production database exists for today.
#
# Usage: ./scripts/backup.sh
#
# Exit codes:
#   0 = backup exists (created or already existed)
#   1 = all backup methods failed
#
# NOTE: Uses 'command curl' to bypass shell aliases that may interfere.
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
fi

BACKUP_DIR="backups"
TODAY=$(date +%Y-%m-%d)
BACKUP_FILE="$BACKUP_DIR/kissa-backup-$TODAY.db"
PROD_URL="${PROD_API_URL:-http://localhost:3001}/internal/backup/db"
DEV_URL="http://localhost:3001/internal/backup/db"
RPI_HOST="${RPI_HOST:?RPI_HOST not set. Copy .env.example to .env and fill in your values.}"
RPI_USER="${RPI_USER:?RPI_USER not set. Copy .env.example to .env and fill in your values.}"

# Check if today's backup already exists
if [ -f "$BACKUP_FILE" ]; then
  SIZE=$(wc -c < "$BACKUP_FILE" | tr -d ' ')
  if [ "$SIZE" -gt 0 ]; then
    echo "✓ Today's backup already exists: $BACKUP_FILE ($SIZE bytes)"
    exit 0
  fi
fi

mkdir -p "$BACKUP_DIR"

# Attempt 1: Production server
echo "Downloading backup from production..."
if command curl -s --connect-timeout 15 --max-time 180 -o "$BACKUP_FILE" "$PROD_URL" 2>/dev/null; then
  SIZE=$(wc -c < "$BACKUP_FILE" | tr -d ' ')
  if [ "$SIZE" -gt 0 ]; then
    echo "✓ Backup saved: $BACKUP_FILE ($SIZE bytes)"
    exit 0
  fi
fi

# Attempt 2: Local dev server
echo "Production unreachable, trying local dev server..."
if command curl -s --connect-timeout 5 --max-time 30 -o "$BACKUP_FILE" "$DEV_URL" 2>/dev/null; then
  SIZE=$(wc -c < "$BACKUP_FILE" | tr -d ' ')
  if [ "$SIZE" -gt 0 ]; then
    echo "✓ Backup saved from dev: $BACKUP_FILE ($SIZE bytes)"
    exit 0
  fi
fi

# Attempt 3: Direct SSH copy from Docker container
echo "Both servers unreachable, trying direct SSH copy..."
if ssh "$RPI_USER@$RPI_HOST" 'sudo docker cp kissa-api:/app/data/kissa.db /tmp/kissa-backup.db' 2>/dev/null; then
  ssh "$RPI_USER@$RPI_HOST" 'cat /tmp/kissa-backup.db' > "$BACKUP_FILE" 2>/dev/null
  SIZE=$(wc -c < "$BACKUP_FILE" | tr -d ' ')
  if [ "$SIZE" -gt 0 ]; then
    echo "✓ Backup saved via SSH: $BACKUP_FILE ($SIZE bytes)"
    exit 0
  fi
fi

echo "✗ FAILED: Could not create backup. Check server connectivity."
rm -f "$BACKUP_FILE"
exit 1
