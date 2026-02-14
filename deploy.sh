#!/bin/bash
#
# Kissa Coffee Tracker - Deployment Script
# Builds Docker images locally for ARM64, transfers to RPi, and starts containers.
#
# Usage: ./deploy.sh [options]
#   --rpi-host     RPi hostname/IP (from .env or flag)
#   --rpi-user     RPi SSH username (from .env or flag)
#   --rpi-pass     RPi SSH password (from .env or flag)
#   --skip-build   Skip Docker build (use existing local images)
#   --api-only     Only rebuild and deploy the API container
#   --web-only     Only rebuild and deploy the Web container
#   --clean        Remove old images on RPi after deploy (saves disk space)
#   --help         Show this help message
#

set -e

# =============================================================================
# Configuration (can be overridden via environment or flags)
# =============================================================================
RPI_HOST="${RPI_HOST:-<your-rpi-host>.local}"
RPI_USER="${RPI_USER:-<your-ssh-user>}"
RPI_PASS="${RPI_PASS:-<your-ssh-password>}"
SKIP_BUILD=false
API_ONLY=false
WEB_ONLY=false
CLEAN_DEPLOY=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    head -17 "$0" | tail -13
    exit 0
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --rpi-host)
                RPI_HOST="$2"
                shift 2
                ;;
            --rpi-user)
                RPI_USER="$2"
                shift 2
                ;;
            --rpi-pass)
                RPI_PASS="$2"
                shift 2
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --api-only)
                API_ONLY=true
                shift
                ;;
            --web-only)
                WEB_ONLY=true
                shift
                ;;
            --clean)
                CLEAN_DEPLOY=true
                shift
                ;;
            --help|-h)
                show_help
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                ;;
        esac
    done
}

# Execute command on RPi via SSH with password
ssh_cmd() {
    expect << EOF
set timeout 300
spawn ssh -o StrictHostKeyChecking=no ${RPI_USER}@${RPI_HOST} "$1"
expect {
    "password:" {
        send "${RPI_PASS}\r"
        exp_continue
    }
    eof
}
EOF
}

# Transfer a file to RPi via SSH pipe (scp doesn't work on HA OS)
transfer_file() {
    local local_file="$1"
    local remote_file="$2"
    expect << EOF
set timeout 600
spawn bash -c "cat ${local_file} | ssh -o StrictHostKeyChecking=no ${RPI_USER}@${RPI_HOST} 'cat > ${remote_file}'"
expect {
    "password:" {
        send "${RPI_PASS}\r"
        exp_continue
    }
    eof
}
EOF
}

# =============================================================================
# Deployment Steps
# =============================================================================

