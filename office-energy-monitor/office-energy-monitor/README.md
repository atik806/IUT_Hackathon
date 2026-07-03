# Office Energy Monitor — Web Dashboard

A real-time dashboard for monitoring office electrical devices (lights and fans) across 3 rooms. Part of a system where a single backend serves both this web dashboard and a Discord bot.

## Architecture

```
[Simulator Service] → [Supabase DB] → [NestJS API] → [Next.js Dashboard (port 3001)]
                                               → [Discord Bot]
```

- **Shared backend** — The dashboard and Discord bot read from the same API
- **Live updates** — Dashboard polls the backend every 3 seconds for fresh data
- **Dynamic data** — Devices are toggled randomly by the backend simulator every 3–10 seconds

## Prerequisites

- Node.js 18+
- The backend running on `http://localhost:3000`

## Setup

```bash
npm install
```

## Environment

A `.env.local` is already configured:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Run

```bash
npm run dev
```

Opens at [http://localhost:3001](http://localhost:3001).

## Dashboard Features

| Section | Description |
|---------|-------------|
| **Summary Cards** | Total power, devices ON/OFF counts, active alerts |
| **Office Layout** | Visual room view with spinning fans and glowing lights |
| **Live Device Status** | All 18 devices listed per room with ON/OFF badges |
| **Power Meter** | Current wattage, per-room breakdown, daily kWh estimate |
| **Active Alerts** | After-hours warnings, continuous-on detection |

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React (icons)
