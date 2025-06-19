# --- ECS Services ---
resource "aws_ecs_service" "auth_service" {
  name            = "auth-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.auth_service.arn
  desired_count   = 1
  launch_type     = "EC2"
  enable_execute_command = true
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  service_registries {
    registry_arn   = aws_service_discovery_service.auth_service.arn
    container_name = "auth-service"
    container_port = 3000
  }
}

resource "aws_ecs_service" "user_service" {
  name            = "user-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.user_service.arn
  desired_count   = 1
  launch_type     = "EC2"
  enable_execute_command = true
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  service_registries {
    registry_arn   = aws_service_discovery_service.user_service.arn
    container_name = "user-service"
    container_port = 3000
  }
}

resource "aws_ecs_service" "post_service" {
  name            = "post-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.post_service.arn
  desired_count   = 1
  launch_type     = "EC2"
  enable_execute_command = true
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  service_registries {
    registry_arn   = aws_service_discovery_service.post_service.arn
    container_name = "post-service"
    container_port = 3000
  }
}

resource "aws_ecs_service" "media_service" {
  name            = "media-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.media_service.arn
  desired_count   = 1
  launch_type     = "EC2"
  enable_execute_command = true
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  service_registries {
    registry_arn   = aws_service_discovery_service.media_service.arn
    container_name = "media-service"
    container_port = 3000
  }
}

resource "aws_ecs_service" "notification_service" {
  name            = "notification-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.notification_service.arn
  desired_count   = 1
  launch_type     = "EC2"
  enable_execute_command = true
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  service_registries {
    registry_arn   = aws_service_discovery_service.notification_service.arn
    container_name = "notification-service"
    container_port = 3000
  }
}

resource "aws_ecs_service" "chat_service" {
  name            = "chat-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.chat_service.arn
  desired_count   = 1
  launch_type     = "EC2"
  enable_execute_command = true
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  service_registries {
    registry_arn   = aws_service_discovery_service.chat_service.arn
    container_name = "chat-service"
    container_port = 3000
  }
}

resource "aws_ecs_service" "api_gateway" {
  name            = "api-gateway"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api_gateway.arn
  desired_count   = 1
  launch_type     = "EC2"
  enable_execute_command = true
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
}
