pipeline {
  agent any

  tools {
    nodejs "Node-20"
  }

  environment {
    APP_NAME = "eventhub"
    BACKEND_CONTEXT = "3WA_DEV2_rendu"
    FRONTEND_CONTEXT = "eventhub_front"
    DOCKER_COMPOSE_FILE = "docker-compose.prod.yml"
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  stages {
    stage("Checkout") {
      steps {
        checkout scm
        script {
          env.SHORT_SHA = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
          env.IMAGE_TAG = "${env.BUILD_NUMBER}-${env.SHORT_SHA}"
        }
      }
    }

    stage("Install backend") {
      steps {
        dir("${env.BACKEND_CONTEXT}") {
          sh "npm ci"
        }
      }
    }

    stage("Test backend") {
      steps {
        dir("${env.BACKEND_CONTEXT}") {
          sh "npm test -- --runInBand"
        }
      }
    }

    stage("Install frontend") {
      steps {
        dir("${env.FRONTEND_CONTEXT}") {
          sh "npm ci"
        }
      }
    }

    stage("Lint and build frontend") {
      steps {
        dir("${env.FRONTEND_CONTEXT}") {
          sh "npm run lint"
          sh "npm run build"
        }
      }
    }

    stage("Build and push images") {
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: "dockerhub-credentials",
            usernameVariable: "DOCKERHUB_USERNAME",
            passwordVariable: "DOCKERHUB_TOKEN"
          )
        ]) {
          script {
            env.BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/${APP_NAME}-backend:${IMAGE_TAG}"
            env.FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/${APP_NAME}-frontend:${IMAGE_TAG}"
            env.BACKEND_IMAGE_LATEST = "${DOCKERHUB_USERNAME}/${APP_NAME}-backend:latest"
            env.FRONTEND_IMAGE_LATEST = "${DOCKERHUB_USERNAME}/${APP_NAME}-frontend:latest"
          }

          sh """
            echo "${DOCKERHUB_TOKEN}" | docker login -u "${DOCKERHUB_USERNAME}" --password-stdin
            docker build -t "${BACKEND_IMAGE}" -t "${BACKEND_IMAGE_LATEST}" "${BACKEND_CONTEXT}"
            docker build -t "${FRONTEND_IMAGE}" -t "${FRONTEND_IMAGE_LATEST}" "${FRONTEND_CONTEXT}"
            docker push "${BACKEND_IMAGE}"
            docker push "${BACKEND_IMAGE_LATEST}"
            docker push "${FRONTEND_IMAGE}"
            docker push "${FRONTEND_IMAGE_LATEST}"
          """
        }
      }
    }

    stage("Deploy") {
      steps {
        withCredentials([
          string(credentialsId: "jwt-secret", variable: "JWT_SECRET"),
          string(credentialsId: "postgres-user", variable: "POSTGRES_USER"),
          string(credentialsId: "postgres-password", variable: "POSTGRES_PASSWORD"),
          string(credentialsId: "postgres-db", variable: "POSTGRES_DB")
        ]) {
          sh '''
set -eu

cat > .env.deploy <<EOF
BACKEND_IMAGE=${BACKEND_IMAGE}
FRONTEND_IMAGE=${FRONTEND_IMAGE}
JWT_SECRET=${JWT_SECRET}
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=${POSTGRES_DB}
FRONTEND_URL=http://51.159.150.131
EOF

debug_log() {
  node -e "fetch('http://127.0.0.1:7723/ingest/3e757b8c-e55b-48a6-b819-71791092e113',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'432427'},body:JSON.stringify({sessionId:'432427',runId:'jenkins-deploy-post-fix',hypothesisId:process.argv[1],location:process.argv[2],message:process.argv[3],data:JSON.parse(process.argv[4]),timestamp:Date.now()})}).catch(()=>{})" "$1" "$2" "$3" "$4"
}

#region agent log
echo "[deploy-debug] Verifying native docker compose"
docker --version
docker compose version
debug_log "H4" "Jenkinsfile:111" "native-compose-verified" "{\"composeCommand\":\"docker compose\"}"
#endregion

set -a
. ./.env.deploy
set +a

docker compose -f "$DOCKER_COMPOSE_FILE" pull
docker compose -f "$DOCKER_COMPOSE_FILE" up -d --remove-orphans

#region agent log
debug_log "H4" "Jenkinsfile:121" "native-compose-deploy-finished" "{\"status\":\"completed\"}"
#endregion

rm -f .env.deploy
          '''
        }
      }
    }
  }

  post {
    always {
      sh "docker logout || true"
      cleanWs()
    }
  }
}