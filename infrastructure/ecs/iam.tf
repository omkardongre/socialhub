# --- IAM Role for ECS EC2 Instances ---
resource "aws_iam_role" "ecs_instance_role" {
  # IAM Role for ECS EC2 Instances

  name = "socialhub-ecsInstanceRole"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "ec2.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
  tags = {
    Project     = "socialhub"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "ecs_instance_role_policy" {
  # Attach ECS instance role policy
  role       = aws_iam_role.ecs_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs_instance_profile" {
  # Instance profile for ECS EC2
  name = "ecsInstanceProfile"
  role = aws_iam_role.ecs_instance_role.name
  tags = {
    Project     = "socialhub"
    Environment = var.environment
  }
}

# --- ECS Task Execution Role (for pulling images, S3 env files, secrets, logging) ---
resource "aws_iam_role" "ecs_task_execution_role" {
  # ECS Task Execution Role (pull images, S3, secrets, logging)
  name = "socialhub-ecsTaskExecutionRole"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
  tags = {
    Project     = "socialhub"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_ecs_policy" {
  # Attach ECS task execution role policy
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_s3_policy" {
  # Attach S3 FullAccess for ECS task execution
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_secrets_policy" {
  # Attach SecretsManager FullAccess for ECS task execution
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
}
