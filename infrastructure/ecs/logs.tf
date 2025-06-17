# --- CloudWatch Log Group for ECS Task Logging ---
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/socialhub"
  retention_in_days = 7
}
