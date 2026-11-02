# Self-hosted RealWorld API for WP4.
#
# Pinned to a spec-compliant Nitro + Prisma + Zod implementation with SQLite,
# so the suite gets a stable, stateless-JWT backend instead of the shared
# public demo. The database is disposable: `docker compose down -v` resets it.
FROM oven/bun:1

ARG BACKEND_REPO=https://github.com/realworld-apps/nitro-prisma-zod-realworld-example-app.git
ARG BACKEND_COMMIT=c8c66858a436a6e07f445fffe2253a65ff6dcb58

RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN git clone "${BACKEND_REPO}" . \
    && git checkout "${BACKEND_COMMIT}"

# Keep the self-hosted API's ownership error contract aligned with the target
# API used by the existing Postman assertions (404, checked before body
# validation). This is test infrastructure, not a change to the product.
COPY docker/patches/nitro-unauthorized-update.patch /tmp/
RUN git apply /tmp/nitro-unauthorized-update.patch

RUN bun install --frozen-lockfile

ENV DATABASE_URL=file:/app/dev.db

RUN bun run prepare \
    && bun run db:generate \
    && bun run db:push \
    && bun run build

# A fixed, non-production secret is deliberate: this container only exists for
# tests and must not look like a real deployment.
ENV JWT_SECRET=wp4-local-test-secret-not-for-production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["bun", ".output/server/index.mjs"]
