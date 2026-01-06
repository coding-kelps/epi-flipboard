FROM docker.io/oven/bun:1.3.6-slim AS base

FROM base AS deps

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

FROM docker.io/oven/bun:1.3.6-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

FROM docker.io/oven/bun:1.3.6-distroless AS runner

LABEL org.opencontainers.image.authors="guilhem.sante@kelps.org"
LABEL org.opencontainers.image.title="EpiFlipBoard Webserver"
LABEL org.opencontainers.image.description="A FlipBoard clone."
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT ["bun", "server.js"]
