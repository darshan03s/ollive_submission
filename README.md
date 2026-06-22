# Chatio

AI chatbot with a lightweight inference-logging SDK and ingestion pipeline. Chat messages and inference telemetry are stored in PostgreSQL; logs flow through a BullMQ-backed ingest service with PII redaction.

**Live demo**: https://chatio-nu.vercel.app

**Architecture notes**: [ARCHITECTURE.md](./ARCHITECTURE.md) — ingestion flow, logging strategy, failure handling, scaling.

## Architecture overview

```
┌─────────────┐     stream      ┌──────────────────┐     API      ┌─────────────┐
│   Browser   │ ──────────────► │  Next.js (web)   │ ───────────► │ AI Gateway  │
│  /dashboard │                 │  /api/chat       │              │  (models)   │
└─────────────┘                 └────────┬─────────┘              └─────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
             ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
             │  PostgreSQL  │    │ SDK wrapper  │    │  PostgreSQL  │
             │ conversations│    │ POST /ingest │    │ inference_   │
             │ + messages   │    └──────┬───────┘    │ events       │
             └──────────────┘           │            └──────▲───────┘
                                        ▼                   │
                              ┌──────────────────┐          │
                              │ Express (ingest) │          │
                              │ validate + redact│          │
                              └────────┬─────────┘          │
                                       │ enqueue            │
                                       ▼                    │
                              ┌──────────────────┐   persist│
                              │ Redis + BullMQ   │ ─────────┘
                              │ worker           │
                              └──────────────────┘
```

### Packages

| Package  | Role                                                             |
| -------- | ---------------------------------------------------------------- |
| `web`    | Next.js chat UI, dashboard, chat API, SDK wrapper                |
| `ingest` | Express ingest API + BullMQ worker (same service, two processes) |
| `db`     | Drizzle schema, migrations, shared repository layer              |

### Ingestion flow

1. `web` calls the SDK around each `streamText` invocation.
2. On finish, error, or abort, the SDK POSTs inference metadata to `ingest` (`/ingest`).
3. Ingest validates the payload with Zod, redacts PII in previews, and enqueues a BullMQ job.
4. The worker persists the event to `inference_events`.

Logging is **fire-and-forget**: chat streaming does not wait on ingest. If ingest is down, the SDK logs a warning and skips the event.

## Tech stack

- **pnpm workspaces** — monorepo (`web`, `ingest`, `db`)
- **Next.js** — web app and API routes
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Zod** — request validation
- **T3 Env** — environment variable validation
- **AI SDK** + Vercel AI Gateway — multi-provider models
- **TanStack Query** — client data fetching
- **PostgreSQL** + **Drizzle ORM**
- **Express.js** — ingest API
- **BullMQ** + **Redis** — event queue between ingest API and worker
- **Docker Compose** — one-command local stack

## Features

### Chatbot (`web`)

- **Multi-provider models**: GPT-4o, GPT-4.1, Claude 3 Haiku, Gemini 2.5 Flash Lite, Grok 4.1 Fast, Llama 3.1 70B
- **Multi-turn conversations** with full message history loaded from the database
- **List, resume, and delete** conversations from the sidebar
- **Streaming responses** via AI SDK `useChat`
- **Cancel in-flight generation** (stop button → abort signal → `aborted` inference status)
- **Inference dashboard** at `/dashboard`: latency (avg + p95), throughput, error rate, model breakdown, recent logs

### SDK wrapper (`web/src/sdk`)

Wraps `streamText` and emits one inference log per request:

```ts
const result = await sdk(model, messages, userInput, conversationId, req.signal)
```

Captured metadata: provider, model, token usage, start/end timestamps, time-to-first-token latency, request status (`success` | `error` | `aborted`), conversation ID, and ~200-word input/output previews.

### Ingestion (`ingest`)

- Receive inference logs at `POST /ingest`
- Validate with Zod
- PII redaction on previews (email, SSN, credit card, phone, IP — regex-based)
- Enqueue to BullMQ; worker writes to PostgreSQL

## Database schema

Three tables: chat data (`conversations`, `messages`) and telemetry (`inference_events`).

```ts
// db/src/schema.ts (abbreviated)
inference_events // uuid id, conversation_id, provider, model, latency_ms,
// token counts, input/output previews, timestamps, status

conversations // text id, user_id, title, created_at

messages // text id, conversation_id (FK, cascade delete),
// role, parts (jsonb), metadata (jsonb), created_at
```

### Schema design decisions

