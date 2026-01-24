# Kissa - Coffee Brewing Companion

Kissa makes it effortless to brew excellent coffee daily while eliminating grinder re-zero pain and accelerating dial-in per bean/bag with structured learning.

## Features

- **Morning Screen** - Sub-30-second brew selection with method picker and grinder delta preview
- **Brew Screen** - Execute brews with grinder guidance, scaling, and recipe steps
- **Rate & Learn** - Capture feedback and get actionable suggestions to improve
- **Bean Profiles** - Track bags, dial-in settings, and tasting notes comparison
- **World Map Analytics** - Geographic exploration of your coffee origins
- **Offline Support** - Works when your network is down, syncs when back online

## Tech Stack

- **Mobile**: React Native + Expo
- **Web**: Next.js 14 (App Router)
- **API**: Node.js + Fastify + TypeScript
- **Database**: SQLite + Prisma ORM
- **Hosting**: Docker Compose on Raspberry Pi (or cloud)
- **State**: Zustand + TanStack Query

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 9+
- Docker (for deployment)

### Development

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Push database schema
pnpm db:push

# Seed initial data
pnpm --filter @kissa/api db:seed

# Start development servers
pnpm dev
```

This starts:
- API at http://localhost:3001
- Web at http://localhost:3000

### Docker Deployment (Raspberry Pi)

```bash
# Build images
pnpm docker:build

# Start services
pnpm docker:up

# View logs
pnpm docker:logs

# Stop services
pnpm docker:down
```

Access at http://kissa.local:3000 (requires mDNS setup)

## Project Structure

```
kissa/
├── apps/
│   ├── api/          # Fastify API server
│   ├── web/          # Next.js web app
│   └── mobile/       # React Native app (Expo)
├── packages/
│   ├── shared/       # Shared types, utils, constants
│   └── api-client/   # Type-safe API client
├── docker/           # Docker configuration
└── turbo.json        # Turborepo config
```

## Core Concepts

### Entities

- **Roaster** - Coffee roaster/company
- **Bean** - Coffee product (stable, re-buyable)
- **Bag** - Purchase instance with roast date
- **Method** - Brewing method (V60, Moka, etc.)
- **Brew Log** - Record of an actual brew with rating
- **Grinder State** - Current grinder setting (single grinder)

### Grinder Delta

Kissa always shows you how to adjust your grinder:
- "Move +2 coarser" instead of "Set to 22"
- One-tap "Applied" updates the current setting

### Smart Score

Ratings are weighted for coffee quality:
- Balance (25%) - Extraction accuracy
- Sweetness (25%) - Quality indicator
- Clarity (20%) - Clean cup
- Body (15%) - Mouthfeel
- Finish (15%) - Aftertaste

### Suggestions

Rule-based recommendations based on your ratings:
- Sour + low sweetness → Grind finer
- Bitter + long drawdown → Grind coarser
- And more...

## API Endpoints

### Settings & Grinder
- `GET/PATCH /api/settings` - User settings
- `GET/POST /api/grinder/apply` - Grinder state

### Beans & Bags
- `GET/POST /api/roasters` - Roasters
- `GET/POST /api/beans` - Beans
- `POST /api/beans/:id/bags` - Add bag to bean
- `GET /api/available-beans` - Available rotation

### Brews
- `GET/POST /api/brews` - Brew logs
- `GET /api/brews/screen` - Brew screen data
- `PATCH /api/brews/:id/rating` - Submit rating

### Analytics
- `GET /api/analytics/map` - World map data
- `GET /api/analytics/country/:code` - Country drilldown

## Environment Variables

### API
```
DATABASE_URL=file:./data/kissa.db
PORT=3001
HOST=0.0.0.0
```

### Web
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## License

MIT
