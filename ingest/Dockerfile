FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY db/package.json ./db/
COPY ingest/package.json ./ingest/
RUN pnpm install --frozen-lockfile --filter db --filter ingest
COPY db ./db
COPY ingest ./ingest
RUN pnpm --filter db build && pnpm --filter ingest build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3001
CMD ["pnpm", "--filter", "ingest", "start"]
