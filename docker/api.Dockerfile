# Image de production de l'API AdonisJS.
# Contexte de build : racine du dépôt (voir docker-compose.prod.yml).

# --- Étape 1 : dépendances complètes + compilation TypeScript
FROM node:24-alpine AS build
WORKDIR /app
COPY apps/api/package.json apps/api/package-lock.json ./
RUN npm ci
COPY apps/api/ .
RUN node ace build

# --- Étape 2 : dépendances de production uniquement
FROM node:24-alpine AS deps
WORKDIR /app
COPY apps/api/package.json apps/api/package-lock.json ./
RUN npm ci --omit=dev

# --- Étape 3 : image finale minimale
FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/build ./

EXPOSE 3333

# Applique les migrations puis démarre le serveur HTTP.
CMD ["sh", "-c", "node ace migration:run --force && node bin/server.js"]
