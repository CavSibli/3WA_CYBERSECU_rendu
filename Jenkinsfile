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
          sh """
printf "BACKEND_IMAGE=%s\nFRONTEND_IMAGE=%s\nJWT_SECRET=%s\nPOSTGRES_USER=%s\nPOSTGRES_PASSWORD=%s\nPOSTGRES_DB=%s\nFRONTEND_URL=%s\n" \
  "${BACKEND_IMAGE}" \
  "${FRONTEND_IMAGE}" \
  "${JWT_SECRET}" \
  "${POSTGRES_USER}" \
  "${POSTGRES_PASSWORD}" \
  "${POSTGRES_DB}" \
  "http://51.159.150.131" > .env.deploy

docker compose --env-file .env.deploy -f "${DOCKER_COMPOSE_FILE}" pull
docker compose --env-file .env.deploy -f "${DOCKER_COMPOSE_FILE}" up -d --remove-orphans
rm -f .env.deploy
          """
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