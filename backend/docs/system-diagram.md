# System Diagram

This diagram shows the complete data flow from simulated devices through to the web dashboard and Discord bot.

## Instructions

Create this diagram using any tool (draw.io, Excalidraw, Lucidchart, pen & paper). Save it as `docs/system-diagram.png` and include it in your repo.

## Text Representation

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SIMULATED DEVICE LAYER                         │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                 Simulator Service (NestJS)                    │   │
│  │  - Randomly toggles 18 devices every 3-10 seconds            │   │
│  │  - Tracks: status (on/off), power_draw (W), last_changed     │   │
│  │  - Writes usage_logs snapshots                                │   │
│  └────────────────────┬────────────────────────────────────────┘   │
│                       │                                            │
│              ┌────────┴────────┐                                   │
│              │   Supabase DB    │                                   │
│              │  (PostgreSQL)    │                                   │
│              │  - rooms         │                                   │
│              │  - devices       │                                   │
│              │  - alerts        │                                   │
│              │  - usage_logs    │                                   │
│              │  - employees     │                                   │
│              └────────┬────────┘                                   │
│                       │                                            │
│              ┌────────┴────────┐                                   │
│              │ Supabase        │                                   │
│              │ Realtime        │                                   │
│              │ (broadcasts     │                                   │
│              │  changes)       │                                   │
│              └────────┬────────┘                                   │
└───────────────────────┼─────────────────────────────────────────────┘
                        │
          ┌─────────────┼─────────────────────┐
          │             │                     │
          ▼             ▼                     ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐
│  REST API        │ │  Supabase       │ │  Discord Bot            │
│  (NestJS Ctrlrs) │ │  Realtime       │ │  (discord.js, same      │
│                  │ │  Client         │ │   NestJS process)       │
│  GET /api/devices│ │  (frontend      │ │                         │
│  GET /api/usage  │ │   subscribes)   │ │  !status → room summary │
│  GET /api/alerts │ │                 │ │  !room   → room status  │
│  GET /api/rooms  │ │  Live updates   │ │  !usage  → power usage  │
│  GET /api/employees│ │ (no refresh)   │ │                         │
│                  │ │                 │ │  Proactive alerts       │
└────────┬────────┘ └────────┬────────┘ │  (Realtime subscription) │
         │                   │           └─────────────┬───────────┘
         │                   │                         │
         ▼                   ▼                         ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐
│  Web Dashboard   │ │  Live Dashboard │ │  Discord Channel        │
│  (React SPA)     │ │  Updates        │ │  - Commands: !status    │
│  - Device panel  │ │  (auto-refresh) │ │  - Alert announcements  │
│  - Power meter   │ │                 │ │                         │
│  - Alerts panel  │ │                 │ │                         │
│  - Floor plan    │ │                 │ │                         │
└─────────────────┘ └─────────────────┘ └─────────────────────────┘
```

## Data Flow

1. **Simulator** (in-app service) randomly toggles device states and writes to Supabase
2. **Supabase** stores the current state and broadcasts changes via Realtime
3. **REST API** serves current state on demand
4. **Web Dashboard** (future) subscribes to Realtime for instant updates + polls APIs for initial state
5. **Discord Bot** calls the same service methods as the REST API, ensuring consistency
6. **Proactive Alerts**: Both the dashboard (future) and Discord bot subscribe to the `alerts` Realtime channel

## Key Design Principle

> **Single Source of Truth**: Supabase is the authoritative data store. All reads and writes go through it. The REST API and Discord bot use the same service classes. There is no separate cache — the Realtime subscription ensures all clients see the same live data.
