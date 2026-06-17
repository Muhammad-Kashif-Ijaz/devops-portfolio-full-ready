# GitHub Actions CI/CD Guide

This project includes a GitHub Actions pipeline at:

```text
.github/workflows/ci-cd.yml
```

The pipeline builds the Docker image, tests it, pushes it to GitHub Container Registry, then deploys it to AWS EKS.

## Pipeline Trigger

The workflow runs when:

- You push to `main`
- You push to `master`
- You open or update a pull request into `main` or `master`
- You manually run it from the GitHub Actions tab

```yaml
on:
  push:
    branches:
      - main
      - master
  pull_request:
    branches:
      - main
      - master
  workflow_dispatch:
```

Pull requests only build and test. They do not push images or deploy.

## Required GitHub Permissions

The workflow uses:

```yaml
permissions:
  contents: read
  packages: write
  id-token: write
```

Meaning:

- `contents: read` lets Actions read the repository.
- `packages: write` lets Actions push Docker images to GHCR.
- `id-token: write` is ready for AWS OIDC if you later replace access keys with role-based auth.

## Required Secrets

Go to:

```text
GitHub repo -> Settings -> Secrets and variables -> Actions -> New repository secret
```

Create:

| Secret | Required For | Example |
|---|---|---|
| `AWS_ACCESS_KEY_ID` | Deploy to EKS | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | Deploy to EKS | AWS secret key |
| `AWS_REGION` | Deploy to EKS | `us-east-1` |
| `EKS_CLUSTER_NAME` | Deploy to EKS | `devops-portfolio-prod-eks` |
| `MYSQL_HOST` | Kubernetes app secret | RDS endpoint |
| `MYSQL_DATABASE` | Kubernetes app secret | `portfolio` |
| `MYSQL_USERNAME` | Kubernetes app secret | `portfolio_admin` |
| `MYSQL_PASSWORD` | Kubernetes app secret | RDS password |

You do not need to create `GITHUB_TOKEN`. GitHub creates it automatically for workflows.

## Job 1: Build, Test, Push

Job name:

```text
build-test-push
```

### Step 1: Checkout

Downloads the repository into the runner:

```yaml
- uses: actions/checkout@v4
```

### Step 2: Generate Image Tag

Creates the image name:

```bash
IMAGE_NAME="ghcr.io/${GITHUB_REPOSITORY,,}"
IMAGE="${IMAGE_NAME}:${GITHUB_SHA::7}"
```

Important: Docker image names must be lowercase. `${GITHUB_REPOSITORY,,}` converts your GitHub repo path to lowercase.

Example:

```text
ghcr.io/muhammad-kashif-ijaz/devops-portfolio-full-ready:13b0624
```

### Step 3: Login To GHCR

Uses GitHub Container Registry:

```yaml
registry: ghcr.io
username: ${{ github.actor }}
password: ${{ secrets.GITHUB_TOKEN }}
```

### Step 4: Build Docker Image

Runs:

```bash
docker build -t "$IMAGE" .
```

This uses the root `Dockerfile`.

### Step 5: Smoke Test

Runs the container:

```bash
docker run -d --name portfolio-smoke -p 8080:8080 "$IMAGE"
```

Then tests:

```bash
sh ./scripts/smoke-test.sh http://127.0.0.1:8080
```

The smoke test checks:

- `/healthz` returns success
- the home page contains `Muhammad Kashif`

### Step 6: Push Docker Image

Only runs for pushes, not pull requests:

```bash
docker push "$IMAGE"
```

## Job 2: Deploy To EKS

Job name:

```text
deploy
```

This job only runs after `build-test-push` succeeds.

It does not run on pull requests.

### Step 1: Configure AWS Credentials

Uses:

```yaml
aws-actions/configure-aws-credentials@v4
```

It needs:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
```

### Step 2: Update kubeconfig

Connects the runner to your EKS cluster:

```bash
aws eks update-kubeconfig --region "$AWS_REGION" --name "$EKS_CLUSTER_NAME"
```

### Step 3: Apply Kubernetes Manifests

Deploys Kubernetes YAML:

```bash
kubectl apply -k k8s/overlays/prod
```

### Step 4: Create MySQL Secret

Creates or updates this Kubernetes secret:

```text
portfolio-mysql-prod
```

From GitHub secrets:

```bash
kubectl -n "$KUBE_NAMESPACE" create secret generic portfolio-mysql-prod \
  --from-literal=host="${{ secrets.MYSQL_HOST }}" \
  --from-literal=database="${{ secrets.MYSQL_DATABASE }}" \
  --from-literal=username="${{ secrets.MYSQL_USERNAME }}" \
  --from-literal=password="${{ secrets.MYSQL_PASSWORD }}" \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Step 5: Deploy New Image

Updates the Kubernetes deployment image:

```bash
kubectl -n "$KUBE_NAMESPACE" set image deployment/portfolio-web-prod web="$IMAGE"
```

Then waits for rollout:

```bash
kubectl -n "$KUBE_NAMESPACE" rollout status deployment/portfolio-web-prod --timeout=180s
```

## Manual Run

Go to:

```text
GitHub repo -> Actions -> Portfolio CI/CD -> Run workflow
```

Choose branch:

```text
main
```

Then click:

```text
Run workflow
```

## Common GitHub Actions Errors

### Invalid Docker Tag

Error:

```text
repository name must be lowercase
```

Fix:

The workflow already uses:

```bash
IMAGE_NAME="ghcr.io/${GITHUB_REPOSITORY,,}"
```

Make sure the latest workflow is pushed to GitHub.

### Smoke Test Permission Denied

Error:

```text
./scripts/smoke-test.sh: Permission denied
```

Fix:

The workflow should run:

```bash
sh ./scripts/smoke-test.sh http://127.0.0.1:8080
```

If GitHub still shows `./scripts/smoke-test.sh`, you are rerunning an old workflow commit. Push latest `main`, then start a new workflow run.

### AWS Credentials Error

Error:

```text
Could not load credentials
```

Fix:

Add or correct these repository secrets:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
```

### EKS Cluster Not Found

Error:

```text
ResourceNotFoundException
```

Fix:

Check:

```text
EKS_CLUSTER_NAME
AWS_REGION
```

They must match the cluster Terraform created.

### Kubernetes Deployment Not Found

Error:

```text
deployments.apps "portfolio-web-prod" not found
```

Fix:

Make sure this command ran successfully:

```bash
kubectl apply -k k8s/overlays/prod
```

Also check namespace:

```text
portfolio-prod
```

## Recommended Production Improvement

For production, replace long-lived AWS access keys with GitHub OIDC and an AWS IAM role. The workflow already has `id-token: write`, so it is ready for that upgrade later.
