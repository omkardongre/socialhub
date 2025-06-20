# --- ECS Task Definitions ---

data "aws_secretsmanager_secret" "ghcr" {
  name = "ghcr-credentials-alt"
}

resource "aws_ecs_task_definition" "auth_service" {
  family                   = "auth-service-task"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  cpu                      = "128"
  memory                   = "160"
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions    = jsonencode([
    {
      name             = "auth-service"
      image            = "ghcr.io/omkardongre/auth-service:latest"
      essential        = true
      portMappings     = [{ containerPort = 3000, hostPort = 3001 }]
      environmentFiles = [{ value = "arn:aws:s3:::socialhub-env-files/auth-service.env", type = "s3" }]
      cpu              = 128
      memory           = 160
      repositoryCredentials = {
        credentialsParameter = data.aws_secretsmanager_secret.ghcr.arn
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = "us-east-1"
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
  cpu                      = "128"
  memory                   = "160"
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions    = jsonencode([
    {
      name             = "user-service"
      image            = "ghcr.io/omkardongre/user-service:latest"
      essential        = true
      portMappings     = [{ containerPort = 3000, hostPort = 3002 }]
      environmentFiles = [{ value = "arn:aws:s3:::socialhub-env-files/user-service.env", type = "s3" }]
      cpu              = 128
      memory           = 160
      repositoryCredentials = {
        credentialsParameter = data.aws_secretsmanager_secret.ghcr.arn
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = "us-east-1"
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
  cpu                      = "128"
  memory                   = "160"
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions    = jsonencode([
    {
      name             = "post-service"
      image            = "ghcr.io/omkardongre/post-service:latest"
      essential        = true
      portMappings     = [{ containerPort = 3000, hostPort = 3003 }]
      environmentFiles = [{ value = "arn:aws:s3:::socialhub-env-files/post-service.env", type = "s3" }]
      cpu              = 128
      memory           = 160
      repositoryCredentials = {
        credentialsParameter = data.aws_secretsmanager_secret.ghcr.arn
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = "us-east-1"
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
  cpu                      = "128"
  memory                   = "160"
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions    = jsonencode([
    {
      name             = "media-service"
      image            = "ghcr.io/omkardongre/media-service:latest"
      essential        = true
      portMappings     = [{ containerPort = 3000, hostPort = 3004 }]
      environmentFiles = [{ value = "arn:aws:s3:::socialhub-env-files/media-service.env", type = "s3" }]
      cpu              = 128
      memory           = 160
      repositoryCredentials = {
        credentialsParameter = data.aws_secretsmanager_secret.ghcr.arn
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = "us-east-1"
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
  cpu                      = "128"
  memory                   = "160"
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions    = jsonencode([
    {
      name             = "notification-service"
      image            = "ghcr.io/omkardongre/notification-service:latest"
      essential        = true
      portMappings     = [{ containerPort = 3000, hostPort = 3005 }]
      environmentFiles = [{ value = "arn:aws:s3:::socialhub-env-files/notification-service.env", type = "s3" }]
      cpu              = 128
      memory           = 160
      repositoryCredentials = {
        credentialsParameter = data.aws_secretsmanager_secret.ghcr.arn
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = "us-east-1"
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
  cpu                      = "128"
  memory                   = "160"
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions    = jsonencode([
    {
      name             = "chat-service"
      image            = "ghcr.io/omkardongre/chat-service:latest"
      essential        = true
      portMappings     = [{ containerPort = 3000, hostPort = 3006 }]
      environmentFiles = [{ value = "arn:aws:s3:::socialhub-env-files/chat-service.env", type = "s3" }]
      cpu              = 128
      memory           = 160
      repositoryCredentials = {
        credentialsParameter = data.aws_secretsmanager_secret.ghcr.arn
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = "us-east-1"
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
  cpu                      = "128"
  memory                   = "160"
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions    = jsonencode([
    {
      name             = "api-gateway"
      image            = "ghcr.io/omkardongre/api-gateway:latest"
      essential        = true
      portMappings     = [{ containerPort = 8082, hostPort = 8082 }]
      environmentFiles = [{ value = "arn:aws:s3:::socialhub-env-files/api-gateway.env", type = "s3" }]
      cpu              = 128
      memory           = 160
      repositoryCredentials = {
        credentialsParameter = data.aws_secretsmanager_secret.ghcr.arn
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = "us-east-1"
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}
