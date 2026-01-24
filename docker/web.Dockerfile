# Web Dockerfile - Multi-stage build for Kissa Web App
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
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/api-client/package.json ./packages/api-client/
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .
WORKDIR /app/apps/web
CMD ["pnpm", "dev"]

# ============================================
# Builder stage
# ============================================
FROM base AS builder
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/api-client/package.json ./packages/api-client/
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .

# Build packages first
WORKDIR /app/packages/shared
RUN pnpm build

WORKDIR /app/packages/api-client
RUN pnpm build

# Build web app
WORKDIR /app/apps/web
RUN pnpm build

# ============================================
# Production stage
# ============================================
FROM base AS production
ENV NODE_ENV=production

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/api-client/package.json ./packages/api-client/

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod

# Copy built files
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/api-client/dist ./packages/api-client/dist

WORKDIR /app/apps/web

CMD ["pnpm", "start"]

EXPOSE 3000
