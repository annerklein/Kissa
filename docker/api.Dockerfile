# API Dockerfile - Multi-stage build for Kissa API
# Images are built locally with --platform linux/arm64 and transferred to RPi

# ============================================
# Base stage
# ============================================
FROM node:22-alpine AS base
RUN corepack enable pnpm
RUN apk add --no-cache curl sqlite openssl

WORKDIR /app

# ============================================
# Development stage
# ============================================
FROM base AS development
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .
WORKDIR /app/apps/api
CMD ["pnpm", "dev"]

# ============================================
# Builder stage (installs all deps, builds everything)
# ============================================
FROM base AS builder
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .

# Generate Prisma client for the target platform (set via --platform flag)
WORKDIR /app/apps/api
RUN pnpm db:generate

# Build shared package first, then API
WORKDIR /app/packages/shared
RUN pnpm build

WORKDIR /app/apps/api
RUN pnpm build

# ============================================
# Production stage
# ============================================
FROM base AS production
ENV NODE_ENV=production

WORKDIR /app

# Copy the entire workspace from builder to preserve pnpm's symlink structure
# (pnpm relies on symlinks between node_modules/.pnpm, package node_modules, etc.)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./

# API: compiled output, prisma schema/migrations, node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# Shared package: compiled output + its node_modules (for pnpm symlinks to zod etc.)
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules

# Create data directory for SQLite
RUN mkdir -p /app/apps/api/data

WORKDIR /app/apps/api

# Copy startup script
COPY docker/api-start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]

EXPOSE 3001
