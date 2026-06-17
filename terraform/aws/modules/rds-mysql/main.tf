locals {
  name = "${var.project_name}-${var.environment}-mysql"
}

resource "aws_security_group" "mysql" {
  name        = "${local.name}-sg"
  description = "Allow MySQL traffic from EKS nodes"
  vpc_id      = var.vpc_id
}

resource "aws_security_group_rule" "mysql_from_eks" {
  type                     = "ingress"
  from_port                = 3306
  to_port                  = 3306
  protocol                 = "tcp"
  security_group_id        = aws_security_group.mysql.id
  source_security_group_id = var.eks_node_sg_id
}

resource "aws_security_group_rule" "mysql_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.mysql.id
}

resource "aws_db_subnet_group" "this" {
  name       = "${local.name}-subnets"
  subnet_ids = var.private_subnet_ids
}

resource "aws_db_instance" "this" {
  identifier                = local.name
  engine                    = "mysql"
  engine_version            = "8.4"
  instance_class            = var.db_instance_class
  allocated_storage         = var.db_allocated_storage
  db_name                   = var.db_name
  username                  = var.db_username
  password                  = var.db_password
  db_subnet_group_name      = aws_db_subnet_group.this.name
  vpc_security_group_ids    = [aws_security_group.mysql.id]
  storage_encrypted         = true
  backup_retention_period   = var.backup_retention_days
  skip_final_snapshot       = false
  final_snapshot_identifier = "${local.name}-final"
  publicly_accessible       = false
  deletion_protection       = true
}
