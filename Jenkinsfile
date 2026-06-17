pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  environment {
    AWS_REGION = credentials('aws-region')
    EKS_CLUSTER_NAME = credentials('eks-cluster-name')
    KUBE_NAMESPACE = 'portfolio-prod'
    IMAGE_REGISTRY = 'ghcr.io'
    IMAGE_REPOSITORY = credentials('image-repository')
    IMAGE_TAG = "${env.BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Prepare Image Name') {
      steps {
        script {
          env.IMAGE = "${env.IMAGE_REGISTRY}/${env.IMAGE_REPOSITORY.toLowerCase()}:${env.IMAGE_TAG}"
        }
        echo "Using image ${env.IMAGE}"
      }
    }

    stage('Validate Static Site') {
      steps {
        sh '''
          test -f index.html
          test -f css/styles.css
          test -f js/main.js
        '''
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t "$IMAGE" .'
      }
    }

    stage('Smoke Test') {
      steps {
        sh '''
          docker rm -f portfolio-smoke || true
          docker run -d --name portfolio-smoke -p 8080:8080 "$IMAGE"
          sleep 5
          ./scripts/smoke-test.sh http://127.0.0.1:8080
          docker rm -f portfolio-smoke
        '''
      }
    }

    stage('Push Image') {
      when {
        anyOf {
          branch 'main'
          branch 'master'
        }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'ghcr-token', usernameVariable: 'REGISTRY_USER', passwordVariable: 'REGISTRY_TOKEN')]) {
          sh '''
            echo "$REGISTRY_TOKEN" | docker login "$IMAGE_REGISTRY" -u "$REGISTRY_USER" --password-stdin
            docker push "$IMAGE"
          '''
        }
      }
    }

    stage('Deploy to EKS') {
      when {
        anyOf {
          branch 'main'
          branch 'master'
        }
      }
      steps {
        withCredentials([
          string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
          string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY'),
          string(credentialsId: 'mysql-host', variable: 'MYSQL_HOST'),
          string(credentialsId: 'mysql-database', variable: 'MYSQL_DATABASE'),
          string(credentialsId: 'mysql-username', variable: 'MYSQL_USERNAME'),
          string(credentialsId: 'mysql-password', variable: 'MYSQL_PASSWORD')
        ]) {
          sh '''
            aws eks update-kubeconfig --region "$AWS_REGION" --name "$EKS_CLUSTER_NAME"
            kubectl apply -k k8s/overlays/prod
            kubectl -n "$KUBE_NAMESPACE" create secret generic portfolio-mysql-prod \
              --from-literal=host="$MYSQL_HOST" \
              --from-literal=database="$MYSQL_DATABASE" \
              --from-literal=username="$MYSQL_USERNAME" \
              --from-literal=password="$MYSQL_PASSWORD" \
              --dry-run=client -o yaml | kubectl apply -f -
            kubectl -n "$KUBE_NAMESPACE" set image deployment/portfolio-web-prod web="$IMAGE"
            kubectl -n "$KUBE_NAMESPACE" rollout status deployment/portfolio-web-prod --timeout=180s
          '''
        }
      }
    }
  }

  post {
    always {
      sh 'docker rm -f portfolio-smoke || true'
    }
  }
}
