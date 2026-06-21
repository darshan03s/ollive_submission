# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY db/package.json ./db/
COPY ingest/package.json ./ingest/
COPY web/package.json ./web/
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir=/pnpm/store

FROM deps AS build
COPY db ./db
RUN pnpm --filter db build

FROM build AS ingest
COPY ingest ./ingest
RUN pnpm --filter ingest --ignore-scripts build
CMD ["pnpm", "--filter", "ingest", "start"]

FROM build AS web
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
COPY web ./web
RUN --mount=type=cache,target=/app/web/.next/cache \
    SKIP_ENV_VALIDATION=1 NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    pnpm --filter web --ignore-scripts build
CMD ["pnpm", "--filter", "web", "start"]
