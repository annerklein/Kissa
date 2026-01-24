# Kissa Coffee Tracker - Home Assistant Add-on

This directory contains the Home Assistant add-on for Kissa Coffee Tracker.

## Installation

### Option 1: Local Add-on (Recommended for development)

1. Copy the `ha-addon` folder to your Home Assistant's `/addons` directory:
   ```bash
   scp -r ha-addon/* root@<HA_IP>:/addons/kissa/
   ```

2. In Home Assistant:
   - Go to **Settings** → **Add-ons** → **Add-on Store**
   - Click the **⋮** menu (top right) → **Check for updates**
   - The "Kissa Coffee Tracker" should appear under "Local add-ons"

3. Click on it and hit **Install**

### Option 2: GitHub Repository

1. Push this repository to GitHub

2. In Home Assistant:
   - Go to **Settings** → **Add-ons** → **Add-on Store**
   - Click the **⋮** menu → **Repositories**
   - Add: `https://github.com/<your-username>/kissa-ha-addon`

3. The add-on will appear in the store

## Required Files

Before installing, add these image files to the `kissa/` directory:

- `icon.png` - 128x128 pixel icon for the add-on store
- `logo.png` - 256x256 pixel logo (optional)

You can use the Kissa logo from `apps/web/public/` or create new ones.

## Directory Structure

```
ha-addon/
├── repository.yaml      # Repository metadata
├── README.md            # This file
└── kissa/
    ├── config.yaml      # Add-on configuration
    ├── Dockerfile       # Container build instructions
    ├── run.sh           # Startup script
    ├── build.yaml       # Build settings per architecture
    ├── CHANGELOG.md     # Version history
    ├── DOCS.md          # User documentation
    ├── icon.png         # Add-on icon (add manually)
    └── logo.png         # Add-on logo (add manually)
```

## Ports

| Port | Description |
|------|-------------|
| 3000 | Web UI |
| 3001 | API |

## Data Persistence

All data is stored at `/config/kissa/kissa.db` and is automatically included in Home Assistant backups.
