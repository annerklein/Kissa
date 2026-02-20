#!/bin/bash
# Kissa Coffee App - Raspberry Pi Deployment Script
# Usage: ./scripts/deploy-rpi.sh <RPI_USER>@<RPI_IP>
# Example: ./scripts/deploy-rpi.sh pi@192.168.1.100

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

RPI_TARGET="${1:-pi@raspberrypi.local}"
REMOTE_DIR="/home/$(echo $RPI_TARGET | cut -d@ -f1)/kissa"

echo "🚀 Deploying Kissa to $RPI_TARGET..."

# Sync files to RPi (excluding unnecessary files)
echo "📦 Syncing files..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude '*.db' \
  --exclude 'apps/mobile' \
  --exclude '.cursor' \
  --exclude '.env.local' \
  "$PROJECT_ROOT/" "$RPI_TARGET:$REMOTE_DIR/"

# Run deployment commands on RPi
echo "🐳 Building and starting containers on RPi..."
ssh "$RPI_TARGET" << 'EOF'
  cd ~/kissa/docker
  
  # Stop existing containers if running
  docker compose down 2>/dev/null || true
  
  # Build and start in detached mode
  docker compose up -d --build
  
  # Show status
  echo ""
  echo "✅ Deployment complete!"
  echo ""
  docker compose ps
  echo ""
  echo "🌐 Access your app at:"
  echo "   Web UI: http://$(hostname -I | awk '{print $1}'):3000"
  echo "   API:    http://$(hostname -I | awk '{print $1}'):3001"
EOF

echo ""
echo "🎉 Done! Your Kissa app is now running on the Raspberry Pi."
