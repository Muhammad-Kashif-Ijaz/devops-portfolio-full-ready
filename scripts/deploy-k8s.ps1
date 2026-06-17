$ErrorActionPreference = "Stop"

if (-not $env:IMAGE) { throw "Set IMAGE, for example ghcr.io/your-user/devops-portfolio:latest" }
if (-not $env:MYSQL_HOST) { throw "Set MYSQL_HOST" }
if (-not $env:MYSQL_USERNAME) { throw "Set MYSQL_USERNAME" }
if (-not $env:MYSQL_PASSWORD) { throw "Set MYSQL_PASSWORD" }

$namespace = if ($env:KUBE_NAMESPACE) { $env:KUBE_NAMESPACE } else { "portfolio-prod" }
$database = if ($env:MYSQL_DATABASE) { $env:MYSQL_DATABASE } else { "portfolio" }

kubectl apply -k k8s/overlays/prod
kubectl -n $namespace create secret generic portfolio-mysql-prod `
  --from-literal=host="$env:MYSQL_HOST" `
  --from-literal=database="$database" `
  --from-literal=username="$env:MYSQL_USERNAME" `
  --from-literal=password="$env:MYSQL_PASSWORD" `
  --dry-run=client -o yaml | kubectl apply -f -

kubectl -n $namespace set image deployment/portfolio-web-prod web="$env:IMAGE"
kubectl -n $namespace rollout status deployment/portfolio-web-prod --timeout=180s
