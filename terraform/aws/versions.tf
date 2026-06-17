terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "replace-with-your-terraform-state-bucket"
    key            = "portfolio/prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "replace-with-your-terraform-lock-table"
    encrypt        = true
  }
}