check_requirements() {
    log_info "Checking requirements..."
    
    local missing=()
    
    if ! command -v docker &> /dev/null; then
        missing+=("docker")
    fi
    
    if ! command -v expect &> /dev/null; then
        missing+=("expect")
    fi
    
    if [ ${#missing[@]} -gt 0 ]; then
        log_error "Missing required tools: ${missing[*]}"
        log_info "Install with: brew install ${missing[*]}"
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        log_warning "Docker is not running. Starting Colima..."
        if command -v colima &> /dev/null; then
            colima start --arch aarch64 --vm-type vz --vz-rosetta 2>/dev/null || true
        else
            log_error "Docker is not running and Colima is not installed."
            log_info "Start Docker Desktop or install Colima: brew install colima"
            exit 1
        fi
    fi
    
    log_success "All requirements satisfied"
}

check_rpi_connection() {
    log_info "Checking RPi connectivity at ${RPI_HOST}..."
    
    if ! ping -c 1 -W 2 "${RPI_HOST}" &> /dev/null; then
        log_error "Cannot reach RPi at ${RPI_HOST}"
        exit 1
    fi
    
    log_success "RPi is reachable"
}

build_images() {
    if [ "$SKIP_BUILD" = true ]; then
        log_info "Skipping build (--skip-build flag set)"
        return
    fi
    
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$SCRIPT_DIR"
    
    if [ "$WEB_ONLY" != true ]; then
        log_info "Building API image for ARM64..."
        docker build --platform linux/arm64 -f docker/api.Dockerfile -t kissa-api:latest .
        log_success "API image built"
    fi
    
    if [ "$API_ONLY" != true ]; then
        log_info "Building Web image for ARM64..."
        docker build --platform linux/arm64 -f docker/web.Dockerfile -t kissa-web:latest .
        log_success "Web image built"
    fi
}

save_and_transfer() {
    local images_to_save=""
    
    if [ "$WEB_ONLY" != true ]; then
        images_to_save="${images_to_save} kissa-api:latest"
    fi
    if [ "$API_ONLY" != true ]; then
        images_to_save="${images_to_save} kissa-web:latest"
    fi
    
    images_to_save=$(echo "$images_to_save" | xargs)  # trim whitespace
    
    log_info "Saving Docker image(s): ${images_to_save}..."
    local tmp_file="/tmp/kissa-images.tar.gz"
    docker save ${images_to_save} | gzip > "${tmp_file}"
    
    local size=$(ls -lh "${tmp_file}" | awk '{print $5}')
    log_info "Image archive size: ${size}"
    
    log_info "Transferring to RPi (this may take a minute)..."
    transfer_file "${tmp_file}" "/tmp/kissa-images.tar.gz"
    
    log_success "Images transferred"
}

deploy_on_rpi() {
    log_info "Deploying on RPi..."
    
    # Stop and remove existing containers
    if [ "$WEB_ONLY" != true ]; then
        log_info "Stopping API container..."
        ssh_cmd "sudo docker stop kissa-api 2>/dev/null; sudo docker rm kissa-api 2>/dev/null; echo done"
    fi
    if [ "$API_ONLY" != true ]; then
        log_info "Stopping Web container..."
        ssh_cmd "sudo docker stop kissa-web 2>/dev/null; sudo docker rm kissa-web 2>/dev/null; echo done"
    fi
    
    # Load the new images
    log_info "Loading Docker images on RPi..."
    ssh_cmd "sudo gunzip -c /tmp/kissa-images.tar.gz | sudo docker load"
    
    # Start containers
    if [ "$WEB_ONLY" != true ]; then
        log_info "Starting API container..."
        ssh_cmd "sudo docker run -d \
            --name kissa-api \
            --restart unless-stopped \
            -p 3001:3001 \
            -v kissa-data:/app/data \
            -e DATABASE_URL=file:/app/data/kissa.db \
            -e NODE_ENV=production \
            -e PORT=3001 \
            -e HOST=0.0.0.0 \
            kissa-api:latest"
    fi
    
    if [ "$API_ONLY" != true ]; then
        log_info "Starting Web container..."
        ssh_cmd "sudo docker run -d \
            --name kissa-web \
            --restart unless-stopped \
            -p 3000:3000 \
            -e NODE_ENV=production \
            kissa-web:latest"
    fi
    
    # Clean up old images if requested
    if [ "$CLEAN_DEPLOY" = true ]; then
        log_info "Cleaning up old images..."
        ssh_cmd "sudo docker image prune -f 2>/dev/null; echo done"
    fi
    
    # Clean up the transferred archive
    ssh_cmd "rm -f /tmp/kissa-images.tar.gz"
    
    log_success "Containers deployed"
}

wait_for_health() {
    log_info "Waiting for application to become healthy..."
    
    local max_attempts=30
    local attempt=1
    local wait_time=5
    
    while [ $attempt -le $max_attempts ]; do
        log_info "Health check attempt ${attempt}/${max_attempts}..."
        
        # Check API health
        if command curl -sf "http://${RPI_HOST}:3001/health" > /dev/null 2>&1; then
            log_success "API is healthy!"
            
            # Check Web server if we deployed it
            if [ "$API_ONLY" != true ]; then
                if command curl -sf "http://${RPI_HOST}:3000" > /dev/null 2>&1; then
                    log_success "Web is healthy!"
                    return 0
                fi
            else
                return 0
            fi
        fi
        
        sleep $wait_time
        ((attempt++))
    done
    
    log_error "Application failed to become healthy after $((max_attempts * wait_time)) seconds"
    log_info "Check logs: ssh ${RPI_USER}@${RPI_HOST} 'sudo docker logs kissa-api'"
    return 1
}

show_summary() {
    echo ""
    echo "=============================================="
    echo -e "${GREEN}Deployment Complete!${NC}"
    echo "=============================================="
    echo ""
    echo "  Web App:  http://${RPI_HOST}:3000"
    echo "  API:      http://${RPI_HOST}:3001"
    echo "  Health:   http://${RPI_HOST}:3001/health"
    echo "  Backup:   http://${RPI_HOST}:3001/internal/backup/db"
    echo ""
    echo "Container management (via SSH):"
    echo "  Logs:     sudo docker logs kissa-api"
    echo "  Restart:  sudo docker restart kissa-api kissa-web"
    echo "  Stop:     sudo docker stop kissa-api kissa-web"
    echo ""
}

cleanup_on_failure() {
    log_error "Deployment failed!"
    log_info "Check RPi logs: ssh ${RPI_USER}@${RPI_HOST} 'sudo docker logs kissa-api'"
    exit 1
}

# =============================================================================
# Main Execution
# =============================================================================

main() {
    echo ""
    echo "=============================================="
    echo "  Kissa Coffee Tracker - Deployment Script"
    echo "=============================================="
    echo ""
    
    parse_args "$@"
    
    log_info "Deploying to ${RPI_USER}@${RPI_HOST}"
    echo ""
    
    trap cleanup_on_failure ERR
    
    check_requirements
    check_rpi_connection
    build_images
    save_and_transfer
    deploy_on_rpi
    wait_for_health
    show_summary
}

main "$@"
