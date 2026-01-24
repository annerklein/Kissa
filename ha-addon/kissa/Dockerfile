# Kissa Coffee Tracker - Home Assistant Add-on
# Combined API + Web in a single container for HA add-on compatibility

ARG BUILD_FROM
FROM ${BUILD_FROM}

# Install Node.js 22 and required tools
RUN apk add --no-cache \
    nodejs \
    npm \
    curl \
    sqlite

# Enable corepack for pnpm
RUN corepack enable pnpm

WORKDIR /app

# Copy package files first for better caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
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

WORKDIR /app

# Copy startup script
COPY ha-addon/kissa/run.sh /run.sh
RUN chmod +x /run.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

CMD ["/run.sh"]
