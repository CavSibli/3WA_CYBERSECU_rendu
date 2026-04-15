# Deployment checklist (go-live)

## 1) Pre-check avant pipeline

- Les credentials Jenkins existent:
  - `dockerhub-credentials`
  - `jwt-secret`
  - `postgres-user`
  - `postgres-password`
  - `postgres-db`
- Le Security Group Scaleway expose `22`, `80`, `8080` (8080 restreint IP).
- Docker et Docker Compose fonctionnent sur l'instance:
  - `docker --version`
  - `docker compose version`

## 2) Verification apres deploiement

Depuis l'instance:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=100 backend
docker compose -f docker-compose.prod.yml logs --tail=100 nginx
```

Depuis ton poste:

```bash
curl -I http://<IP_PUBLIQUE>/
curl -i http://<IP_PUBLIQUE>/api/csrf-token
curl -I http://<IP_PUBLIQUE>/api-docs/
```

Resultat attendu:

- `/` repond `200`.
- `/api/csrf-token` repond `200` avec JSON.
- `/api-docs/` est accessible via Nginx.

## 3) Verification persistance PostgreSQL

1. Creer une donnee via l'API.
2. Redemarrer la stack:

```bash
docker compose -f docker-compose.prod.yml restart
```

3. Verifier que la donnee existe encore.

## 4) Procedure de rollback rapide

1. Reprendre un ancien tag Docker Hub valide.
2. Modifier les variables `BACKEND_IMAGE` et `FRONTEND_IMAGE`.
3. Relancer:

```bash
docker compose --env-file .env.deploy -f docker-compose.prod.yml pull
docker compose --env-file .env.deploy -f docker-compose.prod.yml up -d --remove-orphans
```

## 5) Narration soutenance (simple et pro)

- "J'ai d'abord livre une architecture mono-instance pour accelerer la mise en production."
- "Le pipeline couvre tests backend, lint/build frontend, build d'images, push Docker Hub et deploiement compose."
- "La stack prod isole bien Nginx, frontend, backend et PostgreSQL, avec volume persistant et migration Prisma automatisee."
- "L'architecture est evolutive: la migration vers 2 instances ne change presque pas le Jenkinsfile."

## 6) Upgrade path vers 2 instances

- Instance A: `eventhub-ci` (Jenkins uniquement).
- Instance B: `eventhub-prod` (Nginx + frontend + backend + postgres).
- Changement concret:
  - garder le build/push identique,
  - remplacer le deploiement local par un deploiement SSH vers `eventhub-prod`.
