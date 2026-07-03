# Image de production du front : build Angular servi par Caddy,
# qui fait aussi reverse proxy /api vers le conteneur API et gère le TLS.
# Contexte de build : racine du dépôt (voir docker-compose.prod.yml).

# --- Étape 1 : build Angular
FROM node:24-alpine AS build
WORKDIR /app
COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci
COPY apps/web/ .
RUN npm run build

# --- Étape 2 : Caddy
FROM caddy:2-alpine
COPY --from=build /app/dist/web/browser /srv
COPY docker/Caddyfile /etc/caddy/Caddyfile
