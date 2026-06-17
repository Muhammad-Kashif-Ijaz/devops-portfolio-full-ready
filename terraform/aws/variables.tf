variable "project_name" {
  type        = string
  description = "Short project name used for AWS resource names."
  default     = "devops-portfolio"
}

variable "environment" {
  type        = string
  description = "Deployment environment."
  default     = "prod"
}

variable "aws_region" {
  type        = string
  description = "AWS region."
  default     = "us-east-1"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the portfolio VPC."
  default     = "10.40.0.0/16"
}

variable "az_count" {
  type        = number
  description = "Number of availability zones."
  default     = 2
}

variable "kubernetes_version" {
  type        = string
  description = "EKS Kubernetes version."
  default     = "1.30"
}

variable "node_instance_type" {
  type        = string
  description = "EKS worker node instance type."
  default     = "t3.medium"
}

variable "node_desired_size" {
  type    = number
  default = 2
}

variable "node_min_size" {
  type    = number
  default = 1
}

variable "node_max_size" {
  type    = number
  default = 4
}

variable "mysql_database" {
  type        = string
  description = "MySQL database name."
  default     = "portfolio"
}

variable "mysql_username" {
  type        = string
  description = "MySQL admin username."
  default     = "portfolio_admin"
}

variable "mysql_password" {
  type        = string
  description = "MySQL admin password. Pass with TF_VAR_mysql_password or a tfvars file that is not committed."
  sensitive   = true
}

variable "mysql_instance_class" {
  type        = string
  description = "RDS MySQL instance class."
  default     = "db.t4g.micro"
}

variable "mysql_allocated_storage" {
  type        = number
  description = "RDS allocated storage in GB."
  default     = 20
}

variable "mysql_backup_retention_days" {
  type        = number
  description = "RDS backup retention period."
  default     = 7
}
