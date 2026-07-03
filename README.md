# Cooking — Plateforme intelligente de gestion alimentaire

Assistant personnel de gestion alimentaire : stock du foyer, recettes, planification des
repas, génération automatique des listes de courses et suivi nutritionnel.

- **Spécification fonctionnelle** : [`Spécification/spec.md`](Spécification/spec.md)
- **Architecture technique** : [`docs/architecture.md`](docs/architecture.md)

## Structure du dépôt

| Dossier | Contenu |
| --- | --- |
| `apps/api` | Backend AdonisJS 6 (API REST) |
| `apps/web` | Frontend Angular — PWA mobile-first |
| `docs` | Documentation technique |
| `docker` | Configuration de déploiement |

## Démarrage en développement

Prérequis : Node.js ≥ 22, Docker.

```bash
# 1. Infrastructure (PostgreSQL dev + test)
docker compose up -d

# 2. API — http://localhost:3333
cd apps/api
cp .env.example .env
npm install
node ace migration:run
npm run dev

# 3. Front — http://localhost:4200 (proxy /api vers l'API)
cd apps/web
npm install
npm start
```

## Tests

```bash
cd apps/api && npm test     # tests fonctionnels et unitaires (Japa)
cd apps/web && npm test     # tests unitaires Angular
```

## Conventions

Commits en français au format [Conventional Commits](https://www.conventionalcommits.org/) ;
tags `vX.Y.Z` à chaque fin de lot. Voir [`docs/architecture.md`](docs/architecture.md) §10.
