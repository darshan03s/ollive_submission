# Architecture Notes

Brief technical overview of Chatio: how inference logs move through the system, how logging is designed, what we assume about failures, and how the stack would scale.

See also [README.md](./README.md) for setup and schema rationale.

## System context

Chatio has two parallel paths that share PostgreSQL but are otherwise independent:

| Path          | Purpose                                            | Critical path?                        |
| ------------- | -------------------------------------------------- | ------------------------------------- |
| **Chat**      | User message → model stream → save messages        | Yes — user experience depends on this |
| **Telemetry** | SDK → ingest → queue → worker → `inference_events` | No — observability only               |

```
                    CHAT PATH                          TELEMETRY PATH
                    ─────────                          ──────────────

Browser ──POST /api/chat──► Next.js ──streamText──► AI Gateway
                              │                         │
                              │ onFinish                │ onFinish / onError / onAbort
                              ▼                         ▼
                         messages table            SDK POST /ingest
                                                         │
                                                         ▼
                                                    Express ingest
                                                         │
                                                         ▼
                                                    Redis (BullMQ)
                                                         │
                                                         ▼
                                                    Worker ──► inference_events
```

**Deployment split**

- `web` on Vercel — serverless Next.js, talks to AI Gateway, Postgres, and ingest over HTTP.
- `ingest` on Render — long-lived Node process running Express API + BullMQ worker (`concurrently`).
- Managed Postgres — shared by web (chat + metrics queries) and ingest worker (log writes).
- Managed Redis — BullMQ backend only; not on the chat critical path.

## Ingestion flow

End-to-end sequence for one inference request:

1. **Chat API** (`web/src/app/api/chat/route.ts`) receives `messages`, `model`, `userInput`, `conversationId`, and passes `req.signal` for cancellation.
2. **SDK** (`web/src/sdk/index.ts`) wraps AI SDK `streamText` and builds a `logObj` at request start.
3. **Streaming** — model tokens stream to the browser. `onChunk` records **time-to-first-token** as `latencyMs` (first chunk only).
4. **Terminal event** — exactly one of:
   - `onFinish` → `status: success`, populate provider/model/tokens/output preview
   - `onError` → `status: error`
   - `onAbort` → `status: aborted` (user clicked stop or client disconnected)
5. **SDK emit** — `fetch(INGEST_SERVICE_URL/ingest)` with JSON body. No `await`; errors caught in `.catch()`.
6. **Ingest API** (`ingest/src/router/ingest.ts`):
   - `InferenceCompletedEventSchema.safeParse` — reject invalid payloads with `400 VALIDATION_ERROR`
   - `redactPii` on `inputPreview` and `outputPreview`
   - `inferenceQueue.add('store-inference', event)` — job enqueued to Redis
   - Respond `200 SUCCESS` once Redis accepts the job (not after DB write)
7. **Worker** (`ingest/src/worker/inference-worker.ts`) — `inferenceEventsRepository.create(job.data)` inserts into Postgres.

**Near real-time** — logs are sent as soon as the stream ends (or fails/aborts), not batched. The queue adds a small buffer between API response and durable storage.

**Event payload** (validated by Zod in ingest, built by SDK):

| Field                                        | Source                                     |
| -------------------------------------------- | ------------------------------------------ |
| `conversationId`                             | Chat request                               |
| `provider`, `model`                          | AI SDK `onFinish` model metadata           |
| `inputTokens`, `outputTokens`, `totalTokens` | AI SDK usage (nullable on error/abort)     |
| `inputPreview`, `outputPreview`              | First ~200 words; redacted again at ingest |
| `startTimestamp`, `endTimestamp`             | ISO strings from SDK                       |
| `latencyMs`                                  | Time to first streamed chunk               |
| `status`                                     | `success` \| `error` \| `aborted`          |

## Logging strategy

### What gets logged

- **Inference telemetry** — one row per chat API invocation, regardless of outcome. Stored in `inference_events`.
- **Chat content** — full user/assistant messages in `messages` only when streaming **finishes successfully** (`onFinish` in chat route). Errors and aborts do not persist assistant output.
- **Application logs** — `console` in SDK, ingest router, and worker (`morgan` on ingest). No centralized log aggregator in this demo.

### What is not logged

- Full prompts/responses in inference events (previews only).
- Per-chunk streaming data.
- User identity in inference events (only `conversationId`).

### Design principles

1. **Telemetry off the critical path** — `fetch` to ingest is fire-and-forget. Chat latency and availability do not depend on ingest.
2. **Single emit per request** — one POST at terminal state, not per token. Keeps ingest volume predictable.
3. **Defense in depth for PII** — previews truncated in SDK; regex redaction at ingest before queue and DB.
4. **Decoupled schemas** — `inference_events` has no FK to `conversations`, so logging never waits on chat rows existing.

### SDK failure behavior

```ts
fetch(...).catch((error) => {
  if (error?.cause?.code === 'ECONNREFUSED') {
    console.warn('[sdk] Ingest service unavailable; skipping inference log')
    return
  }
  console.error('[sdk] Failed to send inference data:', error)
})
```

- No retry queue on the web side.
- No backpressure — failed logs are dropped silently (aside from console).
- Assumption: acceptable for a demo; production would need client-side retry or a local buffer.

## Event-based architecture

BullMQ decouples **accepting** a log from **persisting** it:

```
Producer: ingest API (inferenceQueue.add)
Consumer: inferenceWorker (queue name: inference-events)
Broker:   Redis
```

**Why a queue**

- Ingest API returns quickly after Redis ACK; slow Postgres writes do not block HTTP.
- Worker can be scaled independently in production (multiple consumers, same queue).
- Natural place to add retries, dead-letter queues, and backpressure later.

