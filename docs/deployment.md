# Déploiement en production

Cible : VPS Ubuntu (Hostinger) avec Docker. Trois conteneurs :

| Service | Rôle |
| --- | --- |
| `web` | Caddy — sert le front Angular, reverse proxy `/api` → API, TLS Let's Encrypt automatique |
| `api` | AdonisJS (exécute les migrations à chaque démarrage) |
| `postgres` | PostgreSQL 17, données persistées dans un volume |

## 1. Préparer le VPS (une seule fois)

```bash
# Docker (méthode officielle)
curl -fsSL https://get.docker.com | sh

# Pare-feu : SSH + HTTP + HTTPS uniquement
ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable
```

Si un domaine est utilisé : créer un enregistrement **A** pointant vers l'IP
du VPS **avant** le premier démarrage (nécessaire pour Let's Encrypt).

## 2. Installer l'application

```bash
git clone <url-du-depot> /opt/cooking && cd /opt/cooking

cp .env.production.example .env.production
openssl rand -base64 32   # → valeur pour APP_KEY
nano .env.production      # APP_KEY, SITE_ADDRESS, APP_URL, DB_PASSWORD

docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Vérification :

```bash
docker compose -f docker-compose.prod.yml ps
curl -s https://SITE_ADDRESS/api/v1 -o /dev/null -w '%{http_code}\n'
```

## 3. Mettre à jour

```bash
cd /opt/cooking
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Les migrations sont appliquées automatiquement au démarrage de l'API.

## 4. Sauvegardes

Sauvegarde quotidienne de la base (crontab root, `crontab -e`) :

```cron
0 3 * * * docker exec cooking-prod-postgres-1 pg_dump -U cooking cooking | gzip > /var/backups/cooking-$(date +\%u).sql.gz
```

(7 fichiers tournants, un par jour de semaine.)

Restauration :

```bash
gunzip -c /var/backups/cooking-N.sql.gz | docker exec -i cooking-prod-postgres-1 psql -U cooking cooking
```

## 5. Journaux et diagnostic

```bash
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web
docker exec -it cooking-prod-postgres-1 psql -U cooking cooking
```
