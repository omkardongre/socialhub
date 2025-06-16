# --- ECS Cluster ---
resource "aws_ecs_cluster" "main" {
  name = "socialhub-ecs-cluster"
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  tags = {
    Name = "socialhub-ecs-cluster"
  }
}
