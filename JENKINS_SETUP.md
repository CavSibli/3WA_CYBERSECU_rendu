# Jenkins setup (Scaleway, debutant-friendly)

## 1) Security Group Scaleway

Ouvrir uniquement:

- `22/tcp` (SSH), limite a ton IP.
- `80/tcp` (application EventHub).
- `8080/tcp` (Jenkins), limite a ton IP.

## 2) Installer Docker sur l'instance Ubuntu

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Reconnecte-toi en SSH apres la commande `usermod`.

## 3) Construire puis lancer Jenkins avec Docker Compose

Depuis la racine du repo (`Projet/3WA_CYBERSECU_rendu`):

```bash
docker compose -f docker-compose.jenkins.yml down
docker compose -f docker-compose.jenkins.yml build --no-cache
docker compose -f docker-compose.jenkins.yml up -d
```

Verifier:

```bash
docker ps
docker logs eventhub_jenkins
docker exec eventhub_jenkins docker --version
docker exec eventhub_jenkins docker compose version
docker exec eventhub_jenkins docker ps
```

Recuperer le mot de passe admin initial:

```bash
docker exec eventhub_jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

## 4) Plugins Jenkins minimum

Installer:

- Git
- Pipeline
- Docker Pipeline
- Credentials Binding
- SSH Agent
- NodeJS

Le point critique pour le stage `Deploy` est que `docker exec eventhub_jenkins docker compose version`
doit fonctionner. Si cette commande echoue, le `Jenkinsfile` ne pourra pas deployer avec Compose.

## 5) Credentials Jenkins a creer

Dans **Manage Jenkins > Credentials > (global)**:

- `dockerhub-credentials` (type Username with password)
  - username: compte Docker Hub
  - password: token Docker Hub
- `jwt-secret` (type Secret text)
- `postgres-user` (type Secret text)
- `postgres-password` (type Secret text)
- `postgres-db` (type Secret text)

## 6) Créer le job pipeline

- Type: **Pipeline**
- Source: **Pipeline script from SCM**
- SCM: Git
- Jenkinsfile path: `Jenkinsfile`
- Branch: ta branche de travail ou `main`

## 7) Variables de deploiement attendues

Le `Jenkinsfile` genere un fichier `.env.deploy` temporaire pour `docker-compose.prod.yml` avec:

- `BACKEND_IMAGE`
- `FRONTEND_IMAGE`
- `JWT_SECRET`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `FRONTEND_URL`

## 8) Durcir ensuite (phase soutenance)

- Restreindre `8080` a ton IP.
- Placer Jenkins derriere Nginx avec auth.
- Separarer Jenkins et prod sur 2 instances (`eventhub-ci`, `eventhub-prod`).
