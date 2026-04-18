# Stage 1: Dependencies

FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.22.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile


# Stage 2: Builder

FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.22.0 --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN CI=true pnpm install --frozen-lockfile
ENV NODE_ENV=production
RUN pnpm build
# Remove junk from traced node_modules
RUN apk add --no-cache curl && \
    curl -sf https://gobinaries.com/tj/node-prune | sh && \
    if [ -d .next/standalone/node_modules ]; then node-prune .next/standalone/node_modules; fi


# Stage 3: Runner (Production) - Distroless

FROM gcr.io/distroless/nodejs22-debian12 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000


# Distroless runs as nonroot (uid 65532) by default
COPY --from=builder --chown=65532:65532 /app/.next/standalone ./
COPY --from=builder --chown=65532:65532 /app/.next/static ./.next/static
COPY --from=builder --chown=65532:65532 /app/public ./public
USER nonroot
EXPOSE 3000
CMD ["server.js"]