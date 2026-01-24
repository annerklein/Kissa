# API Dockerfile - Multi-stage build for Kissa API
# Supports both ARM (Raspberry Pi) and x86 architectures

# ============================================
# Base stage
# ============================================
FROM node:22-alpine AS base
RUN corepack enable pnpm

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
# Builder stage
# ============================================
FROM base AS builder
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .

# Generate Prisma client
WORKDIR /app/apps/api
RUN pnpm db:generate

# Build shared package first
WORKDIR /app/packages/shared
RUN pnpm build

# Build API
WORKDIR /app/apps/api
RUN pnpm build

# ============================================
# Production stage
# ============================================
FROM base AS production
ENV NODE_ENV=production

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod

# Copy built files
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Create data directory for SQLite
RUN mkdir -p /app/apps/api/data

WORKDIR /app/apps/api

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]

EXPOSE 3001
