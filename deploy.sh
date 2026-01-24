#!/bin/bash
#
# Kissa Coffee Tracker - Deployment Script
# Builds, packages, and deploys to Raspberry Pi
#
# Usage: ./deploy.sh [options]
#   Options:
#     --skip-build    Skip building the Docker image (use existing)
#     --help          Show this help message
#

set -e

# ============================================
# Configuration
# ============================================
RPI_HOST="${RPI_HOST:-192.168.1.122}"
RPI_USER="${RPI_USER:-<your-ssh-user>}"
RPI_PASSWORD="${RPI_PASSWORD:-test}"
CONTAINER_NAME="kissa"
IMAGE_NAME="kissa:latest"
IMAGE_FILE="/tmp/kissa-image.tar.gz"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# Helper Functions
# ============================================
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

check_dependencies() {
    log_info "Checking dependencies..."
    
    # Check for Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        log_info "You can install it with: brew install colima docker"
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        log_warning "Docker daemon is not running. Attempting to start Colima..."
        if command -v colima &> /dev/null; then
            colima start --arch aarch64 --vm-type vz --vz-rosetta 2>/dev/null || true
            sleep 5
            if ! docker info &> /dev/null; then
                log_error "Failed to start Docker. Please start Colima manually: colima start"
                exit 1
            fi
        else
            log_error "Docker daemon is not running. Please start Docker Desktop or Colima."
            exit 1
        fi
    fi
    
    # Check for expect (for password automation)
    if ! command -v expect &> /dev/null; then
        log_error "'expect' is not installed. Please install it with: brew install expect"
        exit 1
    fi
    
    log_success "All dependencies are available"
}

ssh_command() {
    expect <<EOF
set timeout 300
log_user 0
spawn ssh -o StrictHostKeyChecking=no -o LogLevel=ERROR ${RPI_USER}@${RPI_HOST} "$1"
expect {
    "password:" {
        send "${RPI_PASSWORD}\r"
        exp_continue
    }
    eof
}
catch wait result
exit [lindex \$result 3]
EOF
}

ssh_command_verbose() {
    expect <<EOF
set timeout 300
spawn ssh -o StrictHostKeyChecking=no -o LogLevel=ERROR ${RPI_USER}@${RPI_HOST} "$1"
expect {
    "password:" {
        send "${RPI_PASSWORD}\r"
        exp_continue
    }
    eof
}
catch wait result
exit [lindex \$result 3]
EOF
}

transfer_file() {
    local src="$1"
    local dst="$2"
    expect <<EOF
set timeout 600
log_user 0
spawn bash -c "cat ${src} | ssh -o StrictHostKeyChecking=no -o LogLevel=ERROR ${RPI_USER}@${RPI_HOST} 'cat > ${dst}'"
expect {
    "password:" {
        send "${RPI_PASSWORD}\r"
        exp_continue
    }
    eof
}
catch wait result
exit [lindex \$result 3]
EOF
}

# ============================================
# Main Steps
# ============================================

step_build() {
    log_info "Building Docker image..."
    cd "${SCRIPT_DIR}"
    
    if ! docker build -f docker/standalone.Dockerfile -t "${IMAGE_NAME}" . ; then
        log_error "Docker build failed"
        exit 1
    fi
    
    log_success "Docker image built successfully"
}

step_save() {
    log_info "Saving Docker image to ${IMAGE_FILE}..."
    
    docker save "${IMAGE_NAME}" | gzip > "${IMAGE_FILE}"
    
    local size=$(du -h "${IMAGE_FILE}" | cut -f1)
    log_success "Image saved (${size})"
}

step_transfer() {
    log_info "Transferring image to ${RPI_HOST}..."
    log_info "This may take a few minutes depending on network speed..."
    
    if ! transfer_file "${IMAGE_FILE}" "/tmp/kissa-image.tar.gz"; then
        log_error "Failed to transfer image to RPi"
        exit 1
    fi
    
    log_success "Image transferred successfully"
}

step_stop_existing() {
    log_info "Stopping existing container (if any)..."
    
    ssh_command "sudo docker stop ${CONTAINER_NAME} 2>/dev/null || true"
    ssh_command "sudo docker rm ${CONTAINER_NAME} 2>/dev/null || true"
    
    log_success "Existing container cleaned up"
}

step_load() {
    log_info "Loading Docker image on RPi..."
    
    if ! ssh_command "sudo gunzip -c /tmp/kissa-image.tar.gz | sudo docker load"; then
        log_error "Failed to load Docker image on RPi"
        exit 1
    fi
    
    log_success "Image loaded on RPi"
}

