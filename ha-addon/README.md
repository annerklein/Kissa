# Kissa Coffee Tracker — Home Assistant Add-on

A Home Assistant add-on for [Kissa](../README.md), the self-hosted coffee brewing companion. Integrates directly into the HA sidebar for quick access to your brew dashboard.

## Installation

### From GitHub Repository

1. In Home Assistant, go to **Settings** → **Add-ons** → **Add-on Store**
2. Click **⋮** (top right) → **Repositories**
3. Add: `https://github.com/anner-klein/kissa`
4. Refresh, then install **Kissa Coffee Tracker** from the store

### Local Install (Development)

```bash
scp -r ha-addon/* root@<your-ha-ip>:/addons/kissa/
```

Then in HA: **Settings** → **Add-ons** → **Add-on Store** → **⋮** → **Check for updates** → install from Local add-ons.

## Ports

| Port | Service |
|------|---------|
| 3000 | Web UI  |
| 3001 | API     |

## Data & Backups

All data is stored in a single SQLite file at `/config/kissa/kissa.db`. This path is inside Home Assistant's config directory, so it is **automatically included in HA backups**.

You can also download a backup manually:

```bash
curl -o kissa-backup.db http://<your-ha-ip>:3001/internal/backup/db
```

## Supported Architectures

| Architecture | Platform |
|--------------|----------|
| `aarch64`    | Raspberry Pi 4/5 (64-bit) |
| `armv7`      | Raspberry Pi 3/4 (32-bit) |
| `amd64`      | Intel / AMD x86_64 |

## Configuration

| Option | Description | Default |
|--------|-------------|---------|
| `log_level` | Logging verbosity | `info` |

Valid log levels: `trace`, `debug`, `info`, `warning`, `error`, `fatal`

## Directory Structure

```
ha-addon/
├── repository.yaml       # Repository metadata for HA
└── kissa/
    ├── config.yaml       # Add-on configuration
    ├── Dockerfile        # Multi-arch container build
    ├── run.sh            # Container entrypoint
    ├── build.yaml        # Per-architecture build settings
    ├── DOCS.md           # User-facing documentation
    └── CHANGELOG.md      # Version history
```

## Resources

- [Main project README](../README.md)
- [User documentation](kissa/DOCS.md)
- [Changelog](kissa/CHANGELOG.md)
