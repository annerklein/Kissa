# Kissa Coffee Tracker

Track your coffee beans, brews, and dial-in your grinder settings.

## Features

- **Bean Management**: Track coffee beans with origin country, process, roast level, and tasting notes
- **Brew Methods**: Support for V60, Moka Pot, Espresso, and French Press
- **Recipe Tracking**: Save grind settings and parameters for each bean/method combination
- **Brew Logging**: Log your brews with ratings and notes
- **Analytics**: Visualize your coffee origins on a world map
- **Roaster Directory**: Keep track of your favorite roasters

## Access

After installation, you can access Kissa in two ways:

1. **Via Home Assistant sidebar**: Click the "Kissa" icon in the sidebar (if ingress is enabled)
2. **Direct URL**: Navigate to `http://<your-ha-ip>:3000`

## Configuration

| Option | Description | Default |
|--------|-------------|---------|
| `log_level` | Logging verbosity (trace, debug, info, warning, error, fatal) | `info` |

## Data Storage

All data is stored in a SQLite database at `/config/kissa/kissa.db`. This is automatically included in Home Assistant backups.

## API

The API is available at port 3001 for advanced integrations:
- `GET /health` - Health check endpoint
- `GET /api/beans` - List all beans
- `GET /api/methods` - List brewing methods
- And more...

## Support

For issues and feature requests, please visit the GitHub repository.
