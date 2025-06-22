# --- ECS Task Definitions ---

locals {
  log_group_name = aws_cloudwatch_log_group.ecs.name
  repo_creds_arn = data.aws_secretsmanager_secret.ghcr.arn
  env_files_bucket = var.env_files_bucket
}

data "aws_secretsmanager_secret" "ghcr" {
  name = "ghcr-credentials-alt"
}

resource "aws_ecs_task_definition" "auth_service" {
  family                   = "auth-service-task"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions    = jsonencode([
    {
      name             = "auth-service"
      image            = "ghcr.io/omkardongre/auth-service:latest"
      essential        = true
      portMappings     = [{ containerPort = 3000, hostPort = 3001 }]
      environmentFiles = [{ value = "arn:aws:s3:::${local.env_files_bucket}/auth-service.env", type = "s3" }]
      cpu              = tonumber(var.ecs_task_cpu)
      memory           = tonumber(var.ecs_task_memory)
      repositoryCredentials = {
        credentialsParameter = local.repo_creds_arn
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = local.log_group_name
          awslogs-region        = var.awslogs_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "user_service" {
  family                   = "user-service-task"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions    = jsonencode([
    {
      name             = "user-service"
      image            = "ghcr.io/omkardongre/user-service:latest"
      essential        = true
      portMappings     = [{ containerPort = 3000, hostPort = 3002 }]
      environmentFiles = [{ value = "arn:aws:s3:::${local.env_files_bucket}/user-service.env", type = "s3" }]
      cpu              = tonumber(var.ecs_task_cpu)
      memory           = tonumber(var.ecs_task_memory)
      repositoryCredentials = {
        credentialsParameter = local.repo_creds_arn
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = local.log_group_name
          awslogs-region        = var.awslogs_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "post_service" {
  family                   = "post-service-task"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions    = jsonencode([
    {
      name             = "post-service"
      image            = "ghcr.io/omkardongre/post-service:latest"
      essential        = true
      portMappings     = [{ containerPort = 3000, hostPort = 3003 }]
      environmentFiles = [{ value = "arn:aws:s3:::${local.env_files_bucket}/post-service.env", type = "s3" }]
      cpu              = tonumber(var.ecs_task_cpu)
      memory           = tonumber(var.ecs_task_memory)
      repositoryCredentials = {
        credentialsParameter = local.repo_creds_arn
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = local.log_group_name
          awslogs-region        = var.awslogs_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "media_service" {
  family                   = "media-service-task"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions    = jsonencode([
    {
      name             = "media-service"
      image            = "ghcr.io/omkardongre/media-service:latest"
      essential        = true
      portMappings     = [{ containerPort = 3000, hostPort = 3004 }]
      environmentFiles = [{ value = "arn:aws:s3:::${local.env_files_bucket}/media-service.env", type = "s3" }]
      cpu              = tonumber(var.ecs_task_cpu)
      memory           = tonumber(var.ecs_task_memory)
      repositoryCredentials = {
        credentialsParameter = local.repo_creds_arn
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = local.log_group_name
          awslogs-region        = var.awslogs_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "notification_service" {
  family                   = "notification-service-task"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions    = jsonencode([
    {
      name             = "notification-service"
      image            = "ghcr.io/omkardongre/notification-service:latest"
      essential        = true
      portMappings     = [{ containerPort = 3000, hostPort = 3005 }]
      environmentFiles = [{ value = "arn:aws:s3:::${local.env_files_bucket}/notification-service.env", type = "s3" }]
      cpu              = tonumber(var.ecs_task_cpu)
      memory           = tonumber(var.ecs_task_memory)
      repositoryCredentials = {
        credentialsParameter = local.repo_creds_arn
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = local.log_group_name
          awslogs-region        = var.awslogs_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "chat_service" {
  family                   = "chat-service-task"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions    = jsonencode([
    {
      name             = "chat-service"
      image            = "ghcr.io/omkardongre/chat-service:latest"
      essential        = true
      portMappings     = [{ containerPort = 3000, hostPort = 3006 }]
      environmentFiles = [{ value = "arn:aws:s3:::${local.env_files_bucket}/chat-service.env", type = "s3" }]
      cpu              = tonumber(var.ecs_task_cpu)
      memory           = tonumber(var.ecs_task_memory)
      repositoryCredentials = {
        credentialsParameter = local.repo_creds_arn
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = local.log_group_name
          awslogs-region        = var.awslogs_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "api_gateway" {
  family                   = "api-gateway-task"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions    = jsonencode([
    {
      name             = "api-gateway"
      image            = "ghcr.io/omkardongre/api-gateway:latest"
      essential        = true
      portMappings     = [{ containerPort = 8082, hostPort = 8082 }]
      environmentFiles = [{ value = "arn:aws:s3:::${local.env_files_bucket}/api-gateway.env", type = "s3" }]
      cpu              = tonumber(var.ecs_task_cpu)
      memory           = tonumber(var.ecs_task_memory)
      repositoryCredentials = {
        credentialsParameter = local.repo_creds_arn
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = local.log_group_name
          awslogs-region        = var.awslogs_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}