- **Separate `inference_events` from `messages`** — telemetry is append-only and decoupled from chat persistence. Ingest can record a failed or aborted run even if message save fails.
- **No FK from `inference_events` to `conversations`** — loose coupling so logging never blocks on chat state.
- **`messages.parts` as JSONB** — stores AI SDK UI message shape (text parts, future tool parts) without schema churn.
- **Text IDs for conversations/messages** — client-generated (`nanoid`) before the first API call; UUIDs for inference events (server-generated).
- **Preview fields, not full payloads** — input/output previews are truncated in the SDK (~200 words) to limit storage and PII surface area; full text lives in `messages` when the chat succeeds.
- **`inference_status` enum** — distinguishes user aborts from provider errors for dashboard metrics.

## Tradeoffs

- **Ingest API and worker share one deployable service** — started together via `concurrently` (two Node processes, not separate containers). Simple to run locally and on Render; harder to scale workers independently.
- **No real authentication** — a `userId` is generated in `localStorage` and sent as `X-User-Id`. Fine for a demo; not suitable for production.
- **Fire-and-forget logging** — chat never blocks on ingest, but logs can be lost if ingest is unavailable.
- **Regex PII redaction** — fast and simple; not as robust as a dedicated PII service.
- **In-app metrics aggregation** — dashboard queries raw `inference_events` and aggregates in the API. Works at demo scale; would need pre-aggregation or a metrics store at higher volume.

## What I would improve with more time

- Proper authentication (sessions or OAuth)
- Decouple ingest API and worker into separate deployables
- Dead-letter queue and ingest retry from the web SDK
- Pre-aggregated metrics (materialized views or time-series DB)
- More responsive mobile layout

## Prerequisites

- **Node.js** 22+
- **pnpm** 10+ (`corepack enable`)
- For local dev without full Docker: **PostgreSQL** 17+ and **Redis** 7+

## Setup

### 1. Clone and install

```bash
git clone https://github.com/darshan03s/ollive_submission chatio
cd chatio
pnpm install:all
```

### 2. Environment variables

**`db/.env`**

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5433/ollive
```

**`ingest/.env`**

```bash
INGEST_SERVICE_CORS_ORIGIN=http://localhost:3000
REDIS_URL=redis://localhost:6378
DATABASE_URL=postgres://postgres:postgres@localhost:5433/ollive
NODE_ENV=development
```

**`web/.env`**

```bash
AI_GATEWAY_API_KEY=your_gateway_key
DATABASE_URL=postgres://postgres:postgres@localhost:5433/ollive
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
INGEST_SERVICE_URL=http://localhost:3001
```

> Port **5433** (Postgres) and **6378** (Redis) match the Docker Compose defaults below. Use `5432` / `6379` if you run Postgres and Redis natively.

### 3. Start infrastructure

**Option A — Docker for Postgres + Redis only** (recommended for local dev):

```bash
docker compose up postgres redis -d
```

**Option B — Full stack via Docker** (see [Docker Compose](#docker-compose-one-command) below).

### 4. Run migrations

```bash
pnpm --filter db migrate
```

### 5. Start apps

Ingest (API + worker):

```bash
pnpm --filter ingest dev
```

Web:

```bash
pnpm --filter web dev
```

Open http://localhost:3000. Dashboard: http://localhost:3000/dashboard.

## Docker Compose (one command)

Builds all packages and starts Postgres, Redis, migrations, ingest, and web.

Create **`.env.local`** at the repo root:

```bash
AI_GATEWAY_API_KEY=your_gateway_key
```

Then:

```bash
docker compose --env-file .env.local up --build
```

Services:

| Service  | URL / port            |
| -------- | --------------------- |
| Web      | http://localhost:3000 |
| Ingest   | http://localhost:3001 |
| Postgres | `localhost:5433`      |
| Redis    | `localhost:6378`      |

Migrations run automatically via the `migrate` service before ingest and web start.

## Deployment

| Component | Platform                               | Notes                                                                                                     |
| --------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `web`     | [Vercel](https://chatio-nu.vercel.app) | Set `AI_GATEWAY_API_KEY`, `DATABASE_URL`, `INGEST_SERVICE_URL`, `APP_URL`, `NEXT_PUBLIC_APP_URL`          |
| `ingest`  | Render                                 | Set `DATABASE_URL`, `REDIS_URL`, `INGEST_SERVICE_CORS_ORIGIN` (production web URL), `NODE_ENV=production` |
| Database  | Managed Postgres                       | Shared by web and ingest                                                                                  |
| Redis     | Managed Redis                          | Required for BullMQ                                                                                       |

`INGEST_SERVICE_URL` on Vercel must point to the public ingest service URL. `INGEST_SERVICE_CORS_ORIGIN` on ingest must match the Vercel app URL.

## Project structure

```
ollive/
├── web/          # Next.js app (chat UI, dashboard, SDK, API routes)
├── ingest/       # Express ingest API + BullMQ worker
├── db/           # Drizzle schema, migrations, repositories
├── docker-compose.yml
└── Dockerfile    # Multi-stage build for web and ingest
```
