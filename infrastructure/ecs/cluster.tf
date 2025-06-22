# --- ECS Cluster ---
resource "aws_ecs_cluster" "main" {
  name = var.ecs_cluster_name

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = var.ecs_cluster_name
    Project     = "socialhub"
    Environment = var.environment
  }
}

output "ecs_cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = aws_ecs_cluster.main.arn
}

