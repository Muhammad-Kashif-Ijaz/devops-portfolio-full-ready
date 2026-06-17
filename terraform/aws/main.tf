module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
  az_count     = var.az_count
}

module "eks" {
  source = "./modules/eks"

  project_name       = var.project_name
  environment        = var.environment
  kubernetes_version = var.kubernetes_version
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  node_instance_type = var.node_instance_type
  node_desired_size  = var.node_desired_size
  node_min_size      = var.node_min_size
  node_max_size      = var.node_max_size
}

module "rds_mysql" {
  source = "./modules/rds-mysql"

  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  private_subnet_ids    = module.vpc.private_subnet_ids
  eks_node_sg_id        = module.eks.node_security_group_id
  db_name               = var.mysql_database
  db_username           = var.mysql_username
  db_password           = var.mysql_password
  db_instance_class     = var.mysql_instance_class
  db_allocated_storage  = var.mysql_allocated_storage
  backup_retention_days = var.mysql_backup_retention_days
}
