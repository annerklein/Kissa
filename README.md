# Kissa - Coffee Brewing Companion

Kissa is a self-hosted coffee tracking application that helps you brew excellent coffee daily. It tracks beans, roasters, brew methods, grinder settings, and provides rule-based suggestions to improve your brews over time.

**Single user, no auth.** This is a personal tool designed to run on a Raspberry Pi or similar home server.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Apps](#apps)
  - [API (`apps/api`)](#api-appsapi)
  - [Web (`apps/web`)](#web-appsweb)
  - [Mobile (`apps/mobile`)](#mobile-appsmobile)
- [Packages](#packages)
  - [`@kissa/shared`](#kissashared)
  - [`@kissa/api-client`](#kissaapi-client)
- [Database Schema](#database-schema)
- [Production Server](#production-server)
- [API Endpoints Reference](#api-endpoints-reference)
- [Key Domain Concepts](#key-domain-concepts)
- [Recommendation Engine](#recommendation-engine)
- [Development](#development)
- [Deployment](#deployment)
  - [One-Click Deploy](#one-click-deploy-recommended)
  - [Manual Deploy Steps](#manual-deploy-steps)
  - [API Container Startup](#api-container-startup)
  - [Docker Files](#docker-files)
  - [Home Assistant Add-on](#home-assistant-add-on-alternative)
- [Seed Data](#seed-data)
- [Database Backup](#database-backup)
- [Conventions and Patterns](#conventions-and-patterns)
- [Known Quirks and Gotchas](#known-quirks-and-gotchas)
- [Agent Instructions](#agent-instructions)

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Monorepo** | Turborepo + pnpm workspaces | Turbo ^2.3, pnpm 9.15 |
| **API** | Node.js + Fastify | Fastify ^5.2 |
| **Database** | SQLite + Prisma ORM | Prisma ~6.19 |
| **Web** | Next.js (App Router) | Next ^15.1 |
| **Mobile** | React Native + Expo Router | Expo ~52, RN 0.76 |
| **UI Styling** | Tailwind CSS | ^3.4 |
| **Client State** | Zustand | ^5.0 |
| **Server State** | TanStack React Query | ^5.64 |
| **Validation** | Zod | ^3.24 |
| **Maps** | Mapbox GL | ^3.9 |
| **Language** | TypeScript | ^5.7 |
| **Runtime** | Node.js 22 | |

---

## Monorepo Structure

```
kissa/
├── apps/
│   ├── api/                        # Fastify REST API server
│   │   ├── src/
│   │   │   ├── app.ts              # Fastify app builder, registers all routes
│   │   │   ├── index.ts            # Entry point, starts server
│   │   │   ├── db/
│   │   │   │   └── client.ts       # Prisma client singleton
│   │   │   ├── routes/
│   │   │   │   ├── settings.ts     # GET/PATCH /api/settings
│   │   │   │   ├── grinder.ts      # GET/POST/PATCH /api/grinder
│   │   │   │   ├── roasters.ts     # CRUD /api/roasters
│   │   │   │   ├── beans.ts        # CRUD /api/beans, recipes, bags
│   │   │   │   ├── bags.ts         # CRUD /api/bags, /api/available-beans
│   │   │   │   ├── methods.ts      # GET /api/methods
│   │   │   │   ├── brews.ts        # CRUD /api/brews, rating, suggestions
│   │   │   │   ├── analytics.ts    # GET /api/analytics/map, country, region
│   │   │   │   ├── onboarding.ts   # POST /api/onboarding
│   │   │   │   └── backup.ts       # GET /internal/backup/db (hidden endpoint)
│   │   │   ├── recommendation/
│   │   │   │   └── engine.ts       # Rule-based suggestion generator
│   │   │   └── __tests__/
│   │   │       ├── helpers.ts      # Shared test utilities (getApp, createRoaster, etc.)
│   │   │       ├── api.test.ts     # Cross-cutting integration tests
│   │   │       ├── health.test.ts
│   │   │       ├── settings.test.ts
│   │   │       ├── grinder.test.ts
│   │   │       ├── roasters.test.ts
│   │   │       ├── beans.test.ts
│   │   │       ├── bags.test.ts
│   │   │       ├── methods.test.ts
│   │   │       ├── brews.test.ts
│   │   │       ├── analytics.test.ts
│   │   │       ├── onboarding.test.ts
│   │   │       └── recommendation.test.ts
│   │   ├── vitest.config.ts          # Test configuration
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Database schema
│   │   │   ├── seed.ts             # TypeScript seed (dev)
│   │   │   ├── seed.mjs            # JS seed (production Docker)
│   │   │   ├── data/
│   │   │   │   └── kissa.db        # SQLite database file (dev)
│   │   │   └── migrations/         # Prisma migrations
│   │   ├── dist/                   # Compiled output
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                        # Next.js web application
│   │   ├── app/
│   │   │   ├── layout.tsx          # Root layout (fonts, navigation, providers)
│   │   │   ├── page.tsx            # Home: method picker + available beans
│   │   │   ├── providers.tsx       # React Query provider
│   │   │   ├── globals.css         # Tailwind + custom CSS
│   │   │   ├── beans/
│   │   │   │   ├── page.tsx        # Bean list
│   │   │   │   ├── [id]/page.tsx   # Bean detail (recipes, bags, brew history)
│   │   │   │   └── new/page.tsx    # Add new bean form
│   │   │   ├── brew/
│   │   │   │   └── page.tsx        # Brew execution screen
│   │   │   ├── rate/
│   │   │   │   └── page.tsx        # Post-brew rating screen
│   │   │   ├── roasters/
│   │   │   │   ├── page.tsx        # Roaster list (clickable → roaster detail)
│   │   │   │   └── [id]/page.tsx   # Roaster detail (roaster's beans, clickable → bean detail)
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx        # World map + analytics
│   │   │   └── onboarding/
│   │   │       └── page.tsx        # First-run setup flow
│   │   ├── components/
│   │   │   ├── Navigation.tsx      # Bottom nav bar
│   │   │   ├── MethodPicker.tsx    # Brew method selection
│   │   │   ├── GrinderCard.tsx     # Grinder setting + delta display
│   │   │   ├── ServingsControl.tsx # Servings adjustment
│   │   │   ├── RecipeCard.tsx      # Scaled recipe display
│   │   │   ├── RatingSlider.tsx    # Rating attribute slider
│   │   │   ├── SuggestionCard.tsx  # Post-rating suggestion
│   │   │   ├── AvailableBeanCard.tsx
│   │   │   ├── BagCard.tsx
│   │   │   ├── AddBagModal.tsx
│   │   │   ├── TubePositionIndicator.tsx  # Tube position display & picker components
│   │   │   ├── FrozenBagCard.tsx          # Compact frozen bag card with quick unfreeze button
│   │   │   ├── BeanRankingList.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── CountryFlag.tsx
│   │   │   ├── CountryList.tsx
│   │   │   ├── Logo.tsx
│   │   │   ├── OfflineIndicator.tsx
│   │   │   ├── TastingNotesComparison.tsx
│   │   │   ├── TastingNotesInput.tsx
│   │   │   └── WorldMap.tsx        # Mapbox GL world map
│   │   ├── lib/
│   │   │   ├── hooks.ts            # useOnlineStatus, useOfflineSync, etc.
│   │   │   ├── store.ts            # Zustand store (grinder, settings, method)
│   │   │   └── offline-queue.ts    # Offline operation queue with retry
│   │   ├── public/
│   │   │   └── logo.png
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── mobile/                     # React Native / Expo app (scaffold)
│       ├── app.config.js           # Expo config
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared/                     # @kissa/shared - shared types, schemas, utils
│   │   └── src/
│   │       ├── index.ts            # Re-exports everything
│   │       ├── types/
│   │       │   ├── index.ts
│   │       │   ├── schemas.ts      # Zod schemas for validation
│   │       │   ├── api.ts          # API response types
│   │       │   └── enums.ts        # RoastLevel, BagStatus, etc.
│   │       ├── constants/
│   │       │   ├── index.ts
│   │       │   ├── tasting-notes.ts # Predefined tasting note categories
│   │       │   └── methods.ts      # Method constants
│   │       ├── scoring/
│   │       │   └── index.ts        # computeSmartScore, computeBestScore, etc.
│   │       └── utils/
│   │           ├── index.ts
│   │           ├── grinder.ts      # computeGrinderDelta
│   │           └── date.ts         # Date formatting utilities
│   │
│   └── api-client/                 # @kissa/api-client - type-safe HTTP client
│       └── src/
│           ├── index.ts            # Re-exports
│           ├── config.ts           # API_URL resolution + endpoint definitions
│           └── client.ts           # fetchApi<T>, settingsApi, beansApi, etc.
│
├── docker/
│   ├── api.Dockerfile              # API image (primary, built locally for ARM64)
│   ├── web.Dockerfile              # Web image (primary, built locally for ARM64)
│   ├── api-start.sh                # API container startup script
│   ├── standalone.Dockerfile       # Single container: API + Web (alternative)
│   ├── standalone-start.sh         # Standalone container startup script
│   ├── docker-compose.yml          # Docker Compose config (reference)
│   └── docker-compose.dev.yml      # Development with volume mounts
│
├── ha-addon/                       # Home Assistant add-on
│   ├── repository.yaml
│   └── kissa/
│       ├── config.yaml             # HA add-on manifest
│       ├── Dockerfile              # HA-specific Dockerfile
│       ├── run.sh                  # HA startup script (uses bashio)
│       ├── build.yaml              # Per-architecture base images
│       ├── DOCS.md
│       └── CHANGELOG.md
│
├── scripts/                         # Agent automation scripts
│   ├── backup.sh                    # Daily database backup (run at start of every session)
│   ├── run-tests.sh                 # Run full API test suite
│   └── verify-deploy.sh            # Post-deployment health & feature verification
│
├── .cursor/rules/                   # Cursor agent rules (auto-applied)
│   ├── kissa-agent.mdc             # Core workflow: task lifecycle, definition of done
│   ├── kissa-api-routes.mdc        # API route patterns (applied when editing apps/api/)
│   ├── kissa-web-pages.mdc         # Web page patterns (applied when editing apps/web/)
│   └── kissa-prisma.mdc            # Database/migration patterns (applied when editing prisma/)
│
├── deploy.sh                       # One-click deploy to RPi via SSH
├── deploy-rpi.sh                   # Alternative rsync-based deploy
├── seed-coffee-data.sh             # Seeds sample coffee data via API
├── coffee-seed-data.json           # Sample roasters + beans JSON
├── package.json                    # Root workspace config
├── pnpm-workspace.yaml             # Workspace: apps/*, packages/*
├── turbo.json                      # Turborepo task config
├── tsconfig.json                   # Root TypeScript config
└── .dockerignore
```

---

## Apps

### API (`apps/api`)

A Fastify REST API backed by SQLite via Prisma.

**Entry point:** `src/index.ts` creates the server and starts listening.
**App builder:** `src/app.ts` registers CORS and all route plugins under `/api` prefix, a `/health` endpoint, and a hidden `/internal/backup/db` backup endpoint.

**Key patterns:**
- Every route file exports an `async function xxxRoutes(server: FastifyInstance)` that gets registered as a Fastify plugin.
- Request validation uses Zod schemas imported from `@kissa/shared`.
- JSON fields in SQLite are stored as stringified JSON and parsed/serialized in route handlers.
- The Prisma client is a singleton from `src/db/client.ts`.
- The recommendation engine (`src/recommendation/engine.ts`) is a pure function called during brew rating.

**Scripts:**
| Script | Description |
|--------|-------------|
| `dev` | `tsx watch src/index.ts` - hot-reload dev server |
| `build` | `tsc && tsc-alias` - compile with path alias resolution |
| `start` | `node dist/index.js` - production start |
| `db:generate` | Generate Prisma client |
| `db:push` | Push schema to DB (no migration) |
| `db:migrate` | Create and apply migrations |
| `db:seed` | `tsx prisma/seed.ts` - seed default methods + settings |
| `db:studio` | Open Prisma Studio GUI |
| `test` | `vitest run` |

**Environment variables:**
| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `file:./data/kissa.db` | SQLite database path |
| `PORT` | `3001` | API server port |
| `HOST` | `0.0.0.0` | Listen address |

### Web (`apps/web`)

A Next.js 15 app using the App Router. No API routes -- it calls the external Fastify API.

**Key patterns:**
- Pages are in `app/` (not `src/app/`). Components in `components/`, utilities in `lib/`.
- `app/providers.tsx` wraps children in `QueryClientProvider` (TanStack React Query).
- `app/layout.tsx` loads two Google Fonts (Bricolage Grotesque + Fraunces) and renders `<Navigation />` (bottom nav bar).
- The API URL is configured via `next.config.js` env: `API_URL` (defaults to `http://localhost:3001`).
- Uses `@kissa/api-client` for all API calls; the client auto-detects the API URL from environment variables (`NEXT_PUBLIC_API_URL` or `EXPO_PUBLIC_API_URL`) or falls back to `http://kissa.local:3001`.
- Offline support via `lib/offline-queue.ts` -- queues operations when offline and syncs when back online. Supported operations: `CREATE_BREW`, `UPDATE_BREW`, `RATING`, `GRINDER_APPLY`.
- Zustand store (`lib/store.ts`) persists grinder state, settings, selected method, and pending brews.
- Custom coffee color palette in `tailwind.config.js` (`coffee-50` through `coffee-900`, plus `accent-warm`, `accent-cream`, `accent-espresso`).
- Custom animations: `fade-in`, `slide-up`, `scale-in`, `pulse-soft`.
- Fonts: `--font-bricolage` (sans) and `--font-fraunces` (display/serif).

**Page flow:**
1. **Home** (`/`) - Pick a brew method, see available beans with grinder deltas, tap to brew
2. **Brew** (`/brew?bagId=...&methodId=...`) - See scaled recipe, grinder adjustment, start brewing
3. **Rate** (`/rate?brewId=...`) - Rate the brew (5 sliders), get AI suggestion
4. **Beans** (`/beans`) - Browse all beans
5. **Bean Detail** (`/beans/[id]`) - Edit bean, manage bags, view recipes per method, brew history
6. **New Bean** (`/beans/new`) - Add a new bean
7. **Roasters** (`/roasters`) - Browse roasters, tap a roaster to see its beans
8. **Roaster Detail** (`/roasters/[id]`) - View roaster info and all its beans, tap a bean to go to its detail/edit page
9. **Analytics** (`/analytics`) - World map of coffee origins with country drill-down

**Environment variables:**
| Variable | Default | Description |
|----------|---------|-------------|
| `API_URL` | `http://localhost:3001` | API server URL (set in `next.config.js`) |
| `NEXT_PUBLIC_API_URL` | (none) | Client-side API URL override |

### Mobile (`apps/mobile`)

A React Native app using Expo Router. Currently a **scaffold** -- the structure exists but it's not fully built out. Uses the same `@kissa/shared` and `@kissa/api-client` packages. The mobile app is excluded from Docker builds via `.dockerignore`.

**Expo config:** `app.config.js` with bundle ID `com.kissa.app`, scheme `kissa`.

---

## Packages

### `@kissa/shared`

Shared code consumed by API, Web, and Mobile. Published as ESM with TypeScript declarations.

**Exports:**

| Path | Contents |
|------|----------|
| `@kissa/shared` | Everything (re-export barrel) |
| `@kissa/shared/types` | Zod schemas (`SettingsUpdateSchema`, `GrinderApplySchema`, `BeanCreateSchema`, `BagCreateSchema`, `BagUpdateSchema`, `BrewLogCreateSchema`, `BrewLogRatingSchema`, `OnboardingDataSchema`, `RoasterCreateSchema`, `TubePositionSchema`), API response types, enums (`RoastLevel`, `BagStatus` incl. `FROZEN`, `TubePosition`) |
| `@kissa/shared/constants` | Tasting note categories, method constants |
| `@kissa/shared/scoring` | `computeSmartScore(sliders)`, `computeBestScore(scores)`, `interpretBalance(balance)`, `getExtractionAssessment(sliders)` |
| `@kissa/shared/utils` | `computeGrinderDelta(current, target)`, date formatting helpers, `computeEffectiveDaysOffRoast()`, `computeTotalFrozenDays()` |

### `@kissa/api-client`

Type-safe HTTP client wrapping `fetch`. Used by both Web and Mobile apps.

**API URL resolution order:**
1. In development (`NODE_ENV !== 'production'`): `http://localhost:3001`
2. `EXPO_PUBLIC_API_URL` (for Expo/React Native)
3. `NEXT_PUBLIC_API_URL` (for Next.js)
4. Fallback: `http://kissa.local:3001`

**Exported API objects:** `settingsApi`, `grinderApi`, `roastersApi`, `beansApi`, `bagsApi`, `methodsApi`, `brewsApi`, `analyticsApi`, `onboardingApi`, `healthApi`

Each has typed methods like `beansApi.getAll()`, `beansApi.getById(id)`, `beansApi.create(data)`, etc.

---

## Database Schema

SQLite via Prisma. The schema is at `apps/api/prisma/schema.prisma`.

### Entity Relationship Diagram

```
Settings (singleton, id='default')
GrinderState (singleton, id='default')

Roaster ──1:N──> Bean ──1:N──> Bag ──1:N──> BrewLog
                   │                           │
                   └──1:N──> BeanMethodRecipe   │
                                  │             │
                             Method ────────────┘
```

### Models

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **Settings** | App-wide defaults (singleton) | `defaultServings`, `gramsPerServing`, `displayPreferences` (JSON) |
| **GrinderState** | Current grinder position (singleton) | `grinderModel`, `currentSetting` (float) |
| **Roaster** | Coffee roaster/company | `name`, `country`, `website`, `logoUrl`, `notes` |
| **Bean** | Coffee product (stable, re-buyable) | `name`, `roasterId` (FK), `originCountry`, `originRegion`, `varietal`, `process`, `roastLevel` (enum), `tastingNotesExpected` (JSON array) |
| **Bag** | Purchase instance of a bean | `beanId` (FK), `roastDate`, `openedDate`, `bagSizeGrams`, `status` (UNOPENED/OPEN/FINISHED/FROZEN), `isAvailable`, `tubePosition` (LEFT/MIDDLE/RIGHT, nullable), `frozenAt` (nullable), `totalFrozenDays` (default 0), `isFrozenBag` (default false) |
| **Method** | Brewing method | `name` (unique: v60/moka/espresso/french_press), `displayName`, `scalingRules` (JSON), `defaultParams` (JSON), `steps` (JSON array) |
| **BeanMethodRecipe** | Per-bean grind target for a method | `beanId` + `methodId` (unique pair), `grinderTarget` (float), `recipeOverrides` (JSON) |
| **BrewLog** | Record of an actual brew | `bagId` (FK), `methodId` (FK), `parameters` (JSON), `ratingSliders` (JSON), `drawdownTime`, `computedScore`, `tastingNotesActual` (JSON), `notes`, `suggestionShown` (JSON), `suggestionAccepted` |

### JSON Field Conventions

Several fields store JSON as strings in SQLite. They are serialized with `JSON.stringify()` on write and `JSON.parse()` on read in route handlers.

| Field | Example Value |
|-------|---------------|
| `Method.defaultParams` | `{"ratio": 16, "waterTemp": 96, "grindSize": 40, "dose": 15, "bloomRatio": 2, "bloomTime": 45}` |
| `Method.steps` | `[{"name": "Bloom", "waterRatio": 2, "duration": 45, "notes": "..."}]` |
| `Method.scalingRules` | `{"scalesPours": true, "scalesDose": true, "scalesWater": true}` |
| `BrewLog.ratingSliders` | `{"balance": 7, "sweetness": 6, "clarity": 8, "body": 7, "finish": 6}` |
| `BrewLog.parameters` | `{"dose": 30, "water": 480, "grindSize": 22, "waterTemp": 96}` |
| `Bean.tastingNotesExpected` | `["chocolate", "caramel", "nutty"]` |

### Migrations

Migrations live in `apps/api/prisma/migrations/`. There are currently 4 migrations:

1. `20260124125519_add_roaster_logo` - Initial schema creation (all tables)
2. `20260124142211_move_recipes_to_bean` - Migrated recipes from per-bag (`BagMethodTarget`) to per-bean (`BeanMethodRecipe`)
3. `20260214092432_add_tube_position_to_bag` - Added `tubePosition` (LEFT/MIDDLE/RIGHT) to `Bag` model for tracking physical tube placement
4. `20260214140000_add_freeze_bag_support` - Added `FROZEN` status, `frozenAt`, `totalFrozenDays`, `isFrozenBag` to `Bag` model for freeze/thaw tracking

Migrations are applied via `npx prisma migrate deploy` (production) or `pnpm db:migrate` (dev).

---

## Production Server

The production instance runs on a **Raspberry Pi** via Docker Compose (separate `kissa-api` and `kissa-web` containers).

| Service | URL |
|---------|-----|
| **Web App** | `http://<your-rpi-host>:3000` |
| **API** | `http://<your-rpi-host>:3001` |

**SSH access:** `$RPI_USER@$RPI_HOST` (same host as Home Assistant)

**Docker containers:** `kissa-api` (API + SQLite) and `kissa-web` (Next.js frontend), managed via `docker/docker-compose.yml`.

**Database location (inside container):** `/app/data/kissa.db` (Docker volume: `kissa-data`)

---

## API Endpoints Reference

Base URL: `http://localhost:3001` (dev) / `http://<your-rpi-host>:3001` (production)

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check with database status (method count, settings, grinder) |

### Settings & Grinder
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/settings` | Get app settings |
| PATCH | `/api/settings` | Update settings |
| GET | `/api/grinder` | Get current grinder state |
| POST | `/api/grinder/apply` | Apply new grinder setting |
| PATCH | `/api/grinder` | Update grinder model name |

### Roasters
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/roasters` | List all roasters |
| GET | `/api/roasters/:id` | Get roaster with beans |
| POST | `/api/roasters` | Create roaster |
| PATCH | `/api/roasters/:id` | Update roaster |
| DELETE | `/api/roasters/:id` | Delete roaster (cascades) |

### Beans
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/beans` | List all beans (with roaster + bags) |
| GET | `/api/beans/:id` | Full bean profile (recipes, bags, brew history, tasting notes comparison) |
| POST | `/api/beans` | Create bean |
| PATCH | `/api/beans/:id` | Update bean |
| DELETE | `/api/beans/:id` | Delete bean (cascades) |
| POST | `/api/beans/:id/bags` | Add a bag to a bean |
| PATCH | `/api/beans/:id/recipes/:methodId` | Upsert bean-method recipe (grinder target + overrides) |
| DELETE | `/api/beans/:id/recipes/:methodId` | Delete bean-method recipe |

### Bags
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/bags` | List all bags |
| GET | `/api/bags/:id` | Get bag with bean, roaster, recipes, brew logs |
| PATCH | `/api/bags/:id` | Update bag (status, availability, tubePosition) |
| DELETE | `/api/bags/:id` | Delete bag |
| GET | `/api/available-beans` | Get available bags with grinder deltas for selected method. Query: `?methodId=` |

### Methods
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/methods` | List active methods (ordered: v60, moka, espresso, french_press) |
| GET | `/api/methods/:id` | Get method with parsed JSON fields |
| GET | `/api/methods/name/:name` | Get method by name (e.g., `v60`) |

### Brews
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/brews` | List brews. Query: `?bagId=` |
| GET | `/api/brews/:id` | Get brew with bag, bean, roaster, method |
| POST | `/api/brews` | Create brew log (also updates grinder state if grindSize in params) |
| PATCH | `/api/brews/:id` | Update brew |
| DELETE | `/api/brews/:id` | Delete brew |
| GET | `/api/brews/screen` | Get brew screen data (bag, method, scaled recipe, grinder state). Query: `?bagId=&methodId=` |
| PATCH | `/api/brews/:id/rating` | Submit rating (computes score + generates suggestion) |
| POST | `/api/brews/:id/apply-suggestion` | Apply suggestion to bean recipe. Body: `{applyTo: 'bag'}` |

### Analytics
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/analytics/map` | World map data (country counts + avg scores). Query: `?availableOnly=true` |
| GET | `/api/analytics/country/:code` | Country drill-down with regions and bean rankings |
| GET | `/api/analytics/region/:code` | Region drill-down (format: `country/region`) |

### Onboarding
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/onboarding` | Bulk create settings, grinder, roasters, beans, bags |
| GET | `/api/onboarding/status` | Check if onboarding is complete |

### Backup (Hidden)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/internal/backup/db` | Download SQLite database file as backup. Checkpoints WAL first. Not exposed in UI. |

---

## Key Domain Concepts

### Bean vs Bag

A **Bean** is a coffee product (e.g., "Ethiopia Yirgacheffe" from a specific roaster). It's stable and re-purchasable. A **Bag** is a specific purchase instance of that bean with a roast date. You can have multiple bags of the same bean. Recipes (grinder targets) are stored at the **Bean** level, not the Bag level.

### Tube Position

Open bags can be assigned a **tube position**: **Left**, **Middle**, or **Right**. This corresponds to the physical placement of coffee containers on a tube/shelf in real life. It's a nullable attribute on the `Bag` model -- only meaningful for bags with status `OPEN`. The position is displayed as a compact visual indicator (three-slot bar) on both the `BagCard` and `AvailableBeanCard` components. Users can set/change/clear the position from the bean detail page when expanding an open bag.

### Freeze Bag

Bags can be **frozen** to pause the aging clock. This is designed for the common scenario of buying a bag, splitting it, and freezing part of it for later. The freeze feature has two entry points:

1. **Freeze an existing bag** -- any UNOPENED or OPEN bag can be frozen from its detail card. The status changes to `FROZEN`, `frozenAt` is set to the current time, and the bag is removed from the rotation.
2. **Create a new frozen bag** -- from the bean detail page's "Add Bag" modal, the user can toggle "Freeze" mode. This creates a bag with `status: FROZEN`, `isFrozenBag: true`. The `isFrozenBag` flag marks it as a frozen split that shouldn't count as a separate purchase in statistics.

**Unfreezing (thawing):** When a bag is unfrozen, the frozen duration (days from `frozenAt` to now) is added to `totalFrozenDays`, `frozenAt` is cleared, status is set to `OPEN`, and the bag is added to the rotation (`isAvailable: true`).

**Effective days off roast:** The formula is: `effective_days = (today - roastDate) - totalFrozenDays - currentFreezeDuration`. This is computed by `computeEffectiveDaysOffRoast()` in `@kissa/shared/utils`. The `formatRoastDate()` function also accepts an optional `frozenDaysOffset` parameter.

**Multiple freeze/thaw cycles:** Supported. `totalFrozenDays` accumulates across cycles.

**Home page display:** Frozen bags appear in a collapsible "Frozen" section below the rotation, with a compact card showing bean name, frozen duration, and a quick "Thaw" button.

### Grinder Delta

The app tracks a single grinder's current setting. When displaying available beans for brewing, it shows the **delta** from the current grinder position to the target for that bean/method combo (e.g., "+3 clicks coarser" instead of "set to 25"). When a brew is started, the grinder state is updated to match.

### Smart Score

Brews are rated on 5 sliders (each 1-10):
- **Balance** (25% weight) - Extraction accuracy
- **Sweetness** (25%) - Quality indicator
- **Clarity** (20%) - Clean cup
- **Body** (15%) - Mouthfeel
- **Finish** (15%) - Aftertaste

The `computeSmartScore()` function in `@kissa/shared/scoring` produces a weighted score.

### Brew Flow

1. User selects a method on the home page
2. Available beans are shown with grinder deltas
3. User taps a bean -> goes to brew screen with scaled recipe
4. Brew screen shows: grinder adjustment needed, dose, water, temperature, steps
5. Recipe scales based on `settings.defaultServings * recipe.dose`
6. After brewing, user goes to rate screen
7. Rating produces a suggestion via the recommendation engine
8. User can accept the suggestion (adjusts the bean's recipe)

### Scaling Rules

Each method defines `scalingRules` (JSON) controlling what scales with servings:
- `scalesPours`: Whether pour step amounts scale
- `scalesDose`: Whether coffee dose scales
- `scalesWater`: Whether total water scales

---

## Recommendation Engine

Located at `apps/api/src/recommendation/engine.ts`. It's a **rule-based heuristic system** (not ML).

**Input:** Method type, rating sliders, drawdown time, brew parameters, previous brews.

**Logic:**
1. Assess extraction level (under/good/over) from sliders using `getExtractionAssessment()`
2. Interpret balance (sour/balanced/bitter) from balance slider using `interpretBalance()`
3. Apply method-specific rules:

**V60 rules:**
- Under-extracted + short drawdown -> grind finer
- Under-extracted + normal drawdown -> increase temperature
- Over-extracted + long drawdown -> grind coarser
- Over-extracted + normal drawdown -> decrease temperature
- Good extraction + low clarity -> grind slightly coarser
- Good extraction + low body -> tighter ratio
- Good extraction + everything good -> keep settings

**Moka rules:**
- Under-extracted -> grind finer + ensure pre-heated water
- Over-extracted -> remove from heat earlier + cool base immediately
- Bitter + low finish -> grind coarser
- Low body -> fill basket completely

Each suggestion has a `primary` and optional `secondary` recommendation with `variable`, `action`, and `rationale`.

---

## Development

### Prerequisites

- Node.js 22+
- pnpm 9+ (`corepack enable pnpm`)
- Docker (for deployment only)

### Setup

```bash
# Install all dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Apply database schema (creates SQLite file)
pnpm db:push

# Seed default methods and settings
pnpm --filter @kissa/api db:seed

# Start all dev servers (API + Web)
pnpm dev
```

This starts:
- **API** at `http://localhost:3001` (hot-reload via tsx)
- **Web** at `http://localhost:3000` (Next.js dev server)

### Useful Commands

```bash
# Build all packages
pnpm build

# Run API tests
pnpm --filter @kissa/api test

# Open Prisma Studio (database GUI)
pnpm --filter @kissa/api db:studio

# Create a new migration
pnpm --filter @kissa/api db:migrate

# Reset database
pnpm --filter @kissa/api db:migrate:reset

# Seed sample coffee data (requires running API)
./seed-coffee-data.sh
```

### Build Order

Turborepo handles the build dependency graph:
1. `@kissa/shared` (no deps)
2. `@kissa/api-client` (depends on `@kissa/shared`)
3. `@kissa/api` (depends on `@kissa/shared`)
4. `@kissa/web` (depends on `@kissa/shared` + `@kissa/api-client`)

---

## Deployment

### How Deployment Works

Images are **built locally** on the dev machine (Mac) for ARM64 and then **transferred to the Raspberry Pi** via SSH. This is much faster than building on the RPi itself (~1 min local vs ~10+ min on RPi).

**Prerequisites:** Docker with ARM64 support (Colima with `--arch aarch64` or Docker Desktop), `expect` for SSH automation.

### One-Click Deploy (Recommended)

```bash
# Deploy everything (builds both images, transfers, starts containers)
./deploy.sh

# Deploy only the API (faster, for backend-only changes)
./deploy.sh --api-only

# Deploy only the Web frontend
./deploy.sh --web-only

# Skip build and redeploy existing images
./deploy.sh --skip-build

# Clean old images on RPi after deploy (saves disk space)
./deploy.sh --clean

# Custom host/credentials
./deploy.sh --rpi-host <your-host> --rpi-user <your-user> --rpi-pass <your-password>
```

**What `deploy.sh` does:**
1. Builds Docker images locally with `--platform linux/arm64`
2. Saves and gzip-compresses the images (~180MB API, ~350MB Web)
3. Transfers to RPi via SSH pipe (scp/sftp not available on HA OS)
4. Stops old containers, loads new images, starts new containers
5. Waits for health checks to pass

**Default connection:** `$RPI_USER@$RPI_HOST` (password in .env)

### Manual Deploy Steps

If you need to deploy manually (or understand what the script does):

```bash
# 1. Build images locally for ARM64
docker build --platform linux/arm64 -f docker/api.Dockerfile -t kissa-api:latest .
docker build --platform linux/arm64 -f docker/web.Dockerfile -t kissa-web:latest .

# 2. Save and compress
docker save kissa-api:latest kissa-web:latest | gzip > /tmp/kissa-images.tar.gz

# 3. Transfer to RPi (scp doesn't work on HA OS, use SSH pipe)
cat /tmp/kissa-images.tar.gz | ssh $RPI_USER@$RPI_HOST 'cat > /tmp/kissa-images.tar.gz'

# 4. Load images on RPi
ssh $RPI_USER@$RPI_HOST 'sudo gunzip -c /tmp/kissa-images.tar.gz | sudo docker load'

# 5. Stop old containers
ssh $RPI_USER@$RPI_HOST 'sudo docker stop kissa-api kissa-web; sudo docker rm kissa-api kissa-web'

# 6. Start new containers
ssh $RPI_USER@$RPI_HOST 'sudo docker run -d \
  --name kissa-api --restart unless-stopped \
  -p 3001:3001 -v kissa-data:/app/data \
  -e DATABASE_URL=file:/app/data/kissa.db \
  -e NODE_ENV=production -e PORT=3001 -e HOST=0.0.0.0 \
  kissa-api:latest'

ssh $RPI_USER@$RPI_HOST 'sudo docker run -d \
  --name kissa-web --restart unless-stopped \
  -p 3000:3000 -e NODE_ENV=production \
  kissa-web:latest'
```

### API Container Startup

The API container runs `/start.sh` on startup which:
1. Runs `prisma migrate deploy` (applies any pending migrations)
2. Seeds default methods and settings via `seed.mjs`
3. Verifies the database has the expected methods
4. Starts the Node.js API server on port 3001

The Prisma client is **pre-generated at build time** for ARM64 (via `--platform linux/arm64`), so no runtime regeneration is needed.

### Docker Files

| File | Purpose |
|------|---------|
| `docker/api.Dockerfile` | API image (Fastify + Prisma + SQLite) |
| `docker/web.Dockerfile` | Web image (Next.js frontend) |
| `docker/api-start.sh` | API container startup script |
| `docker/standalone.Dockerfile` | Single container (API + Web, alternative) |
| `docker/standalone-start.sh` | Standalone startup script |
| `docker/docker-compose.yml` | Docker Compose config (for reference, not used in production) |

### Home Assistant Add-on (Alternative)

The `ha-addon/` directory contains a full Home Assistant add-on:
- Uses HA base images per architecture (aarch64, armv7, amd64)
- Data stored at `/config/kissa/kissa.db` (included in HA backups)
- Integrates with HA sidebar via ingress (panel icon: `mdi:coffee`)
- Uses `bashio` for HA logging integration
- Image registry: `ghcr.io/anner-klein/kissa-addon-{arch}`

To install: Copy `ha-addon/` to HA's `/addons` directory, or add the GitHub repo as a custom repository.

---

## Seed Data

### Default Seeds (Database)

`apps/api/prisma/seed.ts` / `seed.mjs` creates:
- Default Settings (2 servings, 15g/serving)
- Default GrinderState (Comandante C40, setting 20)
- 4 brew methods: V60, Moka Pot, Espresso, French Press (with full recipe params and steps)

### Sample Coffee Data

`seed-coffee-data.sh` seeds realistic coffee data via the API (requires the API to be running):
- 9 roasters (Israel, Netherlands, Spain, Japan)
- 20 beans with origin details, tasting notes, and method-specific recipes

The data source is `coffee-seed-data.json`.

---

## Conventions and Patterns

### Code Organization
- **Route files** export a single async function that registers handlers on a Fastify instance
- **Zod schemas** are defined in `@kissa/shared` and imported by both API (validation) and client (type inference)
- **JSON fields** are always stored as `string | null` in the DB and parsed/serialized in route handlers
- **IDs** are UUIDs generated by Prisma (`@default(uuid())`)
- **Timestamps** use Prisma's `@default(now())` and `@updatedAt`

### Naming
- Route files: lowercase, plural (`roasters.ts`, `beans.ts`)
- Components: PascalCase (`GrinderCard.tsx`, `MethodPicker.tsx`)
- Hooks: camelCase with `use` prefix (`useOnlineStatus`)
- API endpoints: REST-style with plural nouns (`/api/beans`, `/api/brews`)
- Method names in DB: lowercase with underscores (`v60`, `french_press`)

### State Management
- **Server state**: TanStack React Query (fetch, cache, invalidate)
- **Client state**: Zustand with localStorage persistence
- **Offline queue**: Custom queue in `lib/offline-queue.ts` that retries failed operations

### Error Handling
- API returns `{ error: 'ErrorType', message: '...' }` with appropriate HTTP status
- Zod validation errors return 400 with the Zod error message
- Not-found errors return 404

### TypeScript
- Root `tsconfig.json`: ES2022 target, NodeNext module resolution, strict mode
- API uses path aliases (`@/*` -> `./src/*`) resolved at build time by `tsc-alias`
- Web uses Next.js bundler module resolution

---

## Known Quirks and Gotchas

1. **Cross-architecture Prisma**: Docker images are built locally with `--platform linux/arm64`, so the Prisma client is pre-generated for ARM at build time. No runtime regeneration is needed. The standalone Dockerfile still regenerates at startup as a safety net.

2. **Two seed files**: `seed.ts` (TypeScript, for dev) and `seed.mjs` (JavaScript, for production Docker). The `.mjs` version exists because the production container may not have `tsx` available. Keep them in sync.

3. **JSON-in-SQLite**: Many fields store JSON as strings. There's no database-level validation of these JSON structures. The Zod schemas in `@kissa/shared` provide the validation layer.

4. **Singleton pattern**: Settings and GrinderState use a singleton pattern (`id: 'default'`). Route handlers auto-create them if missing.

5. **No authentication**: The app has zero auth. It's designed for a single user on a local network.

6. **Method ordering**: The `GET /api/methods` endpoint sorts methods in a hardcoded order (`v60`, `moka`, `espresso`, `french_press`) defined in the route handler, not the database.

7. **Onboarding page**: There's an onboarding route and page, but the web app doesn't currently auto-redirect to it. The home page works without onboarding.

8. **Mobile app is a scaffold**: The `apps/mobile` directory has package.json and config but minimal actual screens. The web app is the primary interface.

9. **API URL detection**: The `@kissa/api-client` package tries multiple environment variables (`EXPO_PUBLIC_API_URL`, `NEXT_PUBLIC_API_URL`) and falls back to `http://kissa.local:3001`. In development, it always uses `http://localhost:3001`.

10. **Mapbox dependency**: The analytics page uses Mapbox GL for the world map. A Mapbox access token may be needed in production (check the WorldMap component).

11. **No CI/CD**: There are no GitHub Actions or other CI/CD pipelines. Deployment is manual via `deploy.sh`.

12. **pnpm lockfile**: The project uses `pnpm@9.15.0` (specified in `package.json` `packageManager` field). Using a different pnpm version may cause lockfile conflicts.

13. **Brew creation side effect**: `POST /api/brews` automatically updates the grinder state to match the brew's `grindSize` parameter. This is intentional but may be surprising.

14. **Suggestion apply**: When a user accepts a suggestion with `applyTo: 'bag'`, it adjusts the **bean-level** recipe's grinder target by +/- 1 click. The naming is legacy from when recipes were per-bag.

---

## Database Backup

### Overview

Kissa uses a single SQLite database file for all data -- settings, roasters, beans, bags, brew logs, grinder state, and even roaster logos (stored as base64). **The database file is the only thing needed for a full backup.** There are no separate uploaded files or external assets.

### Hidden Backup Endpoint

A hidden backup endpoint exists at:

```
GET /internal/backup/db
```

This endpoint is **not exposed in the UI** and can only be accessed via a direct HTTP call. It:

1. Checkpoints the SQLite WAL to ensure the DB file is fully up to date
2. Streams the database file as a download with a timestamped filename

**Implementation:** `apps/api/src/routes/backup.ts`, registered in `apps/api/src/app.ts` under the `/internal` prefix. No authentication required (acceptable for a self-hosted LAN app).

### How to Download a Backup

From the dev machine (targeting the RPi production server):

```bash
# Use 'command curl' to bypass shell aliases that may interfere
command curl -s -o kissa-backup.db http://<your-rpi-host>:3001/internal/backup/db
```

From the local dev server:

```bash
command curl -s -o kissa-backup.db http://localhost:3001/internal/backup/db
```

**Fallback (direct container access via SSH):**

```bash
# Copy DB out of the API container, then download to local machine
ssh $RPI_USER@$RPI_HOST 'sudo docker cp kissa-api:/app/data/kissa.db /tmp/kissa-backup.db'
ssh $RPI_USER@$RPI_HOST 'cat /tmp/kissa-backup.db' > backups/kissa-backup-$(date +%Y-%m-%d).db
```

The downloaded `.db` file is a standard SQLite database that can be opened with any SQLite client.

### Restoring a Backup

**On the RPi (Docker Compose deployment):**

```bash
# 1. Stop the API container
ssh $RPI_USER@$RPI_HOST 'sudo docker stop kissa-api'

# 2. Copy the backup into the container's volume
ssh $RPI_USER@$RPI_HOST 'sudo docker volume inspect kissa-data'
#    Upload the backup file (scp may not work on HA — use cat pipe):
cat kissa-backup.db | ssh $RPI_USER@$RPI_HOST 'cat > /tmp/kissa-restore.db'
ssh $RPI_USER@$RPI_HOST 'sudo cp /tmp/kissa-restore.db /var/lib/docker/volumes/kissa-data/_data/kissa.db'

# 3. Restart the API container
ssh $RPI_USER@$RPI_HOST 'sudo docker start kissa-api'
```

**In local development:**

```bash
cp kissa-backup.db apps/api/prisma/data/kissa.db
```

Then restart the dev server.

### Database Location Reference

| Environment | DB Path |
|-------------|---------|
| Local dev | `apps/api/prisma/data/kissa.db` |
| Docker Compose (production RPi) | `/app/data/kissa.db` (volume: `kissa-data`, container: `kissa-api`) |
| Docker (standalone) | `/data/kissa.db` (volume: `kissa-data`) |
| HA Add-on | `/config/kissa/kissa.db` |

---

## Agent Instructions

**Agent workflow rules live in `.cursor/rules/` and are automatically applied by Cursor.** The main rule (`kissa-agent.mdc`, always-apply) defines the complete task lifecycle. File-specific rules apply when editing relevant areas.

### Rule Files

| File | Scope | Purpose |
|------|-------|---------|
| `.cursor/rules/kissa-agent.mdc` | Always applies | Task lifecycle, definition of done, deployment workflow, gotchas |
| `.cursor/rules/kissa-api-routes.mdc` | `apps/api/src/**` | Route patterns, validation, testing conventions |
| `.cursor/rules/kissa-web-pages.mdc` | `apps/web/**` | Page patterns, styling, state management |
| `.cursor/rules/kissa-prisma.mdc` | `**/prisma/**` | Schema conventions, migrations, seed files |

### Automation Scripts

| Script | When to Run | What It Does |
|--------|-------------|--------------|
| `./scripts/backup.sh` | Start of every work session | Downloads today's DB backup from production |
| `./scripts/run-tests.sh` | After every code change | Runs all 145+ API integration tests |
| `./scripts/verify-deploy.sh` | After every deployment | Health checks API, methods, endpoints, web app |
| `./deploy.sh --clean` | After tests pass | Builds, transfers, and starts containers on RPi |

### What to Update in This README

Every code change MUST have a corresponding README update:

| Change Type | Section to Update |
|-------------|-------------------|
| Add/remove/rename files | [Monorepo Structure](#monorepo-structure) |
| Add/change API endpoints | [API Endpoints Reference](#api-endpoints-reference) |
| Modify database schema | [Database Schema](#database-schema) |
| Add environment variables | Relevant app's env table in [Apps](#apps) |
| Change deployment config | [Deployment](#deployment) |
| Add packages/dependencies | [Tech Stack](#tech-stack) and [Packages](#packages) |
| Discover new quirks | [Known Quirks and Gotchas](#known-quirks-and-gotchas) |
| Add conventions | [Conventions and Patterns](#conventions-and-patterns) |

### Git Conventions

Use conventional commit prefixes: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `schema:`, `perf:`

- Break work into atomic commits (one concern per commit)
- Typical sequence: schema → API routes → shared packages → web UI → tests → README
- Always `git status` + `git diff` before committing
- Never `git add .` blindly
- Never commit `*.db`, `node_modules/`, `dist/`, `.next/`, `backups/`
- Never force-push unless explicitly asked

### Test Conventions

Tests live in `apps/api/src/__tests__/` organized by domain. Use Vitest with `app.inject()`. Test helpers are in `helpers.ts`. Test happy paths, validation errors (400), not-found (404), edge cases, and side effects. Never `.skip` or `.todo` tests. See the `kissa-api-routes` rule for details.

### Definition of Done

A task is ONLY complete when ALL are true:
1. Code changes implemented
2. README updated
3. Tests written and full suite passes (`./scripts/run-tests.sh`)
4. Deployed to RPi (`./deploy.sh --clean`)
5. Deployment verified (`./scripts/verify-deploy.sh` + manual feature test)
6. Committed with proper git messages

**Do NOT tell the user "done" until every step is complete. Skipping deployment is never acceptable.**
