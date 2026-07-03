# Office Monitoring System

A NestJS backend that simulates and monitors office electrical devices (lights and fans) across 3 rooms, serving both a web dashboard API and a Discord bot from a single shared backend with Supabase.

## Architecture

```
[Simulator Service] → [Supabase DB + Realtime] → [NestJS REST API] → [Web Dashboard (future)]
                                              → [Discord Bot] → [Discord Server]
```

- **Single backend** — The web API and Discord bot share the same NestJS services
- **Supabase** — Primary data store with Realtime subscriptions for live updates
- **Simulated data** — 15 devices (2 fans + 3 lights per room × 3 rooms) auto-toggle every 60 seconds

## Prerequisites

- Node.js 18+
- Supabase project (free tier)
- Discord bot token + server (for bot features)
- Groq API key (optional — for LLM-powered Discord responses)

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema in `docs/supabase-schema.sql`
3. Go to **Project Settings → API** and copy the `Project URL` and `anon public key`
4. In the Supabase dashboard, go to **Realtime** and ensure replication is enabled for `devices`, `alerts`, and `usage_logs` tables (the schema script does this automatically)

### 3. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a **New Application**, name it (e.g., "Office Monitor")
3. Go to **Bot** tab → **Add Bot**
4. Under **Privileged Gateway Intents**, enable:
   - `MESSAGE CONTENT INTENT`
   - `SERVER MEMBERS INTENT`
5. Copy the bot token
6. Go to **OAuth2 → URL Generator**, select:
   - Scopes: `bot`
   - Bot Permissions: `Send Messages`, `Read Messages`, `Read Message History`
7. Use the generated URL to invite the bot to your server
8. Copy the channel ID where you want alerts: right-click the channel → **Copy Channel ID** (needs Developer Mode enabled in Discord settings)

### 4. Environment Variables

Copy `.env` and fill in your values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
DISCORD_BOT_TOKEN=your-bot-token
DISCORD_ALERT_CHANNEL_ID=your-channel-id
GROQ_API_KEY=your-groq-api-key
PORT=3000
```

If `DISCORD_BOT_TOKEN` is empty, the app runs without the Discord bot. If `GROQ_API_KEY` is empty, the bot uses templated fallback responses.

### 5. Run

```bash
# development
npm run start:dev

# production
npm run build && npm run start:prod
```

On first start, the app auto-seeds:
- 3 rooms (Drawing Room, Work Room 1, Work Room 2)
- 15 devices (2 fans + 3 lights per room, all OFF)
- 2 employee records (Nafisa Rahman, Tanvir Hossain)

The simulator then begins randomly toggling devices every 60 seconds.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/devices` | All 15 devices with room info |
| `GET` | `/api/devices/room/:roomName` | Devices by room (name or alias: `drawing`, `work1`, `work2`) |
| `GET` | `/api/usage` | Total + per-room power breakdown |
| `GET` | `/api/usage/history?hours=24` | Historical usage logs |
| `GET` | `/api/alerts` | Active alerts only |
| `GET` | `/api/employees` | Employee list |

## Discord Bot Commands

| Command | What it does |
|---------|-------------|
| `!status` | Shows on/off status for all 3 rooms |
| `!room <name>` | Status of a specific room (`drawing`, `work1`, `work2`) |
| `!usage` | Current power consumption + estimated daily kWh |

Responses are generated via Groq LLM (if configured) for natural conversational tone, with a template fallback.

**Bonus — Proactive Alerts**: The bot watches Supabase Realtime for new alerts and posts them to the configured channel automatically (e.g., "🚨 Work Room 2 still has devices ON after hours!").

## Project Structure

```
src/
├── main.ts                       # Entry point
├── app.module.ts                 # Root module
├── config/env.ts                 # Environment variable loader
├── supabase/supabase.service.ts   # Supabase client + Realtime subscriptions
├── common/
│   ├── types.ts                  # TypeScript interfaces
│   └── constants.ts              # Room/device definitions, office hours
├── seed/seed.service.ts          # Auto-seeds rooms, devices, employees
├── devices/
│   ├── devices.service.ts        # Device CRUD + room summaries
│   └── devices.controller.ts     # REST endpoints
├── simulator/simulator.service.ts # Random device toggling + usage logging
├── usage/
│   ├── usage.service.ts          # Power calculation + history
│   └── usage.controller.ts
├── alerts/
│   ├── alerts.service.ts         # After-hours + continuous-on detection
│   └── alerts.controller.ts
├── employees/
│   ├── employees.service.ts
│   └── employees.controller.ts
└── discord/discord.service.ts    # Discord bot client + commands
```

## Diagrams

- **System diagram**: See `docs/system-diagram.md`
- **Electrical schematic guide**: See `docs/schematic.md`
- **Supabase schema**: See `docs/supabase-schema.sql`

## Evaluation Checklist

- [x] Single backend shared by web API and Discord bot
- [x] 15 simulated devices across 3 rooms (2 fans + 3 lights each)
- [x] Real-time Supabase Realtime for live data push
- [x] Simulator toggles devices every 60s
- [x] Discord bot with !status, !room, !usage commands
- [x] LLM-powered conversational responses (Groq)
- [x] Proactive alert posting to Discord
- [x] After-hours device detection
- [x] Continuous-on (>2h) detection
- [x] Per-room + total power consumption
- [x] Daily kWh estimation
