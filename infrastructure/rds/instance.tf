resource "aws_db_instance" "postgres" {
  identifier              = "socialhub-db"
  allocated_storage       = 20
  engine                  = "postgres"
  engine_version          = "17.4"
  instance_class          = "db.t3.micro"
  username                = "postgres"
  password                = "8446111598"
  port                    = 5432
  publicly_accessible     = true
  skip_final_snapshot     = true
  db_subnet_group_name    = aws_db_subnet_group.main.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  apply_immediately       = true
  storage_type            = "gp2"
  backup_retention_period = 1

  tags = {
    Name = "socialhub-db"
  }
}

