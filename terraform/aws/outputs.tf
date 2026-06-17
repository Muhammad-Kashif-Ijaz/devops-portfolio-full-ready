output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_update_kubeconfig_command" {
  value = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}

output "mysql_endpoint" {
  value = module.rds_mysql.endpoint
}

output "private_subnet_ids" {
  value = module.vpc.private_subnet_ids
}
