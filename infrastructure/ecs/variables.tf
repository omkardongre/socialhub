variable "allowed_ssh_cidr" {
  description = "CIDR block allowed to SSH (port 22)"
  type        = string
  default     = "0.0.0.0/0"  # TODO: replace with your IP
}

variable "ecs_log_group_name" {
  description = "Name of the CloudWatch log group for ECS"
  type        = string
  default     = "/ecs/socialhub"
}

variable "ecs_log_retention" {
  description = "Log retention in days"
  type        = number
  default     = 7
}

variable "environment" {
  description = "Deployment environment (e.g. dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
  default     = "socialhub-ecs-cluster"
}

variable "ecs_task_cpu" {
  description = "Default CPU for ECS tasks"
  type        = string
  default     = "128"
}

variable "ecs_task_memory" {
  description = "Default memory for ECS tasks"
  type        = string
  default     = "136"
}

#variable "awslogs_region" {
#  description = "AWS region for CloudWatch logging"
#  type        = string
#  default     = "us-east-1"
#}

variable "vpc_id" {
  description = "VPC ID for ECS resources"
  type        = string
}

variable "vpc_cidr_block" {
  description = "VPC CIDR block for security group rules"
  type        = string
}

variable "public_subnet_a_id" {
  description = "Public subnet A ID for ECS EC2 instance"
  type        = string
}

variable "env_files_bucket" {
  description = "S3 bucket for environment files"
  type        = string
}

variable "ecs_instance_type" {
  description = "EC2 instance type for ECS"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "EC2 Key Pair name"
  type        = string
}

variable "repo_creds_arn" {
  description = "ARN of the GHCR credentials secret"
  type        = string
}

variable "auth_service_image_tag" {
  description = "Image tag for auth-service"
  type        = string
}

variable "user_service_image_tag" {
  description = "Image tag for user-service"
  type        = string
}

variable "post_service_image_tag" {
  description = "Image tag for post-service"
  type        = string
}

variable "notification_service_image_tag" {
  description = "Image tag for notification-service"
  type        = string
}

variable "chat_service_image_tag" {
  description = "Image tag for chat-service"
  type        = string
}

variable "media_service_image_tag" {
  description = "Image tag for media-service"
  type        = string
}

variable "api_gateway_image_tag" {
  description = "Image tag for api-gateway"
  type        = string
}

locals {
  # log_group_name = aws_cloudwatch_log_group.ecs.name
  repo_creds_arn = var.repo_creds_arn
  env_files_bucket = var.env_files_bucket
  auth_service_image = "ghcr.io/omkardongre/auth-service:${var.auth_service_image_tag}"
  user_service_image = "ghcr.io/omkardongre/user-service:${var.user_service_image_tag}"
  post_service_image = "ghcr.io/omkardongre/post-service:${var.post_service_image_tag}"
  notification_service_image = "ghcr.io/omkardongre/notification-service:${var.notification_service_image_tag}"
  chat_service_image = "ghcr.io/omkardongre/chat-service:${var.chat_service_image_tag}"
  media_service_image = "ghcr.io/omkardongre/media-service:${var.media_service_image_tag}"
  api_gateway_image = "ghcr.io/omkardongre/api-gateway:${var.api_gateway_image_tag}"
}
