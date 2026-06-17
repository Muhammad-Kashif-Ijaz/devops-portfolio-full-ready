# Jenkins CI/CD Guide

This project includes a Jenkins pipeline at:

```text
Jenkinsfile
```

The Jenkins pipeline builds the Docker image, smoke-tests it, pushes it to GHCR, then deploys it to AWS EKS.

## Required Jenkins Agent Tools

Your Jenkins agent must have:

- Git
- Docker
- AWS CLI
- kubectl
- Access to your Docker daemon
- Network access to GitHub, GHCR, AWS, and EKS

Optional:

- Terraform, if you later add infrastructure stages to Jenkins

Check on the Jenkins agent:

```bash
git --version
docker version
aws --version
kubectl version --client
```

## Recommended Jenkins Plugins

Install:

- Pipeline
- Git
- Credentials Binding
- Docker Pipeline
- Blue Ocean, optional

## Required Jenkins Credentials

Go to:

```text
Jenkins -> Manage Jenkins -> Credentials -> System -> Global credentials -> Add Credentials
```

Create:

| Credential ID | Type | Used For |
|---|---|---|
| `aws-access-key-id` | Secret text | AWS authentication |
| `aws-secret-access-key` | Secret text | AWS authentication |
| `aws-region` | Secret text | AWS region |
| `eks-cluster-name` | Secret text | EKS cluster name |
| `ghcr-token` | Username/password | Push image to GHCR |
| `image-repository` | Secret text | GHCR image repo |
| `mysql-host` | Secret text | Kubernetes MySQL secret |
| `mysql-database` | Secret text | Kubernetes MySQL secret |
| `mysql-username` | Secret text | Kubernetes MySQL secret |
| `mysql-password` | Secret text | Kubernetes MySQL secret |

Example values:

```text
aws-region = us-east-1
eks-cluster-name = devops-portfolio-prod-eks
image-repository = muhammad-kashif-ijaz/devops-portfolio-full-ready
mysql-database = portfolio
mysql-username = portfolio_admin
```

For `ghcr-token`, use:

- Username: your GitHub username
- Password: GitHub PAT with package write permission

GHCR image names must be lowercase. The `Jenkinsfile` lowercases `image-repository` automatically, but keeping the credential lowercase is best.

## Create Jenkins Pipeline Job

1. Open Jenkins.
2. Click `New Item`.
3. Enter:

```text
devops-portfolio-full-ready
```

4. Choose:

```text
Pipeline
```

5. In Pipeline section, choose:

```text
Pipeline script from SCM
```

6. SCM:

```text
Git
```

7. Repository URL:

```text
https://github.com/Muhammad-Kashif-Ijaz/devops-portfolio-full-ready.git
```

8. Branch:

```text
*/main
```

9. Script path:

```text
Jenkinsfile
```

10. Save, then click `Build Now`.

## Jenkins Pipeline Stages

### 1. Checkout

Pulls the latest code from GitHub:

```groovy
checkout scm
```

### 2. Prepare Image Name

Creates a lowercase image name:

```groovy
env.IMAGE = "${env.IMAGE_REGISTRY}/${env.IMAGE_REPOSITORY.toLowerCase()}:${env.IMAGE_TAG}"
```

Example:

```text
ghcr.io/muhammad-kashif-ijaz/devops-portfolio-full-ready:25
```

### 3. Validate Static Site

Checks required files exist:

```bash
test -f index.html
test -f css/styles.css
test -f js/main.js
```

### 4. Build Docker Image

Runs:

```bash
docker build -t "$IMAGE" .
```

### 5. Smoke Test

Runs the image locally:

```bash
docker run -d --name portfolio-smoke -p 8080:8080 "$IMAGE"
```

Then tests the app:

```bash
./scripts/smoke-test.sh http://127.0.0.1:8080
```

If your Jenkins agent has permission issues with shell scripts, change that line in `Jenkinsfile` to:

```bash
sh ./scripts/smoke-test.sh http://127.0.0.1:8080
```

### 6. Push Image

Only runs on `main` or `master`:

```bash
docker push "$IMAGE"
```

Uses `ghcr-token`.

### 7. Deploy To EKS

Only runs on `main` or `master`.

It:

1. Configures AWS credentials.
2. Runs `aws eks update-kubeconfig`.
3. Applies Kubernetes manifests.
4. Creates/updates the MySQL secret.
5. Updates the deployment image.
6. Waits for rollout.

## Jenkinsfile Environment Variables

| Variable | Source |
|---|---|
| `AWS_REGION` | Jenkins credential `aws-region` |
| `EKS_CLUSTER_NAME` | Jenkins credential `eks-cluster-name` |
| `KUBE_NAMESPACE` | Hardcoded as `portfolio-prod` |
| `IMAGE_REGISTRY` | Hardcoded as `ghcr.io` |
| `IMAGE_REPOSITORY` | Jenkins credential `image-repository` |
| `IMAGE_TAG` | Jenkins build number |
| `IMAGE` | Generated during pipeline |

## Common Jenkins Errors

### Docker Permission Denied

Error:

```text
permission denied while trying to connect to the Docker daemon socket
```

Fix:

Add the Jenkins user to the Docker group on Linux:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

Then restart the Jenkins agent/session.

### Docker Not Found

Error:

```text
docker: command not found
```

Fix:

Install Docker on the Jenkins agent, then confirm:

```bash
docker version
```

### AWS CLI Not Found

Error:

```text
aws: command not found
```

Fix:

Install AWS CLI on the Jenkins agent.

### kubectl Not Found

Error:

```text
kubectl: command not found
```

Fix:

Install kubectl on the Jenkins agent.

### GHCR Login Failed

Error:

```text
unauthorized: authentication required
```

Fix:

Check Jenkins credential:

```text
ghcr-token
```

The GitHub PAT must have package write permission.

### EKS Deploy Failed

Check:

```bash
aws sts get-caller-identity
aws eks update-kubeconfig --region us-east-1 --name devops-portfolio-prod-eks
kubectl get nodes
kubectl get ns
```

The AWS user must have permission to access the EKS cluster.

## Manual Jenkins Deployment Check

On the Jenkins agent, manually test:

```bash
aws eks update-kubeconfig --region us-east-1 --name devops-portfolio-prod-eks
kubectl get nodes
kubectl get pods -n portfolio-prod
```

If those commands work manually, Jenkins deployment should work once credentials are correct.

## Suggested Jenkins Workflow

Use GitHub Actions for normal hosted CI/CD.

Use Jenkins when:

- You want to show Jenkins experience in your DevOps portfolio.
- You want a self-hosted pipeline.
- You want to run custom enterprise-style deployment jobs.
- You want to demonstrate credential management, agent setup, and pipeline stages.
