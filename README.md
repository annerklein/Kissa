# Kissa - Coffee Brewing Companion

A self-hosted coffee tracking app for brewing better coffee every day. Track your beans, roasters, brew methods, and grinder settings — and get suggestions to improve over time.

**Single user. No auth. Runs on a Raspberry Pi.**

## Features

- **Brew tracking** — Log brews with method-specific recipes that scale by servings
- **Bean & roaster library** — Origins, tasting notes, roast levels, processing methods
- **Grinder management** — Delta-based adjustments ("+3 clicks coarser" not "set to 25")
- **Brew suggestions** — Rule-based engine analyzes your ratings and recommends changes
- **Freeze/thaw** — Pause the aging clock on bags you're saving for later
- **World map analytics** — See your coffee origins on a map with country drill-downs
- **Offline support** — Queue operations when offline, sync when back

## Tech Stack

| Layer | Technology |
|-------|-----------|
| API | Fastify + Prisma + SQLite |
| Web | Next.js 15 (App Router) + Tailwind CSS |
| Mobile | React Native + Expo (scaffold) |
| Monorepo | Turborepo + pnpm workspaces |
| Language | TypeScript |

## Quick Start

```bash
pnpm install
pnpm db:generate
pnpm db:push
pnpm --filter @kissa/api db:seed
pnpm dev
```

- **Web**: http://localhost:3000
- **API**: http://localhost:3001

## Deploy

```bash
./deploy.sh --clean
```

Builds ARM64 Docker images locally, transfers via SSH, and starts containers on the Pi.

- **Production Web**: http://<your-rpi-host>:3000
- **Production API**: http://<your-rpi-host>:3001

## Documentation

Technical documentation lives in `.cursor/rules/` as agent rules:

| Rule | Scope | Contents |
|------|-------|---------|
| `kissa-agent.mdc` | Always | Task lifecycle, conventions, gotchas |
| `kissa-project.mdc` | Always | Project structure, domain concepts, packages |
| `kissa-api-routes.mdc` | API files | Route patterns, full endpoint reference |
| `kissa-web-pages.mdc` | Web files | Page patterns, styling, components |
| `kissa-prisma.mdc` | Prisma files | Schema, models, migrations |
| `kissa-deploy.mdc` | Deploy/Docker | Deployment, backup, seed data |
