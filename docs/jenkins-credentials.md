# Jenkins Credentials

Create these Jenkins credentials before running the `Jenkinsfile`.

| Credential ID | Type | Example |
|---|---|---|
| `aws-access-key-id` | Secret text | `AKIA...` |
| `aws-secret-access-key` | Secret text | AWS secret key |
| `aws-region` | Secret text | `us-east-1` |
| `eks-cluster-name` | Secret text | `devops-portfolio-prod-eks` |
| `ghcr-token` | Username/password | GitHub username + PAT with package write access |
| `image-repository` | Secret text | `your-github-user/devops-portfolio` |
| `mysql-host` | Secret text | RDS endpoint |
| `mysql-database` | Secret text | `portfolio` |
| `mysql-username` | Secret text | `portfolio_admin` |
| `mysql-password` | Secret text | RDS password |

Required Jenkins tools on the agent:

- Docker
- AWS CLI
- kubectl
- Terraform, if you also run infrastructure stages from Jenkins

Recommended Jenkins plugins:

- Pipeline
- Git
- Credentials Binding
- Docker Pipeline
- Blue Ocean, optional
