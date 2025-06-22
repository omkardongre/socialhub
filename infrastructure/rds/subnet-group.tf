resource "aws_db_subnet_group" "main" {
  name       = "rds-main"
  subnet_ids = var.subnet_ids
  tags = {
    Name = "rds-main"
  }
}