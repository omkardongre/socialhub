resource "aws_db_instance" "postgres" {
  identifier              = "socialhub-db"
  allocated_storage       = 20
  engine                  = var.db_engine
  engine_version          = var.db_engine_version
  instance_class          = var.db_instance_class
  username                = var.db_username
  password                = var.db_password
  port                    = 5432
  publicly_accessible     = true
  skip_final_snapshot     = true
  db_subnet_group_name    = aws_db_subnet_group.main.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  apply_immediately       = true
  storage_type            = "gp2"
  backup_retention_period = 1
  db_name                 = var.db_name

  tags = {
    Name = "socialhub-db"
  }
}