**Current worker config** — default BullMQ settings (automatic retries on job failure, no custom DLQ). Failed jobs are logged via `worker.on('failed')`.

## Chat path (separate from ingest)

1. User submits message via `useChat` → `POST /api/chat`.
2. Full message history is sent each turn (multi-turn context from client state + DB reload on resume).
3. Stream returned as UI message stream; client renders incrementally.
4. **Cancel** — stop button calls `useChat().stop()`, which aborts the request; `req.signal` propagates to `streamText` and SDK `onAbort`.
5. **Persist** — on successful `onFinish`, user and assistant messages inserted via `messagesRepository`. No transaction linking message save to inference log.

**User scoping** — `userId` from `localStorage`, sent as `X-User-Id` on conversation APIs. Not validated against a session store; any client can claim any ID.

## Dashboard and metrics

Route: `/dashboard` → `GET /api/metrics?range=1h|24h|7d|30d`

1. Load all `inference_events` in the time window from Postgres (`getInRange`).
2. Aggregate in-process (`web/src/lib/metrics.ts`): time buckets, avg/p95 latency, throughput (requests per bucket), error rate, per-model breakdown.
3. Recent raw logs via `GET /api/inference-events?limit=50`.

Metrics are **computed on read**, not pre-aggregated. Fine for demo volume; becomes a bottleneck as `inference_events` grows.

## PII redaction

Applied in ingest only, on preview fields, before enqueue:

| Pattern                    | Replacement              |
| -------------------------- | ------------------------ |
| Email                      | `[REDACTED_EMAIL]`       |
| SSN (`XXX-XX-XXXX`)        | `[REDACTED_SSN]`         |
| Credit card (13–16 digits) | `[REDACTED_CREDIT_CARD]` |
| Phone                      | `[REDACTED_PHONE]`       |
| IPv4                       | `[REDACTED_IP]`          |

Heuristic regex — fast, no external service. False positives/negatives possible. Full message text in `messages` is **not** redacted at write time.

## Failure handling assumptions

What the system does today and what we assume is acceptable.

### Chat / AI Gateway

| Failure                     | Behavior                                                 | Data impact                                |
| --------------------------- | -------------------------------------------------------- | ------------------------------------------ |
| Model error                 | User sees error toast; SDK logs `error` event            | No assistant message saved                 |
| Rate limit (`RetryError`)   | User-friendly message                                    | Inference log if `onError` fires           |
| User cancel / disconnect    | Stream stops; SDK logs `aborted`                         | No assistant message saved                 |
| DB save fails on `onFinish` | Stream already completed; save errors unhandled in route | User may see response but messages missing |

### SDK → Ingest

| Failure                             | Behavior                               | Data impact          |
| ----------------------------------- | -------------------------------------- | -------------------- |
| Ingest down (`ECONNREFUSED`)        | Warning logged; chat continues         | Inference event lost |
| Network / timeout                   | Error logged                           | Inference event lost |
| Invalid payload (should not happen) | Ingest returns 400; SDK does not retry | Inference event lost |

### Ingest API

| Failure             | Behavior                    | Data impact                             |
| ------------------- | --------------------------- | --------------------------------------- |
| Zod validation fail | `400 VALIDATION_ERROR`      | Event rejected                          |
| Redis unavailable   | Request throws; Express 500 | Event lost; client already disconnected |
| Success path        | `200` after queue add       | Event durable in Redis                  |

### Worker / Postgres

| Failure       | Behavior                              | Data impact                              |
| ------------- | ------------------------------------- | ---------------------------------------- |
| Insert fails  | BullMQ retries (default policy)       | Eventually DLQ or exhausted retries      |
| Postgres down | Jobs pile in Redis until memory limit | Logs delayed, not lost if Redis survives |

### Cross-service

- **No distributed transactions** between chat save and inference log — either can succeed alone.
- **No idempotency key** — duplicate POSTs would create duplicate rows (not expected in normal flow).
- **CORS** — ingest only allows `INGEST_SERVICE_CORS_ORIGIN`; server-side `fetch` from Next.js bypasses browser CORS.

## Scaling considerations

### What scales easily

| Component          | Approach                                                            |
| ------------------ | ------------------------------------------------------------------- |
| **Web (Vercel)**   | Serverless auto-scaling; stateless API routes                       |
| **Ingest API**     | Horizontal replicas behind load balancer; all enqueue to same Redis |
| **Workers**        | Multiple BullMQ consumers on `inference-events` queue               |
| **Redis**          | Managed Redis with persistence for queue durability                 |
| **Postgres reads** | Read replicas for metrics/dashboard if query load grows             |

### Current bottlenecks

1. **Metrics API** — full table scan + in-memory aggregation per dashboard request. Mitigation: materialized views, time-series DB (Timescale, ClickHouse), or rollups.
2. **Single ingest deploy** — API and worker bundled; scaling API replicas also scales workers unless split.
3. **Chat context** — entire history sent each turn; long conversations increase token cost and latency (no summarization or windowing yet).
4. **Postgres write rate** — one insert per inference event; fine at moderate QPS; partition `inference_events` by time at high volume.

### Order of scale-out (recommended)

1. Split ingest API and worker into separate deployables.
2. Add worker replicas + Redis cluster.
3. Pre-aggregate metrics or move telemetry to an analytics store.
4. SDK-side retry buffer or dead-letter topic for lost ingest calls.

## Security assumptions (demo scope)

- No authentication — `X-User-Id` is client-provided.
- Ingest endpoint is unauthenticated — relies on network placement and CORS for browser; server-side calls from Vercel are the primary producer.
- `AI_GATEWAY_API_KEY` only on web server, never exposed to browser.
- Inference previews may still contain PII after regex redaction.

Not suitable for production without auth, ingest auth (API key / mTLS), and stronger PII handling.