step_run() {
    log_info "Starting container..."
    
    local run_cmd="sudo docker run -d \
        --name ${CONTAINER_NAME} \
        --restart unless-stopped \
        -p 3000:3000 \
        -p 3001:3001 \
        -v kissa-data:/data \
        ${IMAGE_NAME}"
    
    if ! ssh_command "${run_cmd}"; then
        log_error "Failed to start container"
        exit 1
    fi
    
    log_success "Container started"
}

step_health_check() {
    log_info "Waiting for services to be ready..."
    
    local max_attempts=30
    local attempt=1
    local healthy=false
    
    while [ $attempt -le $max_attempts ]; do
        sleep 5
        
        # Check container health
        local status=$(ssh_command_verbose "sudo docker inspect --format='{{.State.Health.Status}}' ${CONTAINER_NAME} 2>/dev/null" | tail -1)
        
        if [[ "$status" == *"healthy"* ]]; then
            healthy=true
            break
        fi
        
        log_info "Attempt ${attempt}/${max_attempts}: Container status: ${status:-starting}"
        ((attempt++))
    done
    
    if [ "$healthy" = true ]; then
        log_success "Container is healthy!"
    else
        log_warning "Container may not be fully healthy yet, but continuing..."
    fi
    
    # Final verification with curl
    log_info "Verifying services are accessible..."
    
    sleep 5
    
    # Test Web server
    if curl -sf "http://${RPI_HOST}:3000" > /dev/null 2>&1; then
        log_success "Web server is accessible at http://${RPI_HOST}:3000"
    else
        log_warning "Web server may not be accessible yet"
    fi
    
    # Test API server
    if curl -sf "http://${RPI_HOST}:3001/health" > /dev/null 2>&1; then
        log_success "API server is healthy at http://${RPI_HOST}:3001"
    else
        log_warning "API server may not be accessible yet"
    fi
}

step_cleanup() {
    log_info "Cleaning up temporary files..."
    rm -f "${IMAGE_FILE}"
    ssh_command "rm -f /tmp/kissa-image.tar.gz 2>/dev/null || true"
    log_success "Cleanup complete"
}

show_summary() {
    echo ""
    echo "============================================"
    echo -e "${GREEN}Deployment Complete!${NC}"
    echo "============================================"
    echo ""
    echo "Your Kissa app is now running on the Raspberry Pi:"
    echo ""
    echo -e "  ${BLUE}Web App:${NC}  http://${RPI_HOST}:3000"
    echo -e "  ${BLUE}API:${NC}      http://${RPI_HOST}:3001"
    echo ""
    echo "Useful commands (run via SSH on the RPi):"
    echo "  View logs:     sudo docker logs ${CONTAINER_NAME}"
    echo "  Follow logs:   sudo docker logs -f ${CONTAINER_NAME}"
    echo "  Restart:       sudo docker restart ${CONTAINER_NAME}"
    echo "  Stop:          sudo docker stop ${CONTAINER_NAME}"
    echo ""
}

show_help() {
    echo "Kissa Coffee Tracker - Deployment Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --skip-build    Skip building the Docker image (use existing)"
    echo "  --help          Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  RPI_HOST        Raspberry Pi IP address (default: 192.168.1.122)"
    echo "  RPI_USER        SSH username (from .env or flag)"
    echo "  RPI_PASSWORD    SSH password (from .env or flag)"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Full deployment"
    echo "  $0 --skip-build                       # Deploy existing image"
    echo "  RPI_HOST=192.168.1.100 $0             # Deploy to different host"
    echo ""
}

# ============================================
# Main
# ============================================

main() {
    local skip_build=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-build)
                skip_build=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    echo ""
    echo "============================================"
    echo "Kissa Coffee Tracker - Deployment"
    echo "============================================"
    echo ""
    echo "Target: ${RPI_USER}@${RPI_HOST}"
    echo ""
    
    local start_time=$(date +%s)
    
    # Run deployment steps
    check_dependencies
    
    if [ "$skip_build" = false ]; then
        step_build
    else
        log_info "Skipping build (using existing image)"
    fi
    
    step_save
    step_transfer
    step_stop_existing
    step_load
    step_run
    step_health_check
    step_cleanup
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    show_summary
    
    log_success "Total deployment time: ${duration} seconds"
}

main "$@"
