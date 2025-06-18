resource "aws_db_subnet_group" "main" {
  name       = "rds-main"
  subnet_ids = [
    data.aws_subnet.public_subnet_a.id,
    data.aws_subnet.public_subnet_b.id
  ]
  tags = {
    Name = "rds-main"
  }
}
