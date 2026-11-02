# Self-hosted Angular RealWorld frontend for WP4.
#
# This is the same frontend codebase that powers demo.realworld.show. The only
# build-time change is the API origin: it points at nginx's same-origin /api
# proxy instead of the public api.realworld.show host.
FROM oven/bun:1 AS build

ARG FRONTEND_REPO=https://github.com/realworld-apps/angular-realworld-example-app.git
ARG FRONTEND_COMMIT=ea0dd032e0425142f684a870d6e233537baa6bb6
ARG API_BASE=/api

RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# The theme/assets live in the RealWorld spec submodule, so recurse.
RUN git clone --recurse-submodules "${FRONTEND_REPO}" . \
    && git checkout "${FRONTEND_COMMIT}" \
    && git submodule update --init --recursive

RUN sed -i "s|https://api.realworld.show/api|${API_BASE}|" \
    src/app/core/interceptors/api.interceptor.ts

RUN bun install --frozen-lockfile \
    && bun run build

FROM nginx:alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/angular-conduit/browser /usr/share/nginx/html

EXPOSE 80
