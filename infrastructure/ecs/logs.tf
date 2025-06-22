# --- CloudWatch Log Group for ECS Task Logging ---
resource "aws_cloudwatch_log_group" "ecs" {
  name              = var.ecs_log_group_name
  retention_in_days = var.ecs_log_retention
  tags = {
    Project = "socialhub"
  }
}

