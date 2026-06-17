# GitHub Actions Secrets

Add these in your GitHub repository:

`Settings -> Secrets and variables -> Actions -> New repository secret`

| Secret | Example |
|---|---|
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `AWS_REGION` | `us-east-1` |
| `EKS_CLUSTER_NAME` | `devops-portfolio-prod-eks` |
| `MYSQL_HOST` | RDS endpoint |
| `MYSQL_DATABASE` | `portfolio` |
| `MYSQL_USERNAME` | `portfolio_admin` |
| `MYSQL_PASSWORD` | RDS password |

The pipeline uses GitHub Container Registry automatically through `GITHUB_TOKEN`.

If you prefer Docker Hub instead of GHCR, change `.github/workflows/ci-cd.yml` image/login settings.

For the full pipeline explanation, see:

```text
docs/github-actions-guide.md
```
