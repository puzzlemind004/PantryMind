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
nano .env.production      # COOKING_APP_KEY, COOKING_SITE_ADDRESS, COOKING_APP_URL, COOKING_DB_PASSWORD

docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Vérification :

```bash
docker compose -f docker-compose.prod.yml ps
curl -s https://pantry.puzzlemind.fr/api/v1 -o /dev/null -w '%{http_code}\n'
```

## 2 bis. Cohabitation avec un serveur web natif existant

Si le VPS héberge déjà des sites via un nginx (ou autre) qui occupe 80/443,
ne pas laisser Caddy prendre ces ports. Dans `.env.production` :

```env
COOKING_SITE_ADDRESS=:80
COOKING_APP_URL=https://cooking.mondomaine.fr
COOKING_WEB_BIND=127.0.0.1:8080
COOKING_WEB_TLS_BIND=127.0.0.1:8443
```

Caddy sert alors l'application en HTTP simple sur `127.0.0.1:8080` et le
proxy natif gère le TLS. Vhost nginx à créer (`/etc/nginx/sites-available/cooking`) :

```nginx
server {
    listen 80;
    server_name cooking.mondomaine.fr;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/cooking /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d cooking.mondomaine.fr   # TLS pour ce vhost uniquement
```

Note : le PostgreSQL du compose n'expose aucun port sur l'hôte, il ne
peut pas entrer en conflit avec une instance PostgreSQL native.

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

## 6. CI/CD — déploiement automatique

Le workflow [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)
s'exécute à chaque push :

1. **Tests API** (PostgreSQL en service container, typecheck, lint, Japa)
   et **build front** (tests unitaires + compilation) — sur les push
   *et* les pull requests ;
2. **Déploiement** — uniquement quand `main` avance et que les tests
   passent : SSH vers le VPS avec une clé dédiée, `git reset --hard
   origin/main`, `docker compose up -d --build`, purge des images
   orphelines, puis health check HTTP (échec du job si l'app ne répond
   pas).

Secrets GitHub requis (`gh secret set …`) : `VPS_SSH_KEY` (clé privée
ed25519 dédiée au déploiement, sans passphrase), `VPS_HOST`, `VPS_USER`.
La clé publique correspondante doit être dans les `authorized_keys` de
l'utilisateur de déploiement sur le VPS.

Déployer = pousser sur `main`. Plus aucune intervention sur le serveur.

## 7. Production actuelle

| Élément | Valeur |
| --- | --- |
| URL | https://pantry.puzzlemind.fr (ancien nom srv571823.hstgr.cloud → 301) |
| Serveur | VPS Hostinger `srv571823` (92.112.192.247), Ubuntu 24.04 |
| Mode | Cohabitation §2 bis : stack Docker sur `127.0.0.1:8080` derrière le nginx natif (qui héberge aussi d'autres sites), TLS par certbot |
| Emplacement | `/opt/cooking`, configuration dans `.env.production` (variables `COOKING_*`) |
| DNS | Enregistrement A `pantry` de la zone puzzlemind.fr (gérée chez Hostinger) |
| Sauvegardes | `pg_dump` quotidien 03:00 via crontab root |
