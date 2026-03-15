# unifi-radius-client

A TypeScript client library for managing RADIUS users via the UniFi Cloud API. Includes a CLI tool.

## Setup

```bash
npm install
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `UNIFI_API_KEY` | Yes | Generate from [unifi.ui.com](https://unifi.ui.com) → Account Settings → API |
| `UNIFI_HOST_ID` | Conditional | Console Host ID (required for all commands except `list-hosts`) |
| `UNIFI_SITE` | No | Site name (default: `default`) |

## CLI

```bash
# List hosts to find your Host ID
npm run cli -- list-hosts

# List RADIUS users
npm run cli -- list-users

# Create a RADIUS user
npm run cli -- create-user <name> <password>
npm run cli -- create-user <name> <password> <VLAN>

# List RADIUS profiles
npm run cli -- list-profiles <siteId>
```

## Library Usage

```typescript
import { UnifiClient } from "unifi-radius-client";

const client = new UnifiClient({
  apiKey: "your-api-key",
  hostId: "your-host-id",
  site: "default",
});

// Or create from environment variables
// const client = UnifiClient.fromEnv();

// List RADIUS users
const users = await client.listRadiusUsers();

// Create a RADIUS user
const created = await client.createRadiusUser("user1", "pass123");

// Create with VLAN assignment
const withVlan = await client.createRadiusUser("user2", "pass456", 100);

// List hosts (does not require Host ID)
const hosts = await client.listHosts();

// List RADIUS profiles
const profiles = await client.listRadiusProfiles("site-uuid");
```

## File Structure

```
src/
  types.ts    Type definitions
  client.ts   API client (UnifiClient)
  cli.ts      CLI entry point
```

## API Reference

- **List Hosts**: Site Manager API `GET /v1/hosts`
- **RADIUS Profiles**: Network API v1 `GET /v1/sites/{siteId}/radius/profiles`
- **RADIUS Users**: Legacy API `GET/POST /api/s/{site}/rest/account` (via Cloud Connector)

All requests are proxied to the console through the Cloud Connector at `https://api.ui.com`.

## License

MIT
