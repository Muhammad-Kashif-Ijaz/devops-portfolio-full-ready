#!/usr/bin/env sh
set -eu

NAMESPACE="${KUBE_NAMESPACE:-portfolio-prod}"
IMAGE="${IMAGE:?Set IMAGE, for example ghcr.io/your-user/devops-portfolio:latest}"
MYSQL_HOST="${MYSQL_HOST:?Set MYSQL_HOST}"
MYSQL_DATABASE="${MYSQL_DATABASE:-portfolio}"
MYSQL_USERNAME="${MYSQL_USERNAME:?Set MYSQL_USERNAME}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:?Set MYSQL_PASSWORD}"

kubectl apply -k k8s/overlays/prod
kubectl -n "$NAMESPACE" create secret generic portfolio-mysql-prod \
  --from-literal=host="$MYSQL_HOST" \
  --from-literal=database="$MYSQL_DATABASE" \
  --from-literal=username="$MYSQL_USERNAME" \
  --from-literal=password="$MYSQL_PASSWORD" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl -n "$NAMESPACE" set image deployment/portfolio-web-prod web="$IMAGE"
kubectl -n "$NAMESPACE" rollout status deployment/portfolio-web-prod --timeout=180s
