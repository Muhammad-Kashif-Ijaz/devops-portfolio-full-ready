# AWS Prerequisites

Create or prepare these before production deployment:

1. AWS IAM user or role with permissions for EKS, EC2/VPC, RDS, IAM, S3, and DynamoDB.
2. S3 bucket for Terraform state.
3. DynamoDB table for Terraform locking.
4. Optional domain in Route 53.
5. ACM certificate in the same region as the load balancer.
6. AWS Load Balancer Controller installed in EKS after the cluster is created.
7. kubectl, awscli, terraform, docker, and git installed locally or on your Jenkins agent.

Terraform backend example:

```hcl
backend "s3" {
  bucket         = "your-terraform-state-bucket"
  key            = "portfolio/prod/terraform.tfstate"
  region         = "us-east-1"
  dynamodb_table = "your-terraform-lock-table"
  encrypt        = true
}
```

Update `terraform/aws/versions.tf` with your real backend names before running Terraform.
