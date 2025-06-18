# --- ECS Services ---
resource "aws_ecs_service" "auth_service" {
  name            = "auth-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.auth_service.arn
  desired_count   = 1
  launch_type     = "EC2"
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  service_registries {
    registry_arn = aws_service_discovery_service.auth_service.arn
  }
}

resource "aws_ecs_service" "user_service" {
  name            = "user-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.user_service.arn
  desired_count   = 1
  launch_type     = "EC2"
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  service_registries {
    registry_arn = aws_service_discovery_service.user_service.arn
  }
}

resource "aws_ecs_service" "post_service" {
  name            = "post-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.post_service.arn
  desired_count   = 1
  launch_type     = "EC2"
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  service_registries {
    registry_arn = aws_service_discovery_service.post_service.arn
  }
}

resource "aws_ecs_service" "media_service" {
  name            = "media-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.media_service.arn
  desired_count   = 1
  launch_type     = "EC2"
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  service_registries {
    registry_arn = aws_service_discovery_service.media_service.arn
  }
}

resource "aws_ecs_service" "notification_service" {
  name            = "notification-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.notification_service.arn
  desired_count   = 1
  launch_type     = "EC2"
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  service_registries {
    registry_arn = aws_service_discovery_service.notification_service.arn
  }
}

resource "aws_ecs_service" "chat_service" {
  name            = "chat-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.chat_service.arn
  desired_count   = 1
  launch_type     = "EC2"
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  service_registries {
    registry_arn = aws_service_discovery_service.chat_service.arn
  }
}

resource "aws_ecs_service" "api_gateway" {
  name            = "api-gateway"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api_gateway.arn
  desired_count   = 1
  launch_type     = "EC2"
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
}
