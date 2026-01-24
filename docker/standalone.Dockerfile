# Kissa Coffee Tracker - Standalone Dockerfile
# Runs both API and Web in a single container for easy deployment

# ============================================
# Base stage
# ============================================
FROM node:22-alpine AS base
RUN corepack enable pnpm
RUN apk add --no-cache curl sqlite

WORKDIR /app

# ============================================
# Builder stage
# ============================================
FROM base AS builder

# Copy package files first for better caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* tsconfig.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/api-client/package.json ./packages/api-client/

# Install all dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source files
COPY apps/api ./apps/api
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared
COPY packages/api-client ./packages/api-client

# Build shared packages
WORKDIR /app/packages/shared
RUN pnpm build

WORKDIR /app/packages/api-client
RUN pnpm build

# Generate Prisma client and build API
WORKDIR /app/apps/api
RUN pnpm db:generate
RUN pnpm build

# Build Web app
WORKDIR /app/apps/web
RUN pnpm build

# ============================================
# Production stage
# ============================================
FROM base AS production
ENV NODE_ENV=production

WORKDIR /app

# Copy everything needed from builder (including source for tsx)
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/packages/api-client ./packages/api-client

# Create data directory for SQLite
RUN mkdir -p /data

# Create startup script - use tsx to run API (handles pnpm module resolution)
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'set -e' >> /start.sh && \
    echo 'echo "Starting Kissa Coffee Tracker..."' >> /start.sh && \
    echo 'cd /app/apps/api' >> /start.sh && \
    echo 'export PATH="/app/node_modules/.pnpm/node_modules/.bin:$PATH"' >> /start.sh && \
    echo 'echo "Running database migrations..."' >> /start.sh && \
    echo 'prisma migrate deploy' >> /start.sh && \
    echo 'echo "Starting API server on port 3001..."' >> /start.sh && \
    echo 'tsx src/index.ts &' >> /start.sh && \
    echo 'API_PID=$!' >> /start.sh && \
    echo 'sleep 5' >> /start.sh && \
    echo 'echo "Starting Web server on port 3000..."' >> /start.sh && \
    echo 'cd /app/apps/web' >> /start.sh && \
    echo 'exec next start -p 3000' >> /start.sh && \
    chmod +x /start.sh

# Environment variables
ENV DATABASE_URL=file:/data/kissa.db
ENV PORT=3001
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

EXPOSE 3000 3001

CMD ["/start.sh"]
