output "db_endpoint" {
  description = "The endpoint of the RDS instance"
  value       = aws_db_instance.postgres.endpoint
}

output "db_instance_id" {
  description = "The RDS instance ID"
  value       = aws_db_instance.postgres.id
}

output "rds_security_group_id" {
  description = "The security group ID for RDS"
  value       = aws_security_group.rds.id
}
