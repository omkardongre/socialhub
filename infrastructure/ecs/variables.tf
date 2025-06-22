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
  default     = "160"
}

variable "awslogs_region" {
  description = "AWS region for CloudWatch logging"
  type        = string
  default     = "us-east-1"
}

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
  default     = "socialhub-key"
}
